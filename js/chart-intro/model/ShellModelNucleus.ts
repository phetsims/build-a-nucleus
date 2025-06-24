// Copyright 2022-2025, University of Colorado Boulder

/**
 * A model element that represents a nucleus that is made up of protons and neutrons. This model element
 * manages the positions and motion of all particles that are a part of the nucleus.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Particle, { ParticleTypeString } from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import BANParticle from '../../common/model/BANParticle.js';
import ParticleType from '../../common/model/ParticleType.js';
import EnergyLevelType from './EnergyLevelType.js';

// types
export type ParticleShellPosition = {
  particle?: Particle;
  xPosition: number; // 0 - 5
  type: ParticleType;
};

// constants
export const N_ZERO_CAPACITY = EnergyLevelType.N_ZERO.capacity;
export const N_ONE_CAPACITY = EnergyLevelType.N_ONE.capacity;

// Constants for the MVT that place nucleons in their individual spaced apart array positions.
const PARTICLE_RADIUS = BANConstants.PARTICLE_RADIUS;
const PARTICLE_DIAMETER = BANConstants.PARTICLE_DIAMETER;
const PARTICLE_X_SPACING = PARTICLE_RADIUS;
const NUMBER_OF_ENERGY_LEVELS = 3;
const NUMBER_OF_Y_SPACINGS = NUMBER_OF_ENERGY_LEVELS - 1;
const PARTICLE_Y_SPACING = PARTICLE_DIAMETER * 4;

// Have one less space than there are particles.
const NUMBER_OF_RADII_SPACES_BETWEEN_PARTICLES = N_ONE_CAPACITY - 1;

// This transform maps from arbitrary particle positions in the ShellModelNucleus (see ALLOWED_PARTICLE_POSITIONS) to
// actual model/view positions to be rendered. This is private because model units in this sim are the same as
// view units, and this is just for ease of this class's implementation.
const PARTICLE_POSITIONING_TRANSFORM = ModelViewTransform2.createRectangleInvertedYMapping(
  new Bounds2( 0, 0, NUMBER_OF_RADII_SPACES_BETWEEN_PARTICLES, 2 ),
  new Bounds2( 0, 0, ( PARTICLE_DIAMETER + PARTICLE_X_SPACING ) * NUMBER_OF_RADII_SPACES_BETWEEN_PARTICLES,
    ( PARTICLE_DIAMETER + PARTICLE_Y_SPACING ) * NUMBER_OF_Y_SPACINGS ) );


// Row is yPosition, number is xPosition.
const ALLOWED_PARTICLE_POSITIONS = [
  [ 2, 3 ],
  [ 0, 1, 2, 3, 4, 5 ],
  [ 0, 1, 2, 3, 4, 5 ]
];
assert && assert( ALLOWED_PARTICLE_POSITIONS.length === EnergyLevelType.ENERGY_LEVELS.length, 'Energy levels should match' );

for ( let i = 0; i < EnergyLevelType.ENERGY_LEVELS.length; i++ ) {
  const energyLevel = EnergyLevelType.ENERGY_LEVELS[ i ];
  assert && assert( ALLOWED_PARTICLE_POSITIONS[ i ].length === energyLevel.capacity, `n${i} capacity spots check` );
}

class ShellModelNucleus extends ParticleAtom {

  // Allowed proton positions.
  public readonly protonShellPositions: ParticleShellPosition[][] = [ [], [], [] ];

  // Allowed neutron positions.
  public readonly neutronShellPositions: ParticleShellPosition[][] = [ [], [], [] ];

  // Positions particles on the energy levels.
  public readonly modelViewTransform = PARTICLE_POSITIONING_TRANSFORM;

  // Keeps track of bound levels.
  private readonly protonsLevelProperty = new EnumerationProperty( EnergyLevelType.N_ZERO );
  private readonly neutronsLevelProperty = new EnumerationProperty( EnergyLevelType.N_ZERO );

  public constructor() {
    super( {
      tandem: Tandem.OPT_OUT // Opt out for now until phet-io is implemented.
    } );

    // Initialize the positions for where a nucleon can be placed.
    for ( let i = 0; i < ALLOWED_PARTICLE_POSITIONS.length; i++ ) {
      for ( let j = 0; j < ALLOWED_PARTICLE_POSITIONS[ i ].length; j++ ) {
        this.protonShellPositions[ i ][ ALLOWED_PARTICLE_POSITIONS[ i ][ j ] ] = {
          xPosition: ALLOWED_PARTICLE_POSITIONS[ i ][ j ],
          type: ParticleType.PROTON
        };
        this.neutronShellPositions[ i ][ ALLOWED_PARTICLE_POSITIONS[ i ][ j ] ] = {
          xPosition: ALLOWED_PARTICLE_POSITIONS[ i ][ j ],
          type: ParticleType.NEUTRON
        };
      }
    }

    // Updates bound levels based on nucleon numbers.
    const createLevelPropertyListener = ( nucleonCountProperty: TReadOnlyProperty<number>,
                                          nucleonLevelProperty: EnumerationProperty<EnergyLevelType> ) => {
      nucleonCountProperty.link( nucleonNumber => {
        if ( nucleonNumber > N_ZERO_CAPACITY + N_ONE_CAPACITY ) {
          nucleonLevelProperty.value = EnergyLevelType.N_TWO;
        }
        else if ( nucleonNumber > N_ZERO_CAPACITY ) {
          nucleonLevelProperty.value = EnergyLevelType.N_ONE;
        }
        else {
          nucleonLevelProperty.value = EnergyLevelType.N_ZERO;
        }
      } );
    };
    createLevelPropertyListener( this.protonCountProperty, this.protonsLevelProperty );
    createLevelPropertyListener( this.neutronCountProperty, this.neutronsLevelProperty );

    // Updates nucleon positions when the level state changes.
    this.protonsLevelProperty.link( () =>
      this.updateNucleonPositions( this.protons, this.protonShellPositions, this.protonsLevelProperty, 0 ) );
    this.neutronsLevelProperty.link( () =>
      this.updateNucleonPositions( this.neutrons, this.neutronShellPositions, this.neutronsLevelProperty,
        BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS ) );
  }

  /**
   * Return the shell positions array for the given particleType.
   */
  private getNucleonShellPositions( particleType: ParticleType | ParticleTypeString ): ParticleShellPosition[][] {
    return particleType === ParticleType.NEUTRON || particleType === ParticleType.NEUTRON.particleTypeString ?
           this.neutronShellPositions : this.protonShellPositions;
  }

  /**
   * Return the right-most particle from the highest energy level that contains particles, if there is one.
   * Otherwise, return undefined.
   */
  public getLastParticleInShell( particleType: ParticleType ): Particle | undefined {
    const nucleonShellPositions = this.getNucleonShellPositions( particleType );
    for ( let i = nucleonShellPositions.length - 1; i >= 0; i-- ) {
      const nucleonShellRow = nucleonShellPositions[ i ];
      for ( let j = nucleonShellRow.length - 1; j >= 0; j-- ) {
        if ( nucleonShellRow[ j ].particle !== undefined ) {
          return nucleonShellRow[ j ].particle;
        }
      }
    }
    return undefined;
  }

  /**
   * Return the view destination of the next open position for the given particleType shell positions and set the
   * particle on that open shell position, even though it is not yet 'counted' as part of the particleAtom.
   */
  public getParticleDestination( particleType: ParticleType, particle: Particle ): Vector2 {
    const nucleonShellPositions = this.getNucleonShellPositions( particleType );
    let yPosition = EnergyLevelType.N_ZERO.yPosition; // initialize to the lowest shell where yPosition = 0

    const openNucleonShellPositions = nucleonShellPositions.map(
      particleShellRow => {

        // Remove any empty particleShellPosition's from particleShellRow.
        const noEmptyPositions = particleShellRow.filter(
          particleShellPosition => particleShellPosition !== undefined );

        // Get the first open shell position in this particleShellRow.
        return noEmptyPositions.find(
          particleShellPosition => particleShellPosition.particle === undefined );
      } );

    // Get the first open shell position available from all rows.
    const openParticleShellPosition = openNucleonShellPositions.find(
      ( particleShellPosition, index ) => {
        yPosition = index;
        return particleShellPosition !== undefined;
      } );

    assert && assert( openParticleShellPosition, 'To add a particle there must be an empty particleShellPosition.' );

    // Add particle to the openParticleShellPosition.
    openParticleShellPosition!.particle = particle;

    const viewDestination = this.modelViewTransform.modelToViewXY( openParticleShellPosition!.xPosition, yPosition );

    // Add x offset for neutron particle to be aligned with its energy level position.
    viewDestination.addXY( particleType === ParticleType.NEUTRON ? BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS : 0, 0 );
    return viewDestination;
  }

  /**
   * Update all proton and neutron positions in their energy levels.
   */
  public override reconfigureNucleus(): void {
    this.updateNucleonPositions( this.protons, this.protonShellPositions, this.protonsLevelProperty, 0 );
    this.updateNucleonPositions( this.neutrons, this.neutronShellPositions, this.neutronsLevelProperty,
      BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS );
  }

  /**
   * Remove the particle's placement in the shell and from the ParticleAtom.
   * We need to remove from the shell here too since sometimes a particle is not a part of the ParticleAtom, but it does
   * have a shell position here in the ShellModelNucleus.
   */
  public override removeParticle( particle: Particle ): void {
    this.removeParticleFromShell( particle );
    super.removeParticle( particle );
  }

  /**
   * Remove the given particle from its shell position, if it is a part of its corresponding shellPositions.
   */
  public removeParticleFromShell( particle: Particle ): void {
    const nucleonShellPositions = this.getNucleonShellPositions( particle.type );
    nucleonShellPositions.forEach( nucleonShellRow => {
      nucleonShellRow.forEach( nucleonShellPosition => {
        if ( nucleonShellPosition.particle === particle ) {
          nucleonShellPosition.particle = undefined;
        }
      } );
    } );
  }

  /**
   * Remove all nucleons from their shell positions and from the particleAtom without reconfiguring the nucleus.
   */
  public override clear(): void {
    this.protonsLevelProperty.reset();
    this.neutronsLevelProperty.reset();

    // Clear all particles that have a set shell position but may not be in the ParticleAtom.
    this.clearAllShellPositionParticles( this.protonShellPositions );
    this.clearAllShellPositionParticles( this.neutronShellPositions );
    super.clear();
  }

  /**
   * Remove all particles from nucleonShellPositions.
   */
  private clearAllShellPositionParticles( nucleonShellPositions: ParticleShellPosition[][] ): void {
    nucleonShellPositions.forEach( nucleonShellRow => {
      nucleonShellRow.forEach( nucleonShellPosition => {
        if ( nucleonShellPosition.particle ) {
          nucleonShellPosition.particle = undefined;
        }
      } );
    } );
  }

  /**
   * Fill all nucleons in open positions from bottom to top, left to right.
   * xOffset is added in the x direction so neutron particles are aligned with their energy levels.
   */
  private updateNucleonPositions( particleArray: ObservableArray<BANParticle>,
                                  particleShellPositions: ParticleShellPosition[][],
                                  levelFillProperty: EnumerationProperty<EnergyLevelType>,
                                  xOffset: number ): void {

    // keep track of incomingParticles where a shell position is being held for them, but it's not in particleArray yet
    const incomingParticles: Particle[] = [];

    // clear out all shell positions
    particleShellPositions.forEach( particleShellPositionsRow => {
      particleShellPositionsRow.forEach( particleShellPosition => {

        // keep track of incoming particle position holders to add later
        if ( particleShellPosition.particle && !particleArray.includes( particleShellPosition.particle ) ) {
          incomingParticles.push( particleShellPosition.particle );
        }
        particleShellPosition.particle = undefined;
      } );
    } );

    // Width in view coordinates of the n1/n2 energy level, which is the same as the other two levels (though the n0
    // energy level line is drawn shorter - see NucleonShellView for details).
    const n1levelWidth =
      this.modelViewTransform.modelToViewX( ALLOWED_PARTICLE_POSITIONS[ 1 ][ ALLOWED_PARTICLE_POSITIONS[ 1 ].length - 1 ] )
      - this.modelViewTransform.modelToViewX( ALLOWED_PARTICLE_POSITIONS[ 1 ][ 0 ] );

    // add all particles in particleArray to the particleShellPositions
    particleArray.forEach( ( particle, index ) => {
      const yPosition = EnergyLevelType.getForIndex( index ).yPosition;
      const xPosition = this.getLocalXIndex( index, yPosition );

      const nucleonShellPosition = particleShellPositions[ yPosition ][ xPosition ];

      nucleonShellPosition.particle = particle;

      let viewDestination;
      let inputEnabled;

      // If the yPosition of the levelFillProperty is higher than the current yPosition level, 'bind' the particles in
      // this level by removing the spaces between them.
      if ( yPosition < levelFillProperty.value.yPosition ) {

        // Last level (yPosition === 2) never bounds so don't need levelIndex condition for it.
        const levelIndex = yPosition === EnergyLevelType.N_ZERO.yPosition ? index : index - N_ZERO_CAPACITY;

        // Amount each particle moves so the space between it and the particle on its left is removed.
        const boundOffset = n1levelWidth *
                            ( levelIndex / ( 3 * N_ONE_CAPACITY - 1 ) ); // 3 radius spaces / particle * 5 particle spaces

        // Each particle on the level has one 'particle radius' space except for one.
        // There are 2 particles on the y = 0 level and 6 particles on the y = 1 level.
        const numberOfRadiusSpaces = yPosition === EnergyLevelType.N_ZERO.yPosition ?
                                     N_ZERO_CAPACITY - 1 : N_ONE_CAPACITY - 1;

        // Amount each particle has to move for all particles to be centered in middle of energy level.
        const centerOffset = BANConstants.PARTICLE_RADIUS * numberOfRadiusSpaces / 2;

        const unBoundXPosition = this.modelViewTransform.modelToViewX( nucleonShellPosition.xPosition ) + xOffset;

        const destinationX = unBoundXPosition - boundOffset + centerOffset;

        viewDestination = new Vector2( destinationX, this.modelViewTransform.modelToViewY( yPosition ) );
        inputEnabled = false;
      }
      else {
        viewDestination = this.modelViewTransform.modelToViewXY( nucleonShellPosition.xPosition, yPosition );
        viewDestination.addXY( xOffset, 0 );
        inputEnabled = true;
      }

      BANParticle.setAnimationDestination( particle, viewDestination );
      particle.inputEnabledProperty.value = inputEnabled;
    } );

    // check that no particles are being duplicated in particleShellPositions
    if ( assert ) {
      const particleShellPositionsParticles = particleShellPositions.flat()
        .map( particleShellPosition => particleShellPosition.particle )
        .filter( particle => particle && !incomingParticles.includes( particle ) );

      assert && assert( _.uniq( particleShellPositionsParticles ).length === particleShellPositionsParticles.length,
        'There are duplicate particles in particleShellPositions: ', particleShellPositions );
    }

    // now put back in the incoming particles that had positions held for them in shell positions
    incomingParticles.forEach( particle => {

      // Don't use setAnimationDestination because we don't want to alter the velocity mid animation.
      particle.destinationProperty.value = this.getParticleDestination(
        ParticleType.getParticleTypeFromStringType( particle.type ), particle );
    } );
  }

  /**
   * Get the "local" position for x placement on the yPosition EnergyLevel the index belongs to.
   */
  private getLocalXIndex( index: number, yPosition: number ): number {
    let indexForLevel = index;
    let nextLowerYIndex = yPosition - 1;
    while ( nextLowerYIndex >= 0 ) {
      indexForLevel -= ALLOWED_PARTICLE_POSITIONS[ nextLowerYIndex ].length;
      nextLowerYIndex -= 1;
    }
    return ALLOWED_PARTICLE_POSITIONS[ yPosition ][ indexForLevel ];
  }
}

buildANucleus.register( 'ShellModelNucleus', ShellModelNucleus );
export default ShellModelNucleus;
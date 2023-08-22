// Copyright 2022-2023, University of Colorado Boulder

/**
 * A model element that represents a nucleus that is made up of protons and neutrons. This model element
 * manages the positions and motion of all particles that are a part of the nucleus.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import ParticleType from '../../common/model/ParticleType.js';
import EnergyLevelType from './EnergyLevelType.js';
import BANParticle from '../../common/model/BANParticle.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

export type ParticleShellPosition = {
  particle?: Particle;
  xPosition: number; // 0 - 5
  type: ParticleType;
};

// constants
export const N_ZERO_CAPACITY = EnergyLevelType.N_ZERO.capacity;
export const N_ONE_CAPACITY = EnergyLevelType.N_ONE.capacity;

// row is yPosition, number is xPosition
const ALLOWED_PARTICLE_POSITIONS = [
  [ 2, 3 ],
  [ 0, 1, 2, 3, 4, 5 ],
  [ 0, 1, 2, 3, 4, 5 ]
];
assert && assert( ALLOWED_PARTICLE_POSITIONS[ 0 ].length === N_ZERO_CAPACITY, 'n0 spots check' );
assert && assert( ALLOWED_PARTICLE_POSITIONS[ 1 ].length === N_ONE_CAPACITY, 'n1 spots check' );
assert && assert( ALLOWED_PARTICLE_POSITIONS[ 2 ].length === N_ONE_CAPACITY, 'n2 spots check' );

class ParticleNucleus extends ParticleAtom {

  // allowed proton positions
  public readonly protonShellPositions: ParticleShellPosition[][] = [ [], [], [] ];

  // allowed neutron positions
  public readonly neutronShellPositions: ParticleShellPosition[][] = [ [], [], [] ];

  // positions particles on the energy levels
  public readonly modelViewTransform = BANConstants.NUCLEON_ENERGY_LEVEL_ARRAY_MVT;

  // keep track of bound levels
  private readonly protonsLevelProperty = new EnumerationProperty( EnergyLevelType.N_ZERO );
  private readonly neutronsLevelProperty = new EnumerationProperty( EnergyLevelType.N_ZERO );

  public constructor() {
    super();

    // Initialize the positions where a nucleon can be placed.
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

    // update bound levels based on nucleon numbers
    const createLevelPropertyListener = ( nucleonCountProperty: TReadOnlyProperty<number>, nucleonLevelProperty: EnumerationProperty<EnergyLevelType> ) => {
      nucleonCountProperty.link( nucleonNumber => {
        if ( nucleonNumber >= N_ZERO_CAPACITY + N_ONE_CAPACITY ) {
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

    // update nucleon positions when the level state changes
    this.protonsLevelProperty.link( () =>
      this.updateNucleonPositions( this.protons, this.protonShellPositions, this.protonsLevelProperty, 0 ) );
    this.neutronsLevelProperty.link( () =>
      this.updateNucleonPositions( this.neutrons, this.neutronShellPositions, this.neutronsLevelProperty,
        BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS ) );
  }

  /**
   * Return the right-most particle from the highest energy level that contains particles, if there is one.
   * Otherwise, return undefined.
   */
  public getLastParticleInShell( particleType: ParticleType ): Particle | undefined {
    const nucleonShellPositions = particleType === ParticleType.NEUTRON ? this.neutronShellPositions : this.protonShellPositions;
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
   * Return the view destination of the next open position for the given particleType shell positions and set the particle on that open shell position,
   * even though it is not yet 'counted' as part of the particleAtom.
   */
  public getParticleDestination( particleType: ParticleType, particle: Particle ): Vector2 {
    const nucleonShellPositions = particleType === ParticleType.NEUTRON ? this.neutronShellPositions : this.protonShellPositions;
    let yPosition = EnergyLevelType.N_ZERO.yPosition; // initialize to the lowest shell where yPosition = 0

    const openNucleonShellPositions = nucleonShellPositions.map( particleShellRow => {

      // remove any empty particleShellPosition's from particleShellRow
      const noEmptyPositions = particleShellRow.filter( particleShellPosition => particleShellPosition !== undefined );

      // get the first open shell position in this particleShellRow
      return noEmptyPositions.find( particleShellPosition => particleShellPosition.particle === undefined );
    } );

    // get the first open shell position available from all rows
    const openParticleShellPosition = openNucleonShellPositions.find( ( particleShellPosition, index ) => {
      yPosition = index;
      return particleShellPosition !== undefined;
    } );

    assert && assert( openParticleShellPosition, 'To add a particle there must be an empty particleShellPosition.' );

    // add particle to the openParticleShellPosition
    openParticleShellPosition!.particle = particle;

    const viewDestination = this.modelViewTransform.modelToViewXY( openParticleShellPosition!.xPosition, yPosition );

    // add x offset for neutron particle to be aligned with its energy level position
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
   * have a shell position here in the ParticleNucleus.
   */
  public override removeParticle( particle: Particle ): void {
    this.removeParticleFromShell( particle );
    super.removeParticle( particle );
  }

  /**
   * Remove the given particle from its shell position, if it is a part of its corresponding shellPositions.
   */
  public removeParticleFromShell( particle: Particle ): void {
    const nucleonShellPositions = particle.type === ParticleType.PROTON.particleTypeString ? this.protonShellPositions : this.neutronShellPositions;
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

    // clear all particles that have a set shell position but may not be in the ParticleAtom
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
  private updateNucleonPositions( particleArray: ObservableArray<BANParticle>, particleShellPositions: ParticleShellPosition[][],
                                  levelFillProperty: EnumerationProperty<EnergyLevelType>, xOffset: number ): void {

    // width in view coordinates of the second energy level, which is the same as the other two levels (though the first
    // energy level line is drawn shorter - see NucleonShellView for details)
    const levelWidth = this.modelViewTransform.modelToViewX( ALLOWED_PARTICLE_POSITIONS[ 1 ][ ALLOWED_PARTICLE_POSITIONS[ 1 ].length - 1 ] ) -
                       this.modelViewTransform.modelToViewX( ALLOWED_PARTICLE_POSITIONS[ 1 ][ 0 ] );
    particleArray.forEach( ( particle, index ) => {
      const yPosition = index < N_ZERO_CAPACITY ? EnergyLevelType.N_ZERO.yPosition :
                        index < ( N_ZERO_CAPACITY + N_ONE_CAPACITY ) ? EnergyLevelType.N_ONE.yPosition :
                        EnergyLevelType.N_TWO.yPosition;

      const xPosition =

        // the first level begins at xPosition which is the first entry in ALLOWED_PARTICLE_POSITIONS.
        yPosition === EnergyLevelType.N_ZERO.yPosition ? index + ALLOWED_PARTICLE_POSITIONS[ 0 ][ 0 ] :

          // the second level has indices xPosition indices 0 to 5, see ALLOWED_PARTICLE_POSITIONS
        yPosition === EnergyLevelType.N_ONE.yPosition ? index - N_ZERO_CAPACITY :

          // the third level has indices xPosition indices 0 to 5, see ALLOWED_PARTICLE_POSITIONS
        index - ( N_ZERO_CAPACITY + N_ONE_CAPACITY );

      // last level (yPosition === 2) never bounds so don't need levelIndex condition for it
      const levelIndex = yPosition === EnergyLevelType.N_ZERO.yPosition ? index : index - N_ZERO_CAPACITY;
      const nucleonShellPosition = particleShellPositions[ yPosition ][ xPosition ];
      const unBoundXPosition = this.modelViewTransform.modelToViewX( nucleonShellPosition.xPosition ) + xOffset;

      nucleonShellPosition.particle = particle;

      let viewDestination;
      let inputEnabled;

      // if the yPosition of the levelFillProperty is higher than the current yPosition level, 'bind' the particles in
      // this level by removing the spaces between them
      if ( yPosition < levelFillProperty.value.yPosition ) {

        // each particle on the level has one 'particle radius' space except for one.
        // there are 2 particles on the y = 0 level and 6 particles on the y = 1 level.
        const numberOfRadiusSpaces = yPosition === EnergyLevelType.N_ZERO.yPosition ? N_ZERO_CAPACITY - 1 : N_ONE_CAPACITY - 1;

        // amount each particle moves so the space between it and the particle on its left is removed
        const boundOffset = levelWidth * ( levelIndex / ( 3 * N_ONE_CAPACITY - 1 ) ); // 3 radius spaces / particle * 5 particle spaces

        // amount each particle has to move for all particles to be centered in middle of energy level
        const centerOffset = BANConstants.PARTICLE_RADIUS * numberOfRadiusSpaces / 2;

        const destinationX = unBoundXPosition - boundOffset + centerOffset;

        viewDestination = new Vector2( destinationX, this.modelViewTransform.modelToViewY( yPosition ) );
        inputEnabled = false;
      }
      else {
        viewDestination = this.modelViewTransform.modelToViewXY( nucleonShellPosition.xPosition, yPosition );
        viewDestination.addXY( xOffset, 0 );
        inputEnabled = true;
      }

      particle.destinationProperty.set( viewDestination );
      particle.inputEnabledProperty.value = inputEnabled;
    } );
  }
}

buildANucleus.register( 'ParticleNucleus', ParticleNucleus );
export default ParticleNucleus;

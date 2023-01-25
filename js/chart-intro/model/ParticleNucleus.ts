// Copyright 2022-2023, University of Colorado Boulder

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import ParticleType from '../../common/view/ParticleType.js';

/**
 * A model element that represents a nucleus that is made up of protons and neutrons. This model element
 * manages the positions and motion of all particles that are a part of the nucleus.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

type ParticleShellPosition = {
  particle: Particle | null;
  xPosition: number; // 0 - 5
  type: ParticleType;
};

// constants

// row is yPosition, number is xPosition
const ALLOWED_PARTICLE_POSITIONS = [
  [ 2, 3 ],
  [ 0, 1, 2, 3, 4, 5 ],
  [ 0, 1, 2, 3, 4, 5 ]
];

class ParticleNucleus extends ParticleAtom {

  // allowed proton positions
  public readonly protonShellPositions: ParticleShellPosition[][];

  // allowed neutron positions
  public readonly neutronShellPositions: ParticleShellPosition[][];

  public modelViewTransform: ModelViewTransform2;
  public incomingProtonsNumber: number;
  public incomingNeutronsNumber: number;

  public constructor() {
    super();

    this.modelViewTransform = BANConstants.NUCLEON_ENERGY_LEVEL_ARRAY_MVT;

    // Initialize the positions where a nucleon can be placed.
    this.protonShellPositions = [
      [], [], []
    ];
    this.neutronShellPositions = [
      [], [], []
    ];
    for ( let i = 0; i < ALLOWED_PARTICLE_POSITIONS.length; i++ ) {
      for ( let j = 0; j < ALLOWED_PARTICLE_POSITIONS[ i ].length; j++ ) {
        const shellPosition = { particle: null, xPosition: ALLOWED_PARTICLE_POSITIONS[ i ][ j ] };
        const protonShellPosition = { ...shellPosition, type: ParticleType.PROTON };
        const neutronShellPosition = { ...shellPosition, type: ParticleType.NEUTRON };
        this.protonShellPositions[ i ][ ALLOWED_PARTICLE_POSITIONS[ i ][ j ] ] = protonShellPosition;
        this.neutronShellPositions[ i ][ ALLOWED_PARTICLE_POSITIONS[ i ][ j ] ] = neutronShellPosition;
      }
    }

    this.incomingProtonsNumber = 0;
    this.incomingNeutronsNumber = 0;
  }

  /**
   * Return the view destination of the next open position for the given particleType shell positions.
   */
  public getParticleDestination( particleType: ParticleType, particle: Particle ): Vector2 {
    const nucleonShellPositions = particleType === ParticleType.NEUTRON ? this.neutronShellPositions : this.protonShellPositions;
    let yPosition = 0;

    const openNucleonShellPositions = nucleonShellPositions.map( particleShellRow => {

      // remove any empty particleShellPosition's from particleShellRow
      const noEmptyPositions = particleShellRow.filter( particleShellPosition => particleShellPosition !== undefined );

      // get the first open shell position in this particleShellRow
      return noEmptyPositions.find( particleShellPosition => particleShellPosition.particle === null );
    } );

    // get the first open shell position available from all rows
    const openParticleShellPosition = openNucleonShellPositions.find( ( particleShellPosition, index ) => {
      yPosition = index;
      return particleShellPosition !== undefined;
    } );

    assert && assert( openParticleShellPosition !== undefined, 'To add a particle there must be an empty particleShellPosition.' );

    openParticleShellPosition!.particle = particle;
    // @ts-expect-error openParticleShellPosition should never be undefined
    const viewDestination = this.modelViewTransform.modelToViewXY( openParticleShellPosition.xPosition, yPosition );

    // add x offset for neutron particle to be aligned with its energy level position
    viewDestination.addXY( particleType === ParticleType.NEUTRON ? BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS : 0, 0 );
    return viewDestination;
  }

  public override reconfigureNucleus(): void {

    // fill all nucleons in open positions from bottom to top, left to right
    const updateNucleonPositions = ( particleArray: ObservableArray<Particle>, incomingNucleonsNumber: number, oldNucleonCount: number,
                                     particleShellPositions: ParticleShellPosition[][], xOffset: number ) => {
      const currentNucleonCount = particleArray.length + incomingNucleonsNumber;
      let nucleonIndex = 0;
      if ( currentNucleonCount !== oldNucleonCount ) {
        particleShellPositions.forEach( ( nucleonShellPositions, yPosition ) => {
          nucleonShellPositions.forEach( nucleonShellPosition => {
            if ( nucleonIndex < currentNucleonCount ) {
              nucleonShellPosition.particle = particleArray[ nucleonIndex ];
              const viewDestination = this.modelViewTransform.modelToViewXY( nucleonShellPosition.xPosition, yPosition );

              // add x offset so neutron particles are aligned with their energy levels
              viewDestination.addXY( xOffset, 0 );
              if ( nucleonShellPosition.particle ) {
                nucleonShellPosition.particle.destinationProperty.set( viewDestination );
              }
              nucleonIndex++;
            }
            else {
              nucleonShellPosition.particle = null;
            }
          } );
        } );
      }
    };

    // get old nucleon count
    let oldProtonCount = 0;
    this.protonShellPositions.forEach( particleShellRow => {
      particleShellRow.forEach( particleShellPosition => {
        if ( particleShellPosition.particle !== null ) {
          oldProtonCount++;
        }
      } );
    } );
    let oldNeutronCount = 0;
    this.neutronShellPositions.forEach( particleShellRow => {
      particleShellRow.forEach( particleShellPosition => {
        if ( particleShellPosition.particle !== null ) {
          oldNeutronCount++;
        }
      } );
    } );

    updateNucleonPositions( this.protons, this.incomingProtonsNumber, oldProtonCount, this.protonShellPositions, 0 );
    updateNucleonPositions( this.neutrons, this.incomingNeutronsNumber, oldNeutronCount, this.neutronShellPositions, BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS );
  }
}

buildANucleus.register( 'ParticleNucleus', ParticleNucleus );
export default ParticleNucleus;
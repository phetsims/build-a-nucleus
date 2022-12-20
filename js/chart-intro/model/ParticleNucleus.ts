// Copyright 2022, University of Colorado Boulder

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';

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
};

// constants
const ALLOWED_PARTICLE_POSITIONS = [
  [ 2, 3 ],
  [ 0, 1, 2, 3, 4, 5 ],
  [ 0, 1, 2, 3, 4, 5 ]
];

class ParticleNucleus extends ParticleAtom {

  public readonly protonShellPositions: ParticleShellPosition[][];
  public readonly neutronShellPositions: ParticleShellPosition[][];
  public modelViewTransform: ModelViewTransform2;

  public constructor() {
    super();

    const particleWidth = BANConstants.PARTICLE_RADIUS * 2;
    this.modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping( new Bounds2( 0, 0, 5, 2 ),
      new Bounds2( 0, 0, particleWidth * 6, particleWidth * 8 ) );

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
        this.protonShellPositions[ i ][ ALLOWED_PARTICLE_POSITIONS[ i ][ j ] ] = shellPosition;
        this.neutronShellPositions[ i ][ ALLOWED_PARTICLE_POSITIONS[ i ][ j ] ] = shellPosition;
      }
    }
  }

  public override reconfigureNucleus(): void {

    // fill all nucleons in open positions from bottom to top, left to right
    // TODO: pass in xOffset for neutrons, use in MVT positioning, might need to do it after MVT
    const updateNucleonPositions = ( particleArray: ObservableArray<Particle>, oldNucleonCount: number,
                                     particleShellPositions: ParticleShellPosition[][], xOffset: number ) => {
      const currentNucleonCount = particleArray.length;
      let nucleonIndex = 0;
      if ( currentNucleonCount !== oldNucleonCount ) {
        particleShellPositions.forEach( ( nucleonShellPositions, yPosition ) => {
          nucleonShellPositions.forEach( nucleonShellPosition => {
            if ( nucleonIndex < currentNucleonCount ) {
              nucleonShellPosition.particle = particleArray[ nucleonIndex ];
              const viewDestination = this.modelViewTransform.modelToViewXY( nucleonShellPosition.xPosition, yPosition );
              viewDestination.addXY( xOffset, 0 );
              nucleonShellPosition.particle.setPositionAndDestination( viewDestination );
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

    updateNucleonPositions( this.protons, oldProtonCount, this.protonShellPositions, 0 );
    updateNucleonPositions( this.neutrons, oldNeutronCount, this.neutronShellPositions, BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS );
  }
}

buildANucleus.register( 'ParticleNucleus', ParticleNucleus );
export default ParticleNucleus;
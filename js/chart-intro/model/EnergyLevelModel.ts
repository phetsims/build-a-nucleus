// Copyright 2022, University of Colorado Boulder

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Particle from '../../../../shred/js/model/Particle.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';

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

class EnergyLevelModel {

  public readonly particleShellPositions: ParticleShellPosition[][];
  private particles: ObservableArray<Particle>;
  public modelViewTransform: ModelViewTransform2;

  public constructor() {

    const particleWidth = BANConstants.PARTICLE_RADIUS * 2;
    this.modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping( new Bounds2( 0, 0, 5, 2 ),
      new Bounds2( 0, 0, particleWidth * 6, particleWidth * 8 ) );

    this.particles = createObservableArray();

    // Initialize the positions where a nucleon can be placed.
    this.particleShellPositions = [
      [], [], []
    ];
    for ( let i = 0; i < ALLOWED_PARTICLE_POSITIONS.length; i++ ) {
      for ( let j = 0; j < ALLOWED_PARTICLE_POSITIONS[ i ].length; j++ ) {
        this.particleShellPositions[ i ][ ALLOWED_PARTICLE_POSITIONS[ i ][ j ] ] =
          { particle: null, xPosition: ALLOWED_PARTICLE_POSITIONS[ i ][ j ] };
      }
    }

    // When a proton is removed, clear the corresponding shell position.
    let particleXPosition: number;
    let particleYPosition: number;
    const particleAtomRemovalListener = ( particle: Particle | null ) => {

      // get our particle x and y position
      this.particleShellPositions.forEach( ( particleShellPositionRow, yPosition ) => {
        particleShellPositionRow.forEach( particleShellPosition => {
          if ( particleShellPosition.particle === particle ) {
            particleXPosition = particleShellPosition.xPosition;
            particleYPosition = yPosition;
            particleShellPosition.particle = null;
            // TODO: remove particle from particle atom too in EnergyLevelScreenView (with draglistener on particle)
          }
        } );
      } );

      // get another particle that is in a row higher than the particle
      if ( particleYPosition < ALLOWED_PARTICLE_POSITIONS.length - 1 ) {
        this.particleShellPositions[ particleYPosition + 1 ].forEach( particleShellPosition => {
          if ( particleShellPosition.particle !== null ) {

            // move the other particle to the position of particle that was removed
            this.particleShellPositions[ particleYPosition ][ particleXPosition ].particle = particleShellPosition.particle;

            particleShellPosition.particle = null;
          }
        } );
      }

    };
    this.particles.addItemRemovedListener( particleAtomRemovalListener );

  }

  public dispose(): void {
    this.particles.dispose();
  }

  /**
   * test this the energy levels contains a particular particle
   */
  private containsParticle( particle: Particle ): boolean {
    return this.particles.includes( particle );
  }

  /**
   * add a particle to the energy levels
   */
  public addParticle( particle: Particle ): void {

    if ( this.containsParticle( particle ) ) {
      return;
    }

    if ( particle.type === 'proton' || particle.type === 'neutron' ) {
      this.particles.push( particle );

      // Find an open position in the proton shell.
      const openPositions = [];
      for ( let i = 0; i < this.particleShellPositions.length; i++ ) {
        openPositions.push( this.particleShellPositions[ i ].filter( particlePosition => {
          return ( particlePosition.particle === null );
        } ) );
      }

      // Put the most inner shell positions in front first
      let sortedOpenPositions: ParticleShellPosition[] = [];
      let yPosition = 0;
      while ( openPositions[ yPosition ].length === 0 ) {
        sortedOpenPositions = openPositions[ yPosition ];
        yPosition++;
      }

      sortedOpenPositions = sortedOpenPositions.sort( ( p1, p2 ) => {

        // Sort by distance to particle.
        return ( particle.positionProperty.get().distance( new Vector2( p1.xPosition, yPosition ) ) -
                 particle.positionProperty.get().distance( new Vector2( p2.xPosition, yPosition ) ) );
      } );

      assert && assert( sortedOpenPositions.length > 0, 'No open positions found for protons' );
      sortedOpenPositions[ 0 ].particle = particle;
      particle.destinationProperty.set( this.modelViewTransform.modelToViewPosition( new Vector2( sortedOpenPositions[ 0 ].xPosition, yPosition ) ) );

      // Listen for removal of the proton and handle it.
      const particleRemovedListener = ( userControlled: boolean ) => {
        if ( userControlled && this.particles.includes( particle ) ) {
          this.particles.remove( particle );
          particle.zLayerProperty.set( 0 );
          particle.userControlledProperty.unlink( particleRemovedListener );
          // delete particle.particleAtomRemovalListener;
        }
      };
      particle.userControlledProperty.lazyLink( particleRemovedListener );

      // Set the listener as an attribute of the particle to aid unlinking in some cases.
      // particle.particleAtomRemovalListener = particleRemovedListener;
    }
    else {
      throw new Error( 'Unexpected particle type.' );
    }
  }

  /**
   * remove the specified particle from the energy levels
   */
  public removeParticle( particle: Particle ): void {

    if ( this.particles.includes( particle ) ) {
      this.particles.remove( particle );
    }
    else {
      throw new Error( 'Attempt to remove particle that is not in this particle atom.' );
    }
    // assert && assert( typeof ( particle.particleAtomRemovalListener ) === 'function',
    //   'No particle removal listener attached to particle.' );
    // particle.userControlledProperty.unlink( particle.particleAtomRemovalListener );
    //
    // delete particle.particleAtomRemovalListener;
  }
}

buildANucleus.register( 'EnergyLevelModel', EnergyLevelModel );
export default EnergyLevelModel;
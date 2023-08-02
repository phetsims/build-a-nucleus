// Copyright 2022-2023, University of Colorado Boulder

/**
 * Model class for the 'Chart Intro' screen.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import BANModel from '../../common/model/BANModel.js';
import ParticleNucleus from './ParticleNucleus.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ParticleType from '../../common/model/ParticleType.js';
import Particle from '../../../../shred/js/model/Particle.js';
import BANConstants from '../../common/BANConstants.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Property from '../../../../axon/js/Property.js';
import NuclideChartCellModel from './NuclideChartCellModel.js';
import DecayEquationModel from './DecayEquationModel.js';
import BANParticle from '../../common/model/BANParticle.js';

// types
export type SelectedChartType = 'partial' | 'zoom';

// 2D array that defines the table structure.
// The rows are the proton number, for example the first row is protonCount = 0. The numbers in the rows are the neutron number.
const POPULATED_CELLS = [
  [ 1, 4, 6 ],
  [ 0, 1, 2, 3, 4, 5, 6 ],
  [ 1, 2, 3, 4, 5, 6, 7, 8 ],
  [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
  [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 5, 6, 7, 8, 9, 10, 11, 12 ]
];

class ChartIntroModel extends BANModel<ParticleNucleus> {

  public readonly particleNucleus: ParticleNucleus;
  public readonly miniParticleAtom: ParticleAtom;
  public readonly selectedNuclideChartProperty: Property<SelectedChartType>;

  // There's not an entry for all the neutron values, see POPULATED_CELLS
  public static cellModelArray = POPULATED_CELLS.map( ( neutronCountList, protonCount ) => neutronCountList.map( neutronCount => new NuclideChartCellModel( protonCount, neutronCount ) ) );
  public readonly decayEquationModel: DecayEquationModel;

  public constructor() {

    const particleAtom = new ParticleNucleus(); // this is our ground truth 'atom'

    // empirically determined, the last nuclide the NuclideChartIntro screen goes up to is Neon-22 (10 protons and 12 neutrons)
    super( BANConstants.CHART_MAX_NUMBER_OF_PROTONS, BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS, particleAtom );

    this.particleNucleus = particleAtom;

    // this is the mini-nucleus that updates based on the particleAtom
    this.miniParticleAtom = new ParticleAtom();

    this.selectedNuclideChartProperty = new Property<SelectedChartType>( 'partial' );

    this.decayEquationModel = new DecayEquationModel( ChartIntroModel.cellModelArray, this.particleNucleus.protonCountProperty, this.particleNucleus.massNumberProperty );
  }

  /**
   * Create model for particle in mini-nucleus.
   */
  public createMiniParticleModel( particleType: ParticleType ): Particle {
    const particle = new BANParticle( particleType.particleTypeString );
    this.miniParticleAtom.addParticle( particle );
    return particle;
  }

  /**
   * Remove the particle from its shell position in the ParticleNucleus.
   */
  public override removeParticle( particle: Particle ): void {
    this.particleNucleus.removeParticleFromShell( particle );
    super.removeParticle( particle );
  }

  /**
   * Select the particle in the farthest energy level.
   */
  public override getParticleToReturn( particleType: ParticleType, creatorNodePosition: Vector2 ): Particle {
    const particleToReturn = this.particleNucleus.getLastParticleInShell( particleType );
    assert && assert( particleToReturn, 'No particle of type ' + particleType.name + ' exists in the particleAtom.' );
    assert && assert( !particleToReturn!.isDisposed, 'Particle should not already be disposed.' );

    // We know that sortedParticles is not empty, and does not contain null.
    return particleToReturn!;
  }

  public override getParticleDestination( particleType: ParticleType, particle: Particle ): Vector2 {
    return this.particleNucleus.getParticleDestination( particleType, particle );
  }

  public override reset(): void {

    // This subset of particles needs manual clean-up since it's not part of the regular particles array
    this.outgoingParticles.forEach( particle => {
      if ( !this.particles.includes( particle ) ) {
        particle.dispose();
      }
    } );
    super.reset();

    // Put this last to make sure that this.particleAtom can be cleared first (by supertype).
    this.miniParticleAtom.clear();
  }

  /**
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    super.step( dt );
    this.miniParticleAtom.protons.forEach( particle => {
      assert && assert( !this.particles.includes( particle ), 'should not double step particle' );
      assert && assert( !this.outgoingParticles.includes( particle ), 'should not double step particle' );
      particle.step( dt );
    } );
    this.miniParticleAtom.neutrons.forEach( particle => {
      assert && assert( !this.outgoingParticles.includes( particle ), 'should not double step particle' );
      assert && assert( !this.particles.includes( particle ), 'should not double step particle' );
      particle.step( dt );
    } );

    // When decaying, the animated particle from the miniParticleAtom is removed from it, but still needs to be stepped off the screen
    this.outgoingParticles.forEach( particle => {
      if ( !this.particles.includes( particle ) ) {
        particle.step( dt );
      }
    } );
  }
}

buildANucleus.register( 'ChartIntroModel', ChartIntroModel );
export default ChartIntroModel;

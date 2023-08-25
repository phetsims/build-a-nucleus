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

class ChartIntroModel extends BANModel<ParticleNucleus> {

  // the atom that the user will build, modify, and generally play with.
  public readonly particleNucleus: ParticleNucleus;

  // the non-interactive mini-nucleus at the top of the screen
  public readonly miniParticleAtom: ParticleAtom;

  // There's not an entry for all the neutron values, see POPULATED_CELLS
  public static cellModelArray = BANModel.POPULATED_CELLS.map( ( neutronNumberList, protonNumber ) => neutronNumberList.map( neutronNumber => new NuclideChartCellModel( protonNumber, neutronNumber ) ) );

  public readonly decayEquationModel: DecayEquationModel;
  public readonly selectedNuclideChartProperty: Property<SelectedChartType>;

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
   * Create model for particle in mini-nucleus and add it to the miniParticleAtom.
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

  /**
   * Return the next open shell position for the given particleType and add it to that shell position.
   */
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
    this.selectedNuclideChartProperty.reset();
    this.decayEquationModel.reset();

    // Put this last to make sure that this.particleAtom can be cleared first (by supertype).
    this.miniParticleAtom.clear();
  }

  /**
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    super.step( dt );

    // step the miniParticleAtom nucleons
    // REVIEW - code duplication - the same closure is passed to forEach loops below.
    this.miniParticleAtom.protons.forEach( particle => {
      assert && assert( !this.outgoingParticles.includes( particle ), 'should not double step particle' );
      assert && assert( !this.particles.includes( particle ), 'should not double step particle' );
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

  /**
   * We need to make sure that the shell position spots reserved for the incoming, animating particles, are cleared out
   * since the particle is no longer coming into the atom.
   */
  public override clearIncomingParticle( particle: Particle, particleType: ParticleType ): void {
    super.clearIncomingParticle( particle, particleType );

    // Not a full removeParticle() call because we never completed the animation into the particleAtom (but we did
    // count it in a shell position).
    this.particleAtom.removeParticleFromShell( particle );
  }
}

buildANucleus.register( 'ChartIntroModel', ChartIntroModel );
export default ChartIntroModel;

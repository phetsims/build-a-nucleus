// Copyright 2022-2023, University of Colorado Boulder

/**
 * Model class for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import BANModel from '../../common/model/BANModel.js';
import ParticleNucleus from './ParticleNucleus.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ParticleType from '../../common/view/ParticleType.js';
import Particle from '../../../../shred/js/model/Particle.js';
import BANConstants from '../../common/BANConstants.js';

class ChartIntroModel extends BANModel<ParticleNucleus> {

  public particleNucleus: ParticleNucleus;

  public constructor() {

    const particleAtom = new ParticleNucleus(); // this is our ground truth 'atom'

    // empirically determined, the last nuclide the NuclideChartIntro screen goes up to is Neon-22 (10 protons and 12 neutrons)
    super( BANConstants.CHART_MAX_NUMBER_OF_PROTONS, BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS, particleAtom );

    this.particleNucleus = particleAtom;

    this.incomingProtons.lengthProperty.link( incomingProtonsNumber => { this.particleNucleus.incomingProtonsNumber = incomingProtonsNumber; } );
    this.incomingNeutrons.lengthProperty.link( incomingNeutronsNumber => { this.particleNucleus.incomingNeutronsNumber = incomingNeutronsNumber; } );

  }

  public override getParticleDestination( particleType: ParticleType, particle: Particle ): Vector2 {
    return this.particleNucleus.getParticleDestination( particleType, particle );
  }

  public override reset(): void {
    super.reset();
  }

  /**
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    super.step( dt );
  }
}

buildANucleus.register( 'ChartIntroModel', ChartIntroModel );
export default ChartIntroModel;
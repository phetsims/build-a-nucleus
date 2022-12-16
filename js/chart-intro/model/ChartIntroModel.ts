// Copyright 2022, University of Colorado Boulder

/**
 * Model class for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import BANModel, { BANModelOptions } from '../../common/model/BANModel.js';
import ParticleNucleus from './ParticleNucleus.js';

// types
export type NuclideChartIntroModelOptions = BANModelOptions;

class ChartIntroModel extends BANModel<ParticleNucleus> {

  public particleNucleus: ParticleNucleus;

  public constructor( providedOptions?: NuclideChartIntroModelOptions ) {

    const options = optionize<NuclideChartIntroModelOptions, EmptySelfOptions, BANModelOptions>()( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

     const particleAtom = new ParticleNucleus(); // this is our ground truth 'atom'

    // empirically determined, the last nuclide the NuclideChartIntro screen goes up to is Neon-22 (10 protons and 12 neutrons)
    super( 10, 12, particleAtom, options );

    this.particleNucleus = particleAtom;

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
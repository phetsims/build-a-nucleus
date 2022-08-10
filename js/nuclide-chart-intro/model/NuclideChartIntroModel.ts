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

// types
export type NuclideChartIntroModelOptions = BANModelOptions;

class NuclideChartIntroModel extends BANModel {

  public constructor( providedOptions?: NuclideChartIntroModelOptions ) {

    const options = optionize<NuclideChartIntroModelOptions, EmptySelfOptions, BANModelOptions>()( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // empirically determined, the last nuclide the NuclideChartIntro screen goes up to is Neon-22 (10 protons and 12 neutrons)
    super( 10, 12, options );

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

buildANucleus.register( 'NuclideChartIntroModel', NuclideChartIntroModel );
export default NuclideChartIntroModel;
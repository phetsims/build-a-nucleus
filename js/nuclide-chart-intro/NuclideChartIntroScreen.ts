// Copyright 2022, University of Colorado Boulder

/**
 * The 'Nuclide Chart Intro' screen.
 *
 * @author Luisa Vargas
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import buildANucleus from '../buildANucleus.js';
import BANColors from '../common/BANColors.js';
import NuclideChartIntroModel from '../nuclide-chart-intro/model/NuclideChartIntroModel.js';
import NuclideChartIntroScreenView from '../nuclide-chart-intro/view/NuclideChartIntroScreenView.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import buildANucleusStrings from '../buildANucleusStrings.js';

// types
export type NuclideChartIntroScreenOptions = ScreenOptions & PickRequired<ScreenOptions, 'tandem'>;

class NuclideChartIntroScreen extends Screen<NuclideChartIntroModel, NuclideChartIntroScreenView> {

  public constructor( providedOptions?: NuclideChartIntroScreenOptions ) {

    const options = optionize<NuclideChartIntroScreenOptions, EmptySelfOptions, ScreenOptions>()( {
      //TODO if you include homeScreenIcon or navigationBarIcon, use JOIST/ScreenIcon
      name: buildANucleusStrings.nuclideChartIntro,

      backgroundColorProperty: BANColors.screenBackgroundColorProperty,

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super(
      () => new NuclideChartIntroModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new NuclideChartIntroScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}

buildANucleus.register( 'NuclideChartIntroScreen', NuclideChartIntroScreen );
export default NuclideChartIntroScreen;
// Copyright 2022, University of Colorado Boulder

/**
 * The 'Nuclide Chart Intro' screen.
 *
 * @author Luisa Vargas
 */

import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import buildANucleus from '../buildANucleus.js';
import BANColors from '../common/BANColors.js';
import ChartIntroModel from '../chart-intro/model/ChartIntroModel.js';
import ChartIntroScreenView from '../chart-intro/view/ChartIntroScreenView.js';
import buildANucleusStrings from '../buildANucleusStrings.js';

class ChartIntroScreen extends Screen<ChartIntroModel, ChartIntroScreenView> {

  public constructor() {

    const options = {
      //TODO if you include homeScreenIcon or navigationBarIcon, use JOIST/ScreenIcon
      name: buildANucleusStrings.chartIntro,

      backgroundColorProperty: BANColors.screenBackgroundColorProperty,

      // phet-io options
      tandem: Tandem.OPT_OUT
    };

    super(
      () => new ChartIntroModel(),
      model => new ChartIntroScreenView( model, { tandem: Tandem.OPT_OUT } ),
      options
    );
  }
}

buildANucleus.register( 'ChartIntroScreen', ChartIntroScreen );
export default ChartIntroScreen;
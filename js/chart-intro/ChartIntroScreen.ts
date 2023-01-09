// Copyright 2022, University of Colorado Boulder

/**
 * The 'Nuclide Chart Intro' screen.
 *
 * @author Luisa Vargas
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import buildANucleus from '../buildANucleus.js';
import BANColors from '../common/BANColors.js';
import ChartIntroModel from '../chart-intro/model/ChartIntroModel.js';
import ChartIntroScreenView from '../chart-intro/view/ChartIntroScreenView.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import BuildANucleusStrings from '../BuildANucleusStrings.js';

// types
export type NuclideChartIntroScreenOptions = ScreenOptions & PickRequired<ScreenOptions, 'tandem'>;

class ChartIntroScreen extends Screen<ChartIntroModel, ChartIntroScreenView> {

  public constructor( providedOptions?: NuclideChartIntroScreenOptions ) {

    const options = optionize<NuclideChartIntroScreenOptions, EmptySelfOptions, ScreenOptions>()( {
      //TODO if you include homeScreenIcon or navigationBarIcon, use JOIST/ScreenIcon
      name: BuildANucleusStrings.chartIntroStringProperty,

      backgroundColorProperty: BANColors.screenBackgroundColorProperty
    }, providedOptions );

    super(
      () => new ChartIntroModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new ChartIntroScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}

buildANucleus.register( 'ChartIntroScreen', ChartIntroScreen );
export default ChartIntroScreen;
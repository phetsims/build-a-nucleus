// Copyright 2022-2023, University of Colorado Boulder

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
import BuildANucleusStrings from '../BuildANucleusStrings.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import CompleteNuclideChartIconNode from './view/CompleteNuclideChartIconNode.js';
import { FlowBox } from '../../../scenery/js/imports.js';

// types
export type NuclideChartIntroScreenOptions = ScreenOptions;

class ChartIntroScreen extends Screen<ChartIntroModel, ChartIntroScreenView> {

  public constructor( providedOptions?: NuclideChartIntroScreenOptions ) {

    const options = optionize<NuclideChartIntroScreenOptions, EmptySelfOptions, ScreenOptions>()( {
      name: BuildANucleusStrings.chartIntroStringProperty,

      backgroundColorProperty: BANColors.screenBackgroundColorProperty,

      homeScreenIcon: createScreenIcon()
    }, providedOptions );

    super(
      () => new ChartIntroModel(),
      model => new ChartIntroScreenView( model ),
      options
    );
  }
}

/**
 * Creates the icon for this screen.
 */
function createScreenIcon(): ScreenIcon {
  const iconNode = new FlowBox( { children: [ new CompleteNuclideChartIconNode() ], margin: 3 } );
  return new ScreenIcon( iconNode, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1
  } );
}

buildANucleus.register( 'ChartIntroScreen', ChartIntroScreen );
export default ChartIntroScreen;
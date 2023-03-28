// Copyright 2023, University of Colorado Boulder

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import buildANucleus from '../../buildANucleus.js';
import NuclideChartAndNumberLines from './NuclideChartAndNumberLines.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANConstants from '../../common/BANConstants.js';
import { Color, HBox, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import NuclideChartLegendNode from './NuclideChartLegendNode.js';
import { SelectedChartType } from '../model/ChartIntroModel.js';

/**
 * Node that holds Nuclide Chart and Zoom-in nuclide chart view.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

class NuclideChartAccordionBox extends AccordionBox {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      minWidth: number, selectedNuclideChartProperty: TReadOnlyProperty<SelectedChartType> ) {

    const nuclideChartAndNumberLines = new NuclideChartAndNumberLines( protonCountProperty, neutronCountProperty,
      selectedNuclideChartProperty );
    const nuclideChartLegendNode = new NuclideChartLegendNode();

    const zoomInChart = new Rectangle( 0, 0, 100, 100, {
      stroke: Color.BLACK
    } );
    selectedNuclideChartProperty.link( selectedNuclideChart => {
      zoomInChart.visible = selectedNuclideChart === 'zoom';
    } );

    const chartsHBox = new HBox( {
      children: [
        zoomInChart,
        nuclideChartAndNumberLines
      ],
      spacing: 10,
      align: 'top',
      excludeInvisibleChildrenFromBounds: true,
      minContentHeight: 270
    } );
    const contentVBox = new VBox( {
      children: [
        chartsHBox,
        nuclideChartLegendNode
      ],
      spacing: 10,
      excludeInvisibleChildrenFromBounds: true
    } );

    super( contentVBox, {
      titleNode: new Text( BuildANucleusStrings.partialNuclideChart, {
        font: BANConstants.REGULAR_FONT,
        maxWidth: 200
      } ),
      fill: Color.white,
      minWidth: minWidth,
      contentYSpacing: 0,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        sideLength: 18
      },
      titleAlignX: 'left',
      stroke: BANConstants.PANEL_STROKE,
      cornerRadius: BANConstants.PANEL_CORNER_RADIUS
    } );
  }
}

buildANucleus.register( 'NuclideChartAccordionBox', NuclideChartAccordionBox );
export default NuclideChartAccordionBox;
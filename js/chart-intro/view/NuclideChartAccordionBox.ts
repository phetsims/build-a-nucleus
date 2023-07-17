// Copyright 2023, University of Colorado Boulder

/**
 * Node that holds Nuclide Chart and Zoom-in nuclide chart view.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import NuclideChartAndNumberLines from './NuclideChartAndNumberLines.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import NuclideChartLegendNode from './NuclideChartLegendNode.js';
import { SelectedChartType } from '../model/ChartIntroModel.js';
import BANConstants from '../../common/BANConstants.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Range from '../../../../dot/js/Range.js';
import FocusedNuclideChartNode from './FocusedNuclideChartNode.js';
import ZoomInChartNode from './ZoomInChartNode.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import DecayEquationNode from './DecayEquationNode.js';
import DecayEquationModel from '../model/DecayEquationModel.js';
import BANColors from '../../common/BANColors.js';
import DecayType from '../../common/model/DecayType.js';
import buildANucleus from '../../buildANucleus.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

class NuclideChartAccordionBox extends AccordionBox {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      minWidth: number, selectedNuclideChartProperty: TReadOnlyProperty<SelectedChartType>,
                      decayEquationModel: DecayEquationModel, decayAtom: ( decayType: DecayType | null ) => void ) {

    const partialChartTransform = NuclideChartAccordionBox.getChartTransform( 18 );
    const focusedChartTransform = NuclideChartAccordionBox.getChartTransform( 10 );
    const zoomInChartTransform = NuclideChartAccordionBox.getChartTransform( 30 );

    const nuclideChartAndNumberLines = new NuclideChartAndNumberLines( protonCountProperty, neutronCountProperty,
      partialChartTransform );

    const focusedNuclideChartNode = new FocusedNuclideChartNode( protonCountProperty, neutronCountProperty,
      focusedChartTransform );
    const zoomInNuclideChartNode = new ZoomInChartNode( protonCountProperty, neutronCountProperty,
      zoomInChartTransform );
    const nuclideChartLegendNode = new NuclideChartLegendNode();

    const decayEquationNode = new DecayEquationNode( decayEquationModel );

    const chartAndButtonVBox = new VBox( {
      children: [
        new TextPushButton( BuildANucleusStrings.decayStringProperty, {
          enabledProperty: new DerivedProperty( [ decayEquationModel.currentCellModelProperty ], currentCellModel => !!currentCellModel?.decayType ),
          baseColor: BANColors.decayButtonColorProperty,
          textNodeOptions: {
            fontSize: 14
          },
          minWidth: 80,
          listener: () => {
            const decayType = decayEquationModel.currentCellModelProperty.value?.decayType;
            // TODO: support this function for the chart-intro screen too!, see https://github.com/phetsims/build-a-nucleus/issues/97
            decayAtom( decayType || null );
          }
        } ),
        focusedNuclideChartNode
      ],
      spacing: 10,
      align: 'center'
    } );

    selectedNuclideChartProperty.link( selectedNuclideChart => {
      zoomInNuclideChartNode.visible = selectedNuclideChart === 'zoom';
      chartAndButtonVBox.visible = selectedNuclideChart === 'zoom';
      decayEquationNode.visible = selectedNuclideChart === 'zoom';
      nuclideChartAndNumberLines.visible = selectedNuclideChart === 'partial';
    } );

    const chartsHBox = new HBox( {
      children: [
        zoomInNuclideChartNode,
        nuclideChartAndNumberLines,
        chartAndButtonVBox
      ],
      spacing: 10,
      align: 'top',
      excludeInvisibleChildrenFromBounds: true
    } );
    const contentVBox = new VBox( {
      children: [
        decayEquationNode,
        chartsHBox,
        nuclideChartLegendNode
      ],
      align: 'left',
      spacing: 10,
      excludeInvisibleChildrenFromBounds: true
    } );

    super( contentVBox, {
      titleNode: new Text( BuildANucleusStrings.partialNuclideChart, {
        font: BANConstants.REGULAR_FONT,
        maxWidth: 200
      } ),
      fill: BANColors.chartAccordionBoxBackgroundColorProperty,
      minWidth: minWidth,
      contentYSpacing: 0,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        sideLength: 18
      },
      titleAlignX: 'left',
      stroke: BANColors.panelStrokeColorProperty,
      cornerRadius: BANConstants.PANEL_CORNER_RADIUS
    } );
  }

  public static getChartTransform( scaleFactor: number ): ChartTransform {
    return new ChartTransform( {
      viewWidth: BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS * scaleFactor,
      modelXRange: new Range( BANConstants.DEFAULT_INITIAL_NEUTRON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS ),
      viewHeight: BANConstants.CHART_MAX_NUMBER_OF_PROTONS * scaleFactor,
      modelYRange: new Range( BANConstants.DEFAULT_INITIAL_PROTON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_PROTONS )
    } );
  }
}

buildANucleus.register( 'NuclideChartAccordionBox', NuclideChartAccordionBox );
export default NuclideChartAccordionBox;
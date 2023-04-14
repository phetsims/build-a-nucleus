// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node that contains some content in the 'Nuclide Chart', including the proton and neutron NucleonNumberLine's,
 * and the NuclideChartNode.
 *
 * @author Luisa Vargas
 */

import { Color, Node, NodeOptions, Rectangle } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BANColors from '../../common/BANColors.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import NucleonNumberLine from './NucleonNumberLine.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import BANConstants from '../../common/BANConstants.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Range from '../../../../dot/js/Range.js';
import NuclideChartNode from './NuclideChartNode.js';
import { SelectedChartType } from '../model/ChartIntroModel.js';
import Multilink from '../../../../axon/js/Multilink.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';

const ZOOM_IN_CHART_SCALE_FACTOR = 0.4;
const HIGHLIGHT_RECTANGLE_LINE_WIDTH = 3;

type NuclideChartNodeOptions = NodeOptions;

class NuclideChartAndNumberLines extends Node {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      selectedNuclideChartProperty: TReadOnlyProperty<SelectedChartType>,
                      providedOptions?: NuclideChartNodeOptions ) {

    const scaleFactor = 20;
    const chartTransform = new ChartTransform( {
      viewWidth: BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS * scaleFactor,
      modelXRange: new Range( BANConstants.DEFAULT_INITIAL_NEUTRON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS ),
      viewHeight: BANConstants.CHART_MAX_NUMBER_OF_PROTONS * scaleFactor,
      modelYRange: new Range( BANConstants.DEFAULT_INITIAL_PROTON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_PROTONS )
    } );

    // keep track of the current center of the highlight rectangle
    const viewHighlightRectangleCenterProperty = new Property(
      chartTransform.modelToViewXY( 1 + BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE, 1 + BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE ) );

    // create and add the nuclideChartNode
    const nuclideChartNode = new NuclideChartNode( protonCountProperty, neutronCountProperty, selectedNuclideChartProperty,
      chartTransform, viewHighlightRectangleCenterProperty );
    nuclideChartNode.bounds.dilate( HIGHLIGHT_RECTANGLE_LINE_WIDTH );

    // create and add a box around current nuclide
    const squareLength = chartTransform.modelToViewDeltaX( 5 );
    const highlightRectangle = new Rectangle( 0, 0,
      squareLength, squareLength, { stroke: Color.BLACK, lineWidth: HIGHLIGHT_RECTANGLE_LINE_WIDTH } );

    const squareBounds = nuclideChartNode.bounds.erodedXY(
      Math.abs( chartTransform.modelToViewDeltaX( 3 - BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE ) ),
      Math.abs( chartTransform.modelToViewDeltaY( 2 - BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE ) ) );

    const invisibleRectangle = new Rectangle( nuclideChartNode.bounds.dilated( 10 ), { fill: Color.CYAN, center: nuclideChartNode.center } );

    nuclideChartNode.boundsProperty.link( bounds => {
      if ( bounds.center !== squareBounds.center ) {
        const matrix = Matrix3.translation( bounds.centerX - squareBounds.centerX, bounds.centerY - squareBounds.centerY );
        squareBounds.transform( matrix );
        console.log( 'nuclideChartNode center = ' + bounds.center );
        console.log( 'square center = ' + squareBounds.center );
      }
    } );

    // update the box position to current nuclide
    Multilink.multilink( [ protonCountProperty, neutronCountProperty ], ( protonCount, neutronCount ) => {
      const cellX = neutronCount;
      const cellY = protonCount;
      if ( protonCount === 0 && neutronCount === 0 ) {
        viewHighlightRectangleCenterProperty.value = chartTransform.modelToViewXY( 2 + BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE,
          2 + BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE );
      }
      else if ( AtomIdentifier.doesExist( protonCount, neutronCount ) ) {

        // constrain the bounds of the highlightRectangle
        const constrainedCenter = squareBounds.getConstrainedPoint(
          chartTransform.modelToViewXY( cellX + BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE,
            cellY + BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE ) );
        viewHighlightRectangleCenterProperty.value = new Vector2( constrainedCenter.x, constrainedCenter.y );
      }
    } );

    const updateHighlightRectangleCenter = () => {
      highlightRectangle.center = viewHighlightRectangleCenterProperty.value.timesScalar( ZOOM_IN_CHART_SCALE_FACTOR );
    };

    // update the center of the highLightRectangle
    viewHighlightRectangleCenterProperty.link( updateHighlightRectangleCenter );

    const protonNumberLine = new NucleonNumberLine( chartTransform, protonCountProperty, Orientation.VERTICAL, {
      labelHighlightColorProperty: BANColors.protonColorProperty,
      axisLabel: BuildANucleusStrings.axis.protonNumber
    } );

    const neutronNumberLine = new NucleonNumberLine( chartTransform, neutronCountProperty, Orientation.HORIZONTAL, {
      labelHighlightColorProperty: BANColors.neutronColorProperty,
      axisLabel: BuildANucleusStrings.axis.neutronNumber
    } );
    neutronNumberLine.top = protonNumberLine.bottom;
    neutronNumberLine.left = protonNumberLine.right;
    nuclideChartNode.left = neutronNumberLine.left;

    super( { ...providedOptions, excludeInvisibleChildrenFromBounds: true, children:
        [ invisibleRectangle, nuclideChartNode, highlightRectangle, protonNumberLine, neutronNumberLine ] } );

    selectedNuclideChartProperty.link( selectedNuclideChart => {
      protonNumberLine.visible = selectedNuclideChart === 'partial';
      neutronNumberLine.visible = selectedNuclideChart === 'partial';
      highlightRectangle.visible = selectedNuclideChart === 'zoom';

      const scaleFactor = selectedNuclideChart === 'partial' ? 1 : ZOOM_IN_CHART_SCALE_FACTOR;
      const scaleFactorDenominator = selectedNuclideChart === 'partial' ? ZOOM_IN_CHART_SCALE_FACTOR : 1;
      nuclideChartNode.setScaleMagnitude( scaleFactor );
      highlightRectangle.setScaleMagnitude( scaleFactor );
      invisibleRectangle.setScaleMagnitude( scaleFactor );
      squareBounds.transform( Matrix3.scaling( scaleFactor / scaleFactorDenominator, scaleFactor / scaleFactorDenominator ) );
      invisibleRectangle.center = nuclideChartNode.center;
      updateHighlightRectangleCenter();
    } );
  }
}

buildANucleus.register( 'NuclideChartAndNumberLines', NuclideChartAndNumberLines );
export default NuclideChartAndNumberLines;
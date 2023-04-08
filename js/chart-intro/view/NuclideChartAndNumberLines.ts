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
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Property from '../../../../axon/js/Property.js';

const ZOOM_IN_CHART_SCALE_FACTOR = 0.4;

type NuclideChartNodeOptions = NodeOptions;

class NuclideChartAndNumberLines extends Node {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      selectedNuclideChartProperty: TReadOnlyProperty<SelectedChartType>,
                      providedOptions?: NuclideChartNodeOptions ) {

    super( { ...providedOptions, excludeInvisibleChildrenFromBounds: true } );

    const scaleFactor = 20;
    const chartTransform = new ChartTransform( {
      viewWidth: BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS * scaleFactor,
      modelXRange: new Range( BANConstants.DEFAULT_INITIAL_NEUTRON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS ),
      viewHeight: BANConstants.CHART_MAX_NUMBER_OF_PROTONS * scaleFactor,
      modelYRange: new Range( BANConstants.DEFAULT_INITIAL_PROTON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_PROTONS )
    } );

    // keep track of the current center of the highlight rectangle
    const modelHighlightRectangleCenterProperty = new Property( Vector2.ZERO );

    // create and add the nuclideChartNode
    const nuclideChartNode = new NuclideChartNode( protonCountProperty, neutronCountProperty, selectedNuclideChartProperty,
      chartTransform, modelHighlightRectangleCenterProperty );
    this.addChild( nuclideChartNode );

    // create and add a box around current nuclide
    const squareLength = chartTransform.modelToViewDeltaX( 5 );
    const highlightRectangle = new Rectangle( 0, 0,
      squareLength, squareLength, { stroke: Color.BLACK, lineWidth: 3 } );
    this.addChild( highlightRectangle );

    const squareBounds = new Bounds2( 1, 1, 11, 9 );

    // update the box position to current nuclide
    Multilink.multilink( [ protonCountProperty, neutronCountProperty ], ( protonCount, neutronCount ) => {
      const cellX = neutronCount;
      const cellY = protonCount;
      if ( AtomIdentifier.doesExist( protonCount, neutronCount ) ) {

        // constrain the bounds of the highlightRectangle
        const constrainedCenter = squareBounds.getConstrainedPoint( new Vector2( cellX, cellY ) );
        modelHighlightRectangleCenterProperty.value = new Vector2( constrainedCenter.x, constrainedCenter.y );
        highlightRectangle.center = chartTransform.modelToViewXY(
          ( modelHighlightRectangleCenterProperty.value.x + 0.75 ) * ZOOM_IN_CHART_SCALE_FACTOR,
          ( modelHighlightRectangleCenterProperty.value.y - 0.5 ) * ZOOM_IN_CHART_SCALE_FACTOR );
      }
    } );

    const protonNumberLine = new NucleonNumberLine( chartTransform, protonCountProperty, Orientation.VERTICAL, {
      labelHighlightColorProperty: BANColors.protonColorProperty,
      axisLabel: BuildANucleusStrings.axis.protonNumber
    } );
    this.addChild( protonNumberLine );

    const neutronNumberLine = new NucleonNumberLine( chartTransform, neutronCountProperty, Orientation.HORIZONTAL, {
      labelHighlightColorProperty: BANColors.neutronColorProperty,
      axisLabel: BuildANucleusStrings.axis.neutronNumber
    } );
    neutronNumberLine.top = protonNumberLine.bottom;
    neutronNumberLine.left = protonNumberLine.right;
    nuclideChartNode.left = neutronNumberLine.left;
    this.addChild( neutronNumberLine );

    selectedNuclideChartProperty.link( selectedNuclideChart => {
      protonNumberLine.visible = selectedNuclideChart === 'partial';
      neutronNumberLine.visible = selectedNuclideChart === 'partial';
      highlightRectangle.visible = selectedNuclideChart === 'zoom';
      nuclideChartNode.setScaleMagnitude( selectedNuclideChart === 'partial' ? 1 : ZOOM_IN_CHART_SCALE_FACTOR );
      highlightRectangle.setScaleMagnitude( selectedNuclideChart === 'partial' ? 1 : ZOOM_IN_CHART_SCALE_FACTOR );
    } );
  }
}

buildANucleus.register( 'NuclideChartAndNumberLines', NuclideChartAndNumberLines );
export default NuclideChartAndNumberLines;
// Copyright 2023, University of Colorado Boulder

/**
 * Icon node for zoomed-in NuclideChart.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import buildANucleus from '../../buildANucleus.js';
import NuclideChartNode from './NuclideChartNode.js';
import NuclideChartAccordionBox from './NuclideChartAccordionBox.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import { Shape } from '../../../../kite/js/imports.js';
import BANConstants from '../../common/BANConstants.js';

class ZoomInNuclideChartIconNode extends Node {

  public constructor() {

    const cellLayerNode = new Node();
    const smallChartTransform = NuclideChartAccordionBox.getChartTransform( 7 );
    NuclideChartNode.createNuclideChart( cellLayerNode, smallChartTransform, smallChartTransform.modelToViewDeltaX( 1 ) );

    const squareLength = smallChartTransform.modelToViewDeltaX( 5 + ( 2 * BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ) );
    const zoomInShape = Shape.rectangle( smallChartTransform.modelToViewX( 0 - BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ),
      smallChartTransform.modelToViewY( 4 + BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ),
      squareLength, squareLength );
    cellLayerNode.clipArea = zoomInShape;

    const borderPath = new Path( zoomInShape, { stroke: Color.BLACK, lineWidth: 0.5 } );

    super( { children: [ cellLayerNode, borderPath ] } );
  }
}

buildANucleus.register( 'ZoomInNuclideChartIconNode', ZoomInNuclideChartIconNode );
export default ZoomInNuclideChartIconNode;
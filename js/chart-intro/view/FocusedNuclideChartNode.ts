// Copyright 2023, University of Colorado Boulder

/**
 * Node that focuses on current nuclide in NuclideChartNode by drawing a square box outline with an area of 5x5 cells
 * around the current nuclide. All cells outside this area are 'grayed out'.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import NuclideChartNode from './NuclideChartNode.js';
import buildANucleus from '../../buildANucleus.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import BANConstants from '../../common/BANConstants.js';
import { Color, Rectangle } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

const HIGHLIGHT_RECTANGLE_LINE_WIDTH = 1.5;

class FocusedNuclideChartNode extends NuclideChartNode {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      chartTransform: ChartTransform, showMagicNumbersBooleanProperty: TReadOnlyProperty<boolean> ) {
    super( protonCountProperty, neutronCountProperty, chartTransform, {
      cellTextFontSize: 6,
      arrowSymbol: false,
      showMagicNumbersBooleanProperty: showMagicNumbersBooleanProperty
    } );

    // keep track of the current center of the highlight rectangle
    const viewHighlightRectangleCenterProperty = new DerivedProperty(
      [ protonCountProperty, neutronCountProperty ], ( protonNumber, neutronNumber ) => {
        const cellX = neutronNumber;
        const cellY = protonNumber;
        if ( AtomIdentifier.doesExist( protonNumber, neutronNumber ) ) {

          // constrain the bounds of the highlightRectangle
          const constrainedCenter = chartTransform.modelToViewXY( cellX + BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE,
            cellY + BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE );
          return new Vector2( constrainedCenter.x, constrainedCenter.y );
        }
        else {

          // keep the current center if the cell built does not exist
          return highlightRectangle.center;
        }
      } );

    const nuclideChartBounds = this.bounds.copy();
    const backgroundRectangle = new Rectangle( this.bounds.dilated( 2 ), { stroke: 'white' } );
    this.addChild( backgroundRectangle );

    // create and add a box around current nuclide
    const squareLength = chartTransform.modelToViewDeltaX( BANConstants.ZOOM_IN_CHART_SQUARE_LENGTH );
    const highlightRectangle = new Rectangle( 0, 0,
      squareLength, squareLength, { stroke: Color.BLACK, lineWidth: HIGHLIGHT_RECTANGLE_LINE_WIDTH } );
    this.addChild( highlightRectangle );

    const updateHighlightRectangleCenter = () => {
      highlightRectangle.center = viewHighlightRectangleCenterProperty.value;
      const shift = ( HIGHLIGHT_RECTANGLE_LINE_WIDTH -
                      chartTransform.modelToViewDeltaX( BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ) ) / 2;
      if ( highlightRectangle.left < nuclideChartBounds.left ) {
        highlightRectangle.left = nuclideChartBounds.left - shift;
      }
      if ( highlightRectangle.right > nuclideChartBounds.right ) {

        highlightRectangle.right = nuclideChartBounds.right + shift;
      }
      if ( highlightRectangle.top < nuclideChartBounds.top ) {
        highlightRectangle.top = nuclideChartBounds.top - shift;
      }
      if ( highlightRectangle.bottom > nuclideChartBounds.bottom ) {
        highlightRectangle.bottom = nuclideChartBounds.bottom + shift;
      }

      // make opaque any cells too far away from the center of the highlight rectangle
      this.cells.forEach( nuclideChartCellRow => {
        nuclideChartCellRow.forEach( nuclideChartCell => {
          if ( nuclideChartCell ) {
            const protonDelta = Math.abs( chartTransform.viewToModelY( highlightRectangle.center.y )
                                          - BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE - nuclideChartCell?.cellModel.protonNumber );
            const neutronDelta = Math.abs( chartTransform.viewToModelX( highlightRectangle.center.x )
                                           - BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE - nuclideChartCell?.cellModel.neutronNumber );
            nuclideChartCell?.makeOpaque( protonDelta, neutronDelta );
          }
        } );
      } );
    };

    // update the center of the highLightRectangle
    viewHighlightRectangleCenterProperty.link( updateHighlightRectangleCenter );
  }
}

buildANucleus.register( 'FocusedNuclideChartNode', FocusedNuclideChartNode );
export default FocusedNuclideChartNode;
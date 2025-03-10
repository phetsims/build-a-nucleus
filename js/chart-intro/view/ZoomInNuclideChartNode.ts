// Copyright 2023-2025, University of Colorado Boulder

/**
 * Node that shows zoom-in on nuclide chart.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import NuclideChartNode from './NuclideChartNode.js';

class ZoomInNuclideChartNode extends NuclideChartNode {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      chartTransform: ChartTransform, showMagicNumbersProperty: TReadOnlyProperty<boolean> ) {

    super( protonCountProperty, neutronCountProperty, chartTransform, {
      cellTextFontSize: 18,
      arrowSymbol: true,
      showMagicNumbersProperty: showMagicNumbersProperty
    } );

    // Create and add the border outline to the chart.
    const borderPath = new Path( null, { stroke: Color.BLACK, lineWidth: 1.5 } );
    this.addChild( borderPath );

    // Length to clip the chart to.
    const squareLength = chartTransform.modelToViewDeltaX( BANConstants.ZOOM_IN_CHART_SQUARE_LENGTH +
                                                           ( 2 * BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ) );

    let initialized = false;

    // Update the clip area of the chart whenever the proton or neutron number change.
    Multilink.multilink( [ protonCountProperty, neutronCountProperty ], ( protonNumber, neutronNumber ) => {
      const cellX = neutronNumber;
      const cellY = protonNumber;

      // The default could very well be p0,n0, which doesn't exist, so eagerly set things up the first time.
      if ( AtomIdentifier.doesExist( protonNumber, neutronNumber ) || !initialized ) {
        initialized = true;

        // Limit the bounds of the ZoomInNuclideChartNode to avoid showing white space.
        const clampedCellX = Utils.clamp( cellX, 2, 10 );
        const clampedCellY = Utils.clamp( cellY, 2, 8 );

        // Clip chart to 2 cellLength's around current cell.
        const clipArea = Shape.rectangle(
          chartTransform.modelToViewX( clampedCellX - 2 - BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ),
          chartTransform.modelToViewY( clampedCellY + 2 + BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ),
          squareLength, squareLength );
        borderPath.shape = clipArea;
        this.clipArea = clipArea;
      }
    } );

  }
}

buildANucleus.register( 'ZoomInNuclideChartNode', ZoomInNuclideChartNode );
export default ZoomInNuclideChartNode;
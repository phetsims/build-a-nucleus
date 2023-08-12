// Copyright 2023, University of Colorado Boulder

/**
 * Node that shows zoom-in on nuclide chart.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import buildANucleus from '../../buildANucleus.js';
import NuclideChartNode from './NuclideChartNode.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import { Shape } from '../../../../kite/js/imports.js';
import Multilink from '../../../../axon/js/Multilink.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import { Color, Path } from '../../../../scenery/js/imports.js';
import Utils from '../../../../dot/js/Utils.js';
import BANConstants from '../../common/BANConstants.js';

class ZoomInNuclideChartNode extends NuclideChartNode {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      chartTransform: ChartTransform, showMagicNumbersProperty: TReadOnlyProperty<boolean> ) {

    super( protonCountProperty, neutronCountProperty, chartTransform, {
      cellTextFontSize: 18,
      arrowSymbol: true,
      showMagicNumbersProperty: showMagicNumbersProperty
    } );

    const squareLength = chartTransform.modelToViewDeltaX( 5 + ( 2 * BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ) );

    const borderPath = new Path( null, { stroke: Color.BLACK, lineWidth: 1.5 } );
    this.addChild( borderPath );
    Multilink.multilink( [ protonCountProperty, neutronCountProperty ], ( protonNumber, neutronNumber ) => {
      const cellX = neutronNumber;
      const cellY = protonNumber;
      if ( AtomIdentifier.doesExist( protonNumber, neutronNumber ) ) {

        // limit the bounds of the ZoomInNuclideChartNode to avoid showing white space
        const clampedCellX = Utils.clamp( cellX, 2, 10 );
        const clampedCellY = Utils.clamp( cellY, 2, 8 );

        // clip chart to 2 cellLength's around current cell
        const clipArea = Shape.rectangle( chartTransform.modelToViewX( clampedCellX - 2 - BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ),
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
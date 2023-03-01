// Copyright 2023, University of Colorado Boulder

/**
 * Node that represents a single cell in the nuclide chart.
 *
 * @author Luisa Vargas
 */

import { Color, Rectangle } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';

const CELL_LENGTH = 25;
class NuclideChartCell extends Rectangle {

  public constructor( normalFill: Color ) {

    super( 0, 0, CELL_LENGTH, CELL_LENGTH, 0, 0, {
      stroke: 'black',
      lineWidth: 1,
      fill: normalFill
    } );

  }
}

buildANucleus.register( 'NuclideChartCell', NuclideChartCell );
export default NuclideChartCell;
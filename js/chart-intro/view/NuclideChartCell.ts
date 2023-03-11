// Copyright 2023, University of Colorado Boulder

/**
 * Node that represents a single cell in the nuclide chart.
 *
 * @author Luisa Vargas
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text, Color, Rectangle } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import DecayType from '../../common/view/DecayType.js';

class NuclideChartCell extends Rectangle {

  private readonly labelText: Text;

  public constructor( normalFill: Color, cellLength: number, elementSymbol: string ) {

    super( 0, 0, cellLength, cellLength, 0, 0, {
      stroke: Color.GRAY,
      lineWidth: 1,
      fill: normalFill
    } );

    // labels the cell with the elementSymbol
    this.labelText = new Text( elementSymbol, {
      font: new PhetFont( 14 ),
      center: this.center,
      fill: normalFill === DecayType.ALPHA_DECAY.colorProperty.value ||
            normalFill === DecayType.BETA_MINUS_DECAY.colorProperty.value ?
            Color.BLACK : Color.WHITE,
      maxWidth: cellLength - 5
    } );
    this.labelText.visible = false;
    this.addChild( this.labelText );

  }

  // show the label text when highlighting the cell
  public setHighlighted( highlighted: boolean ): void {
    this.labelText.visible = highlighted;
  }
}

buildANucleus.register( 'NuclideChartCell', NuclideChartCell );
export default NuclideChartCell;
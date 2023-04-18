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
  public readonly protonNumber: number;
  public readonly neutronNumber: number;
  public readonly decayType: string;

  public constructor( normalFill: Color, cellLength: number, elementSymbol: string, protonNumber: number, neutronNumber: number,
                      decayType: string ) {

    super( 0, 0, cellLength, cellLength, 0, 0, {
      stroke: Color.GRAY,
      lineWidth: 0.5,
      fill: normalFill
    } );

    // labels the cell with the elementSymbol
    this.labelText = new Text( elementSymbol, {
      font: new PhetFont( 14 ),
      center: this.center,
      fill: normalFill === DecayType.ALPHA_DECAY.colorProperty.value ||
            normalFill === DecayType.BETA_MINUS_DECAY.colorProperty.value ?
            Color.BLACK : Color.WHITE,
      maxWidth: cellLength * 0.75
    } );
    this.labelText.visible = false;
    this.addChild( this.labelText );

    this.protonNumber = protonNumber;
    this.neutronNumber = neutronNumber;
    this.decayType = decayType;
  }

  // show the label text when highlighting the cell
  public setHighlighted( highlighted: boolean ): void {
    this.labelText.visible = highlighted;
  }

  // make cell more opaque to de-emphasize the cell
  public makeOpaque( protonDelta: number, neutronDelta: number ): void {
    this.opacity = protonDelta > 2 || neutronDelta > 2 ? 0.65 : 1;
  }
}

buildANucleus.register( 'NuclideChartCell', NuclideChartCell );
export default NuclideChartCell;
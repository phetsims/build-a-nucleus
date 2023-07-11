// Copyright 2023, University of Colorado Boulder

/**
 * DecaySymbolNode shows a static symbol representation using the provided numbers.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Luisa Vargas
 * */

import shred from '../../../../shred/js/shred.js';
import { HBox, Node, NodeOptions, Text, VBox } from '../../../../scenery/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';

// types
type SelfOptions = {
  symbolString?: string;
};
export type DecaySymbolNodeOptions = SelfOptions & NodeOptions;

// constants
const NUMBER_FONT = new PhetFont( 100 );

class DecaySymbolNode extends Node {

  public constructor( protonCount: number,
                      massNumber: number,
                      providedOptions?: DecaySymbolNodeOptions ) {

    const options = optionize<DecaySymbolNodeOptions, SelfOptions, NodeOptions>()( {
      symbolString: protonCount > 0 ? AtomIdentifier.getSymbol( protonCount ) : '-',
      scale: 0.15
    }, providedOptions );

    super( options );

    // Add the proton count display.
    const protonCountDisplay = new Text( protonCount, {
      font: NUMBER_FONT,
      fill: PhetColorScheme.RED_COLORBLIND,
      boundsMethod: 'accurate'
    } );

    // Add the mass number display.
    const massNumberDisplay = new Text( massNumber, {
      font: NUMBER_FONT,
      boundsMethod: 'accurate'
    } );

    const numbersVBox = new VBox( {
      children: [ massNumberDisplay, protonCountDisplay ],
      spacing: 15,
      align: 'right'
    } );

    // Add the symbol text.
    const symbolText = new Text( options.symbolString, {
      font: new PhetFont( 150 )
    } );

    const symbolAndNumbersHBox = new HBox( {
      children: [ numbersVBox, symbolText ],
      spacing: 20
    } );
    this.addChild( symbolAndNumbersHBox );
  }
}

shred.register( 'DecaySymbolNode', DecaySymbolNode );
export default DecaySymbolNode;
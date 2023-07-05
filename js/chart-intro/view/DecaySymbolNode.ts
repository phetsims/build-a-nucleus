// Copyright 2023, University of Colorado Boulder

/**
 * Co-opt SymbolNode to support a similar view for the decay symbol in a Nuclide decay equation.
 *
 * This overrides the normal behavior of SymbolNode, which updates the text when the mass or proton changes.
 * NOTE: This Node is expecting to have a static mass, and never change symbols after creation. Don't change the
 * provided Properties after construction.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Luisa Vargas
 * */

import shred from '../../../../shred/js/shred.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import SymbolNode, { SymbolNodeOptions } from '../../../../shred/js/view/SymbolNode.js';

type DecaySymbolNodeOptions = SymbolNodeOptions;

class DecaySymbolNode extends SymbolNode {
  public constructor( symbolString: string, protonCountProperty: NumberProperty | TReadOnlyProperty<number>,
                      massNumberProperty: TReadOnlyProperty<number>,
                      options?: DecaySymbolNodeOptions ) {

    super( protonCountProperty, massNumberProperty, options );
    this.symbolText.string = symbolString;
  }
}

shred.register( 'DecaySymbolNode', DecaySymbolNode );
export default DecaySymbolNode;
// Copyright 2022-2023, University of Colorado Boulder

import { Rectangle } from '../../../../scenery/js/imports.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import PeriodicTableNode from '../../../../shred/js/view/PeriodicTableNode.js';
import SymbolNode from '../../../../shred/js/view/SymbolNode.js';
import Panel from '../../../../sun/js/Panel.js';
import buildANucleus from '../../buildANucleus.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';

/**
 * A node that presents a periodic table and an enlarged and dynamic isotope symbol above the table.
 *
 * @author Luisa Vargas
 */

class PeriodicTableAndIsotopeSymbol extends Panel {

  public constructor( particleAtom: ParticleAtom ) {

    const panelContents = new Rectangle( 0, 0, 150, 100 ); // empirically determined

    // Create and add the periodic table.
    const periodicTable = new PeriodicTableNode( particleAtom, {
      strokeHighlightWidth: 1,
      interactiveMax: 0,
      disabledCellColor: BANColors.disabledPeriodicTableCellColorProperty,
      selectedCellColor: BANColors.selectedPeriodicTableCellFillAndStrokeColorProperty,
      strokeHighlightColor: BANColors.selectedPeriodicTableCellFillAndStrokeColorProperty,
      labelTextHighlightFill: BANColors.selectedPeriodicTableCellLabelTextColorProperty
    } );
    periodicTable.scale( 0.75 );
    panelContents.addChild( periodicTable );

    // Create and add the symbol node in an accordion box.
    const symbolNode = new SymbolNode( particleAtom.protonCountProperty, particleAtom.massNumberProperty, {
      scale: 0.15
    } );
    panelContents.addChild( symbolNode );

    // Do the layout. This positions the symbol to fit into the top portion of the table. The periodic table is 18 cells
    // wide, and this needs to be centered over the 8th column to be in the right place.
    symbolNode.centerX = ( 7.5 / 18 ) * periodicTable.width;
    symbolNode.top = 0;
    periodicTable.top = symbolNode.bottom - ( periodicTable.height / 7 * 2.5 );
    periodicTable.left = 0;

    super( panelContents, BANConstants.PANEL_OPTIONS );
  }
}

buildANucleus.register( 'PeriodicTableAndIsotopeSymbol', PeriodicTableAndIsotopeSymbol );
export default PeriodicTableAndIsotopeSymbol;
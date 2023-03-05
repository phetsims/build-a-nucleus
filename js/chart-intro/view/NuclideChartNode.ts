// Copyright 2023, University of Colorado Boulder

/**
 * Node that represents the initial part of the Nuclide chart, up to 10 protons and 12 neutrons.
 *
 * @author Luisa Vargas
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { Node } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import buildANucleus from '../../buildANucleus.js';
import NuclideChartCell from './NuclideChartCell.js';
import BANColors from '../../common/BANColors.js';
import DecayType from '../../common/view/DecayType.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Multilink from '../../../../axon/js/Multilink.js';

// constants
// 2D array that defines the table structure.
// The rows are the proton number, in reverse. For example, the last row is protonNumber = 0, while the first row is
// protonNumber = POPULATED_CELLS.length - 1 = 10
// The numbers in the rows are the neutronNumber.
const POPULATED_CELLS = [
  [ 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
  [ 1, 2, 3, 4, 5, 6, 7, 8 ],
  [ 0, 1, 2, 3, 4, 5, 6 ],
  [ 1, 4, 6 ]
];

class NuclideChartNode extends Node {

  // the cells of the table
  private readonly cells: NuclideChartCell[][];

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number> ) {
    super();

    const cellDimension = 25;
    this.cells = []; // TODO: do I need to dispose the cells? otherwise doesn't need to be class property
    for ( let p = 0; p < POPULATED_CELLS.length; p++ ) {
      const populatedCellsInRow = POPULATED_CELLS[ p ];
      const currentProtonLoopCount = POPULATED_CELLS.length - p - 1; // the current proton count in the loop
      const rowCells = [];
      for ( let n = 0; n < populatedCellsInRow.length; n++ ) {

        // get first decay in available decays to color the cell according to that decay type
        const decayType = AtomIdentifier.getAvailableDecays( currentProtonLoopCount, populatedCellsInRow[ n ] )[ 0 ];

        const color = AtomIdentifier.isStable( currentProtonLoopCount, populatedCellsInRow[ n ] ) ? BANColors.stableColorProperty.value :
                      decayType === undefined ? BANColors.unknownColorProperty.value : // no available decays, unknown decay type
                      DecayType.enumeration.getValue( decayType.toString() ).colorProperty.value;

        const elementSymbol = AtomIdentifier.getSymbol( currentProtonLoopCount );
        const cell = new NuclideChartCell( color, elementSymbol );
        cell.translation = new Vector2( populatedCellsInRow[ n ] * cellDimension, p * cellDimension );
        this.addChild( cell );
        rowCells.push( cell );
      }
      this.cells.push( rowCells );
    }

    // Highlight the cell that corresponds to the nuclide.
    let highlightedCell: NuclideChartCell | null = null;
    Multilink.multilink( [ protonCountProperty, neutronCountProperty ], ( protonCount: number, neutronCount: number ) => {
      if ( highlightedCell !== null ) {
        highlightedCell.setHighlighted( false );
      }

      // highlight the cell if it exists
      if ( AtomIdentifier.doesExist( protonCount, neutronCount ) && ( protonCount !== 0 || neutronCount !== 0 ) ) {
        const protonRowIndex = POPULATED_CELLS.length - protonCount - 1;
        const neutronRowIndex = POPULATED_CELLS[ protonRowIndex ].indexOf( neutronCount );
        highlightedCell = this.cells[ protonRowIndex ][ neutronRowIndex ];
        highlightedCell.setHighlighted( true );
      }
    } );
  }
}

buildANucleus.register( 'NuclideChartNode', NuclideChartNode );
export default NuclideChartNode;
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

// constants
// 2D array that defines the table structure. The rows are the proton number and the number is the neutron number.
/*
const POPULATED_CELLS = [
  [ 1, 4, 6 ],
  [ 0, 1, 2, 3, 4, 5, 6 ],
  [ 1, 2, 3, 4, 5, 6, 7, 8 ],
  [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
  [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
  [ 5, 6, 7, 8, 9, 10, 11, 12 ]
];
*/

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

  private cells: NuclideChartCell[];

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number> ) {
    super();

    const cellDimension = 25;
    this.cells = [];
    for ( let p = 0; p < POPULATED_CELLS.length; p++ ) {
      const populatedCellsInRow = POPULATED_CELLS[ p ];
      const currentProtonLoopCount = POPULATED_CELLS.length - p - 1;
      for ( let n = 0; n < populatedCellsInRow.length; n++ ) {

        // get first decay in available decays to color the cell according to that decay type
        const decayType = AtomIdentifier.getAvailableDecays( currentProtonLoopCount, populatedCellsInRow[ n ] )[ 0 ];

        const color = AtomIdentifier.isStable( currentProtonLoopCount, populatedCellsInRow[ n ] ) ? BANColors.stableColorProperty.value :
                      decayType === undefined ? BANColors.unknownColorProperty.value : // no available decays, unknown decay type
                      DecayType.enumeration.getValue( decayType.toString() ).colorProperty.value;
        const cell = new NuclideChartCell( color );
        cell.translation = new Vector2( populatedCellsInRow[ n ] * cellDimension, p * cellDimension );
        this.addChild( cell );
        this.cells.push( cell );
      }
    }
  }
}

buildANucleus.register( 'NuclideChartNode', NuclideChartNode );
export default NuclideChartNode;
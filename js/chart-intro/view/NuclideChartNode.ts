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
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Orientation from '../../../../phet-core/js/Orientation.js';

// constants
// 2D array that defines the table structure.
// The rows are the proton number, for example the first row is protonNumber = 0. The numbers in the rows are the neutron number.
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

class NuclideChartNode extends Node {
  private readonly cells: ( NuclideChartCell | null )[][];

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      selectedNuclideChartProperty: TReadOnlyProperty<string>, chartTransform: ChartTransform ) {
    super();

    // keep track of the cells of the chart
    this.cells = [];

    // create and add the chart cells to the chart. row is proton number and column is neutron number.
    chartTransform.forEachSpacing( Orientation.VERTICAL, 1, 0, 'strict', ( row, viewPosition ) => {
      const populatedCellsInRow = POPULATED_CELLS[ row ];
      const rowCells: ( NuclideChartCell | null )[] = [];
      populatedCellsInRow.forEach( column => {

        // get first decay in available decays to color the cell according to that decay type
        const decayType = AtomIdentifier.getAvailableDecays( row, column )[ 0 ];

        const color = AtomIdentifier.isStable( row, column ) ? BANColors.stableColorProperty.value :
                          decayType === undefined ? BANColors.unknownColorProperty.value : // no available decays, unknown decay type
                          DecayType.enumeration.getValue( decayType.toString() ).colorProperty.value;

        const elementSymbol = AtomIdentifier.getSymbol( row );

        // create and add the NuclideChartCell
        const cell = new NuclideChartCell( color, chartTransform.modelToViewDeltaX( 1 ), elementSymbol, row, column );
        cell.translation = new Vector2( chartTransform.modelToViewX( column ), viewPosition );
        this.addChild( cell );
        rowCells.push( cell );
      } );
      this.cells.push( rowCells );
    } );

    // highlight the cell that corresponds to the nuclide.
    let highlightedCell: NuclideChartCell | null = null;
    Multilink.multilink( [ protonCountProperty, neutronCountProperty ], ( protonCount: number, neutronCount: number ) => {
      if ( highlightedCell !== null ) {
        highlightedCell.setHighlighted( false );
      }

      // highlight the cell if it exists
      if ( AtomIdentifier.doesExist( protonCount, neutronCount ) && ( protonCount !== 0 || neutronCount !== 0 ) ) {
        const protonRowIndex = protonCount;
        const neutronRowIndex = POPULATED_CELLS[ protonRowIndex ].indexOf( neutronCount );
        highlightedCell = this.cells[ protonRowIndex ][ neutronRowIndex ];
        highlightedCell!.setHighlighted( true );
      }

      if ( selectedNuclideChartProperty.value === 'zoom' ) {
        this.cells.forEach( nuclideChartCellRow => {
          nuclideChartCellRow.forEach( nuclideChartCell => {
            if ( nuclideChartCell ) {
              const protonDelta = Math.abs( nuclideChartCell?.protonNumber - protonCount );
              const neutronDelta = Math.abs( nuclideChartCell?.neutronNumber - protonCount );
              nuclideChartCell?.makeOpaque( protonDelta, neutronDelta );
            }
          } );
        } );
      }
    } );
  }
}

buildANucleus.register( 'NuclideChartNode', NuclideChartNode );
export default NuclideChartNode;
// Copyright 2023, University of Colorado Boulder

/**
 * Node that represents the initial part of the Nuclide chart, up to 10 protons and 12 neutrons.
 *
 * @author Luisa Vargas
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { Color, GridBox, Node, NodeOptions, Rectangle, Text } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import buildANucleus from '../../buildANucleus.js';
import NuclideChartCell from './NuclideChartCell.js';
import BANColors from '../../common/BANColors.js';
import DecayType from '../../common/view/DecayType.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Multilink from '../../../../axon/js/Multilink.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANConstants from '../../common/BANConstants.js';

type SelfOptions = {
  cellTextFontSize: number;
  arrowSymbol: boolean;
};

type NuclideChartNodeOptions = SelfOptions & NodeOptions;

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
  protected readonly cells: ( NuclideChartCell | null )[][];

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      chartTransform: ChartTransform, providedOptions: NuclideChartNodeOptions ) {

    const options = optionize<NuclideChartNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );
    super( options );

    // keep track of the cells of the chart
    this.cells = [];
    const cellLength = chartTransform.modelToViewDeltaX( 1 );

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

        // create and add the NuclideChartCell
        const cell = new NuclideChartCell( cellLength, row, column, decayType, {
          fill: color,
          cellTextFontSize: options.cellTextFontSize
        } );
        cell.translation = new Vector2( chartTransform.modelToViewX( column ), viewPosition );
        this.addChild( cell );
        rowCells.push( cell );
      } );
      this.cells.push( rowCells );
    } );

    const arrowNode = new ArrowNode( 0, 0, 0, 0, {
      tailWidth: 3,
      fill: Color.WHITE,
      stroke: Color.BLACK,
      lineWidth: 0.5,
      visible: false
    } );
    if ( options.arrowSymbol ) {
      this.addChild( arrowNode );
    }

    // labels the cell with the elementSymbol
    const labelDimension = cellLength * 0.75;
    const labelTextBackground = new Rectangle( 0, 0, labelDimension, labelDimension );
    const labelText = new Text( '.', {
      fontSize: options.cellTextFontSize,
      maxWidth: labelDimension
    } );
    const hBox = new GridBox( { rows: [ [ labelText ] ], xAlign: 'center', yAlign: 'center', stretch: true, grow: 1,
      preferredHeight: labelDimension, preferredWidth: labelDimension } );
    labelTextBackground.addChild( hBox );
    this.addChild( labelTextBackground );

    // highlight the cell that corresponds to the nuclide and make opaque any surrounding cells too far away from the nuclide
    let highlightedCell: NuclideChartCell | null = null;
    Multilink.multilink( [ protonCountProperty, neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => {

        const currentCellCenter = chartTransform.modelToViewXY( neutronCount + BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE,
          protonCount + BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE );

        // highlight the cell if it exists
        if ( AtomIdentifier.doesExist( protonCount, neutronCount ) && ( protonCount !== 0 || neutronCount !== 0 ) ) {
          const protonRowIndex = protonCount;
          const neutronRowIndex = POPULATED_CELLS[ protonRowIndex ].indexOf( neutronCount );
          highlightedCell = this.cells[ protonRowIndex ][ neutronRowIndex ];
          assert && assert( highlightedCell, 'The highlighted cell is null at protonRowIndex = ' + protonRowIndex +
                                             ' neutronRowIndex = ' + neutronRowIndex );

          const decayType = highlightedCell!.decayType;
          if ( !AtomIdentifier.isStable( protonCount, neutronCount ) && decayType !== undefined ) {
            const direction = decayType === DecayType.NEUTRON_EMISSION.name ? new Vector2( neutronCount - 1, protonCount ) :
                              decayType === DecayType.PROTON_EMISSION.name ? new Vector2( neutronCount, protonCount - 1 ) :
                              decayType === DecayType.BETA_PLUS_DECAY.name ? new Vector2( neutronCount + 1, protonCount - 1 ) :
                              decayType === DecayType.BETA_MINUS_DECAY.name ? new Vector2( neutronCount - 1, protonCount + 1 ) :
                              new Vector2( neutronCount - 2, protonCount - 2 );
            const arrowTip = chartTransform.modelToViewXY( direction.x + BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE,
              direction.y + BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE );
            arrowNode.setTailAndTip( currentCellCenter.x, currentCellCenter.y, arrowTip.x, arrowTip.y );
            arrowNode.visible = true;
          }
          else {
            arrowNode.visible = false;
          }

          labelTextBackground.visible = true;
          labelText.string = AtomIdentifier.getSymbol( protonCount );
          labelTextBackground.center = currentCellCenter;
          labelText.fill = highlightedCell?.decayType === DecayType.ALPHA_DECAY.name ||
                           highlightedCell?.decayType === DecayType.BETA_MINUS_DECAY.name ?
                           Color.BLACK : Color.WHITE;
          labelTextBackground.fill = highlightedCell!.decayBackgroundColor;
        }
        else {
          arrowNode.visible = false;
          labelTextBackground.visible = false;
        }
      } );
  }
}

buildANucleus.register( 'NuclideChartNode', NuclideChartNode );
export default NuclideChartNode;
// Copyright 2023, University of Colorado Boulder

/**
 * Node that represents the initial part of the Nuclide chart, up to 10 protons and 12 neutrons.
 *
 * @author Luisa Vargas
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { Color, GridBox, Node, NodeOptions, Path, Text } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import buildANucleus from '../../buildANucleus.js';
import NuclideChartCell from './NuclideChartCell.js';
import DecayType from '../../common/model/DecayType.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Multilink from '../../../../axon/js/Multilink.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANConstants from '../../common/BANConstants.js';
import { Shape } from '../../../../kite/js/imports.js';
import ChartIntroModel from '../model/ChartIntroModel.js';
import NuclideChartCellModel from '../model/NuclideChartCellModel.js';

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
  protected readonly cells: NuclideChartCell[][];

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      chartTransform: ChartTransform, providedOptions: NuclideChartNodeOptions ) {

    const options = optionize<NuclideChartNodeOptions, SelfOptions, NodeOptions>()( {
      excludeInvisibleChildrenFromBounds: true
    }, providedOptions );
    super( options );

    const cellLength = chartTransform.modelToViewDeltaX( 1 );
    const cellLayerNode = new Node();

    // keep track of the cells of the chart
    this.cells = NuclideChartNode.createNuclideChart( cellLayerNode, chartTransform, cellLength );

    this.addChild( cellLayerNode );

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

    // make the labelTextBackground an octagon shape
    const vertices = _.times( 8, side => {
      return new Vector2( Math.cos( ( 2 * side * Math.PI ) / 8 ), Math.sin( ( 2 * side * Math.PI ) / 8 ) ).times( labelDimension * 0.6 );
    } );
    const octagonShape = Shape.polygon( vertices );
    const labelTextBackground = new Path( octagonShape, { rotation: Math.PI / 8 } );
    const labelText = new Text( '', {
      fontSize: options.cellTextFontSize,
      maxWidth: labelDimension
    } );
    const gridBox = new GridBox( {
      rows: [ [ labelText ] ], xAlign: 'center', yAlign: 'center', stretch: true, grow: 1,
      preferredHeight: labelDimension, preferredWidth: labelDimension
    } );
    const labelContainer = new Node( { children: [ labelTextBackground, gridBox ] } );
    labelTextBackground.center = gridBox.center;
    this.addChild( labelContainer );

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

          const decayType = highlightedCell.cellModel.decayType;
          if ( !AtomIdentifier.isStable( protonCount, neutronCount ) && decayType !== null ) {
            const direction = decayType === DecayType.NEUTRON_EMISSION ? new Vector2( neutronCount - 1, protonCount ) :
                              decayType === DecayType.PROTON_EMISSION ? new Vector2( neutronCount, protonCount - 1 ) :
                              decayType === DecayType.BETA_PLUS_DECAY ? new Vector2( neutronCount + 1, protonCount - 1 ) :
                              decayType === DecayType.BETA_MINUS_DECAY ? new Vector2( neutronCount - 1, protonCount + 1 ) :
                              new Vector2( neutronCount - 2, protonCount - 2 );
            const arrowTip = chartTransform.modelToViewXY( direction.x + BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE,
              direction.y + BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE );
            arrowNode.setTailAndTip( currentCellCenter.x, currentCellCenter.y, arrowTip.x, arrowTip.y );
            arrowNode.visible = true;
          }
          else {
            arrowNode.visible = false;
          }

          labelContainer.visible = true;
          labelText.string = AtomIdentifier.getSymbol( protonCount );
          labelContainer.center = currentCellCenter;
          labelText.fill = this.getCellLabelFill( highlightedCell.cellModel );
          labelTextBackground.fill = highlightedCell.decayBackgroundColor;
        }
        else {
          arrowNode.visible = false;
          labelContainer.visible = false;
        }
      } );
  }

  // Based on the fill of the cell (which is based on the decay type), choose a light or dark text fill.
  private getCellLabelFill( cellModel?: NuclideChartCellModel ): Color {
    if ( !cellModel ) {
      return Color.WHITE;
    }
    return cellModel.decayType === DecayType.ALPHA_DECAY ||
           cellModel.decayType === DecayType.BETA_MINUS_DECAY ||
           ( !cellModel.decayType && !cellModel.isStable ) ?
           Color.BLACK : Color.WHITE;
  }

  public static createNuclideChart( cellLayerNode: Node, chartTransform: ChartTransform, cellLength: number ): NuclideChartCell[][] {
    const cells: NuclideChartCell[][] = [];

    // create and add the chart cells to the chart. row is proton number and column is neutron number.
    chartTransform.forEachSpacing( Orientation.VERTICAL, 1, 0, 'strict', ( row, viewPosition ) => {
      const populatedCellsInRow = POPULATED_CELLS[ row ];
      const rowCells: NuclideChartCell[] = [];
      populatedCellsInRow.forEach( ( column, columnIndex ) => {

        // create and add the NuclideChartCell
        const cell = new NuclideChartCell( cellLength, ChartIntroModel.cellModelArray[ row ][ columnIndex ], {
          lineWidth: chartTransform.modelToViewDeltaX( BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH )
        } );
        cell.translation = new Vector2( chartTransform.modelToViewX( column ), viewPosition );
        cellLayerNode.addChild( cell );
        rowCells.push( cell );
      } );
      cells.push( rowCells );
    } );

    return cells;
  }

}

buildANucleus.register( 'NuclideChartNode', NuclideChartNode );
export default NuclideChartNode;
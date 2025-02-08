// Copyright 2023-2025, University of Colorado Boulder

/**
 * Node that represents the initial part of the Nuclide chart, up to 10 protons and 12 neutrons.
 *
 * @author Luisa Vargas
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ArrowNode, { ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import GridBox from '../../../../scenery/js/layout/nodes/GridBox.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import buildANucleus from '../../buildANucleus.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';
import AlphaParticle from '../../common/model/AlphaParticle.js';
import BANModel from '../../common/model/BANModel.js';
import DecayType from '../../common/model/DecayType.js';
import ChartIntroModel from '../model/ChartIntroModel.js';
import NuclideChartCellModel from '../model/NuclideChartCellModel.js';
import { N_ONE_CAPACITY, N_ZERO_CAPACITY } from '../model/ShellModelNucleus.js';
import NuclideChartCell from './NuclideChartCell.js';

type SelfOptions = {
  cellTextFontSize: number;
  arrowSymbol: boolean;
  showMagicNumbersProperty?: TReadOnlyProperty<boolean>;
};

export type NuclideChartNodeOptions = SelfOptions & NodeOptions;

// Applies to both proton and neutron numbers see showMagicNumbersProperty for details.
const MAGIC_NUMBERS = [ N_ZERO_CAPACITY, N_ZERO_CAPACITY + N_ONE_CAPACITY ];

class NuclideChartNode extends Node {

  // Keep track of the cells of the chart.
  protected readonly cells: NuclideChartCell[][];

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      chartTransform: ChartTransform, providedOptions: NuclideChartNodeOptions ) {

    const options =
      optionize<NuclideChartNodeOptions, SelfOptions, NodeOptions>()( {
        excludeInvisibleChildrenFromBounds: true,
        showMagicNumbersProperty: new BooleanProperty( false )
      }, providedOptions );
    super( options );

    // Create and add the cells.
    const cellLength = chartTransform.modelToViewDeltaX( 1 );
    const cellLayerNode = new Node();
    this.cells = NuclideChartNode.createNuclideChart( cellLayerNode, chartTransform, cellLength,
      options.showMagicNumbersProperty );
    this.addChild( cellLayerNode );

    // Add the arrowNode indicating the decay direction first so that it appears behind the cell's label.
    const arrowNode = new ArrowNode( 0, 0, 0, 0, combineOptions<ArrowNodeOptions>( {
      visible: false
    }, BANConstants.DECAY_ARROW_OPTIONS ) );
    if ( options.arrowSymbol ) {
      this.addChild( arrowNode );
    }

    const labelDimension = cellLength * 0.75;

    // Make the labelTextBackground an octagon shape.
    const vertices = _.times( 8, side => {
      return new Vector2( Math.cos( ( 2 * side * Math.PI ) / 8 ),
        Math.sin( ( 2 * side * Math.PI ) / 8 ) ).times( labelDimension * 0.6 );
    } );
    const octagonShape = Shape.polygon( vertices );

    // Create and add the label which labels the cell with the elementSymbol.
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

    // Highlight the cell that corresponds to the nuclide and make opaque any surrounding cells too far away from the nuclide.
    let highlightedCell: NuclideChartCell | null = null;
    Multilink.multilink( [
      protonCountProperty,
      neutronCountProperty
    ], ( protonNumber, neutronNumber ) => {

      const currentCellCenter = chartTransform.modelToViewXY(
        neutronNumber + BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE,
        protonNumber + BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE );

      // Highlight the cell if it exists.
      if ( AtomIdentifier.doesExist( protonNumber, neutronNumber ) ) {

        // Get the highlightedCell.
        const protonRowIndex = protonNumber;
        const neutronRowIndex = BANModel.POPULATED_CELLS[ protonRowIndex ].indexOf( neutronNumber );
        highlightedCell = this.cells[ protonRowIndex ][ neutronRowIndex ];
        assert && assert( highlightedCell, 'The highlighted cell is null at protonRowIndex = ' + protonRowIndex +
                                           ' neutronRowIndex = ' + neutronRowIndex );

        // Get the decayType from the highlightedCell.
        const decayType = highlightedCell.cellModel.decayType;

        // Draw the decay direction with the arrowNode if there is a known decay for this nuclide cell.
        if ( !AtomIdentifier.isStable( protonNumber, neutronNumber ) && decayType !== null ) {

          // Direction determined based on how the DecayType changes the current nuclide, see DecayType for more details.
          const direction = decayType === DecayType.NEUTRON_EMISSION ? new Vector2( neutronNumber - 1, protonNumber ) :
                            decayType === DecayType.PROTON_EMISSION ? new Vector2( neutronNumber, protonNumber - 1 ) :
                            decayType === DecayType.BETA_PLUS_DECAY ? new Vector2( neutronNumber + 1, protonNumber - 1 ) :
                            decayType === DecayType.BETA_MINUS_DECAY ? new Vector2( neutronNumber - 1, protonNumber + 1 ) :

                              // Alpha decay.
                            new Vector2( neutronNumber - AlphaParticle.NUMBER_OF_ALLOWED_NEUTRONS,
                              protonNumber - AlphaParticle.NUMBER_OF_ALLOWED_PROTONS );
          const arrowTip = chartTransform.modelToViewXY(
            direction.x + BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE,
            direction.y + BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE );
          arrowNode.setTailAndTip( currentCellCenter.x, currentCellCenter.y, arrowTip.x, arrowTip.y );
          arrowNode.visible = true;
        }
        else {

          // Stable cell or no known decay so hide the arrow.
          arrowNode.visible = false;
        }

        // Show the cell's label.
        labelContainer.visible = true;
        labelText.string = AtomIdentifier.getSymbol( protonNumber );
        labelContainer.center = currentCellCenter;
        labelText.fill = this.getCellLabelFill( highlightedCell.cellModel );

        // Cover the tail of the arrow that's in this cell's center.
        labelTextBackground.fill = highlightedCell.decayBackgroundColor;
      }
      else {

        // No cell exists so hide the label and arrow.
        arrowNode.visible = false;
        labelContainer.visible = false;
      }
    } );
  }

  /**
   * Based on the fill of the cell (which is based on the decay type), choose a light or dark text fill.
   */
  private getCellLabelFill( cellModel?: NuclideChartCellModel ): Color {
    if ( !cellModel ) {
      return Color.WHITE;
    }
    return cellModel.decayType === DecayType.ALPHA_DECAY ||
           cellModel.decayType === DecayType.BETA_MINUS_DECAY ||
           ( !cellModel.decayType && !cellModel.isStable ) ?
           Color.BLACK : Color.WHITE;
  }

  /**
   * Create a nuclide chart given a node to contain the cells and a chartTransform. Public for icon creation.
   */
  public static createNuclideChart( cellLayerNode: Node, chartTransform: ChartTransform, cellLength: number,
                                    showMagicNumbersProperty: TReadOnlyProperty<boolean> = new BooleanProperty( false )
  ): NuclideChartCell[][] {
    const cells: NuclideChartCell[][] = [];

    // Create and add the chart cells to the chart. row is proton number and column is neutron number.
    chartTransform.forEachSpacing( Orientation.VERTICAL, 1, 0, 'strict',
      ( protonNumber, viewPosition ) => {
        const populatedCellsInRow = BANModel.POPULATED_CELLS[ protonNumber ];
        const rowCells: NuclideChartCell[] = [];
        populatedCellsInRow.forEach( ( neutronNumber, columnIndex ) => {

          // Create and add the NuclideChartCell.
          const defaultLineWidth = chartTransform.modelToViewDeltaX( BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH );
          const cell = new NuclideChartCell( cellLength,
            ChartIntroModel.cellModelArray[ protonNumber ][ columnIndex ], {
              lineWidth: defaultLineWidth
            } );
          cell.translation = new Vector2( chartTransform.modelToViewX( neutronNumber ), viewPosition );
          cellLayerNode.addChild( cell );
          rowCells.push( cell );

          const cellIsMagic = MAGIC_NUMBERS.includes( protonNumber ) || MAGIC_NUMBERS.includes( neutronNumber );
          if ( cellIsMagic ) {

            // Highlight the cell with a special colored stroke if the cell has a magic number of protons or neutrons.
            showMagicNumbersProperty.link( showMagic => {
              showMagic && cell.moveToFront();
              cell.lineWidth = showMagic ? defaultLineWidth + 2 : defaultLineWidth;
              cell.stroke = showMagic ? BANColors.nuclideChartBorderMagicNumberColorProperty :
                            BANColors.nuclideChartBorderColorProperty;
            } );
          }
        } );
        cells.push( rowCells );
      } );

    return cells;
  }

}

buildANucleus.register( 'NuclideChartNode', NuclideChartNode );
export default NuclideChartNode;
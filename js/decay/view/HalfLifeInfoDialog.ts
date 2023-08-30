// Copyright 2022-2023, University of Colorado Boulder

/**
 * HalfLifeInfoDialog shows an expanded timeline of the half-life's of the nuclide's built with meaningful points in
 * time pointed out with arrows to give more orientation on the half-life time.
 *
 * @author Luisa Vargas
 */

import Dialog from '../../../../sun/js/Dialog.js';
import buildANucleus from '../../buildANucleus.js';
import { Font, GridBox, HBox, Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';
import HalfLifeNumberLineNode from './HalfLifeNumberLineNode.js';
import BANTimescalePoints from '../model/BANTimescalePoints.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import BANConstants from '../../common/BANConstants.js';

// constants
const MAX_CONTENT_WIDTH = 600;
const LEGEND_FONT = BANConstants.REGULAR_FONT;

class HalfLifeInfoDialog extends Dialog {

  public constructor( halfLifeNumberProperty: TReadOnlyProperty<number>,
                      isStableProperty: TReadOnlyProperty<boolean>,
                      elementNameStringProperty: TReadOnlyProperty<string> ) {

    const leftSideTimescalePoints = [
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_A_NUCLEUS,
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_AN_ATOM,
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_ONE_THOUSAND_ATOMS,
      BANTimescalePoints.TIME_FOR_SOUND_TO_TRAVEL_ONE_MILLIMETER,
      BANTimescalePoints.A_BLINK_OF_AN_EYE
    ];
    const rightSideTimescalePoints = [
      BANTimescalePoints.ONE_MINUTE,
      BANTimescalePoints.ONE_YEAR,
      BANTimescalePoints.AVERAGE_HUMAN_LIFESPAN,
      BANTimescalePoints.AGE_OF_THE_UNIVERSE,
      BANTimescalePoints.LIFETIME_OF_LONGEST_LIVED_STARS
    ];

    // Use a GridBox to create the left adn right side nodes of the HalfLifeInfoDialog legend.
    const createGridBox = ( timescalePoints: BANTimescalePoints[] ): Node => {

      const grid = new GridBox( {
        resize: true,
        xSpacing: 6,
        ySpacing: 6
      } );
      timescalePoints.forEach( ( timescalePoint, rowIndex ) => {

        grid.addRow( [
          new Text( timescalePoint.timescaleMarkerStringProperty, {
            font: new Font( {
              size: '20px',
              family: 'monospace',
              weight: 'bold'
            } ),
            layoutOptions: {
              xAlign: 'left'
            }
          } ),
          new Node( {
            children: [ new Text( '-', {
              font: LEGEND_FONT
            } ) ]
          } ),
          new Text( timescalePoint.timescaleDescriptionStringProperty, {
            font: LEGEND_FONT,
            layoutOptions: {
              xAlign: 'left'
            }
          } )
        ] );
      } );
      return grid;
    };

    // Create the legend node.
    const legend = new HBox( {
      children: [
        createGridBox( leftSideTimescalePoints ),
        createGridBox( rightSideTimescalePoints )
      ],
      spacing: 70,
      align: 'top',
      maxWidth: 870
    } );

    // Create the halfLifeNumberLineNode.
    const halfLifeNumberLineNode = new HalfLifeNumberLineNode( halfLifeNumberProperty, isStableProperty, {
      tickMarkExtent: 24,
      numberLineLabelFont: LEGEND_FONT,
      numberLineWidth: 750,
      halfLifeArrowLength: 45,
      halfLifeDisplayScale: 0.8,
      isHalfLifeLabelFixed: false,
      elementNameStringProperty: elementNameStringProperty
    } );

    // Add the legend and halfLifeNumberLineNode.
    const numberLineNodeAndLegend = new VBox( {
      children: [ legend, halfLifeNumberLineNode ],
      spacing: 30,
      align: 'center',
      resize: true
    } );

    // Surround contents with rectangle for extra padding.
    const contents = new Rectangle( 0, 0, numberLineNodeAndLegend.width + 100, numberLineNodeAndLegend.height );
    contents.addChild( numberLineNodeAndLegend );
    numberLineNodeAndLegend.centerX = contents.centerX;

    // The half-life's of the strings, in respective order.
    const timescalePoints = [
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_A_NUCLEUS,
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_AN_ATOM,
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_ONE_THOUSAND_ATOMS,
      BANTimescalePoints.TIME_FOR_SOUND_TO_TRAVEL_ONE_MILLIMETER,
      BANTimescalePoints.A_BLINK_OF_AN_EYE,
      BANTimescalePoints.ONE_MINUTE,
      BANTimescalePoints.ONE_YEAR,
      BANTimescalePoints.AVERAGE_HUMAN_LIFESPAN,
      BANTimescalePoints.AGE_OF_THE_UNIVERSE,
      BANTimescalePoints.LIFETIME_OF_LONGEST_LIVED_STARS
    ];

    // Create and add the half-life arrow and label.
    for ( let i = 0; i < timescalePoints.length; i++ ) {
      const timescalePoint = timescalePoints[ i ];
      halfLifeNumberLineNode.addArrowAndLabel( timescalePoint.timescaleMarkerStringProperty, timescalePoints[ i ].numberOfSeconds );
    }

    const titleNode = new Text( BuildANucleusStrings.halfLifeTimescaleStringProperty, {
      font: BANConstants.TITLE_FONT,
      maxWidth: 0.75 * MAX_CONTENT_WIDTH
    } );

    super( contents, {
      title: titleNode,
      ySpacing: 20,
      xSpacing: 0,
      bottomMargin: 20,
      fill: BANColors.infoDialogBackgroundColorProperty
    } );
  }
}

buildANucleus.register( 'HalfLifeInfoDialog', HalfLifeInfoDialog );
export default HalfLifeInfoDialog;
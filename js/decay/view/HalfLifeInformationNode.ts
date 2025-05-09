// Copyright 2022-2025, University of Colorado Boulder

/**
 * Half-life information section at the top half of the Decay screen contains the units label, 'more stable' and 'less
 * stable' arrow indicators.
 *
 * @author Luisa Vargas
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox, { HBoxOptions } from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';
import HalfLifeInfoDialog from './HalfLifeInfoDialog.js';
import HalfLifeNumberLineNode from './HalfLifeNumberLineNode.js';

// constants
const LABEL_FONT = new PhetFont( 14 );
const STABLE_ARROW_LENGTHS = 30;

const ARROW_OPTIONS = {
  headWidth: 6,
  tailWidth: 1
};
const TEXT_OPTIONS = { font: LABEL_FONT, maxWidth: 175 };
const HBOX_OPTIONS: HBoxOptions = {
  spacing: 5,
  align: 'center'
};

class HalfLifeInformationNode extends Node {

  public constructor( halfLifeNumberProperty: TReadOnlyProperty<number>,
                      isStableProperty: TReadOnlyProperty<boolean>,
                      elementNameStringProperty: TReadOnlyProperty<string> ) {
    super();

    // Create and add the halfLifeNumberLineNode.
    const halfLifeNumberLineNode = new HalfLifeNumberLineNode( halfLifeNumberProperty, isStableProperty, {
      tickMarkExtent: 18,
      numberLineLabelFont: new PhetFont( 15 ),
      numberLineWidth: 550,
      halfLifeArrowLength: 30,
      isHalfLifeLabelFixed: true,
      unitsLabelFont: LABEL_FONT
    } );
    this.addChild( halfLifeNumberLineNode );

    // Create and add the HalfLifeInfoDialog.
    const halfLifeInfoDialog = new HalfLifeInfoDialog( halfLifeNumberProperty, isStableProperty,
      elementNameStringProperty );

    // Create and add the info button.
    const infoButton = new InfoButton( {
      iconFill: 'black',
      listener: () => halfLifeInfoDialog.show(),
      baseColor: BANColors.infoButtonColorProperty,
      maxHeight: BANConstants.INFO_BUTTON_MAX_HEIGHT
    } );
    infoButton.centerY = halfLifeNumberLineNode.halfLifeDisplayNode.centerY;
    infoButton.left = halfLifeNumberLineNode.left + BANConstants.INFO_BUTTON_INDENT_DISTANCE;
    this.addChild( infoButton );

    // Create the left arrow and its label.
    const leftArrow = new ArrowNode( STABLE_ARROW_LENGTHS, 0, 0,
      0, ARROW_OPTIONS );
    const leftArrowText = new Text( BuildANucleusStrings.lessStableStringProperty, TEXT_OPTIONS );
    const leftArrowAndLabelHBox = new HBox( HBOX_OPTIONS );
    leftArrowAndLabelHBox.children = [ leftArrow, leftArrowText ];

    // Create the right arrow and its label.
    const rightArrow = new ArrowNode( 0, 0, STABLE_ARROW_LENGTHS,
      0, ARROW_OPTIONS );
    const rightArrowText = new Text( BuildANucleusStrings.moreStableStringProperty, TEXT_OPTIONS );
    const rightArrowAndLabelHBox = new HBox( HBOX_OPTIONS );
    rightArrowAndLabelHBox.children = [ rightArrowText, rightArrow ];

    // Add the arrow and label pairs.
    this.addChild( new HBox( {
      children: [ leftArrowAndLabelHBox, rightArrowAndLabelHBox ],
      preferredWidth: halfLifeNumberLineNode.width,
      centerY: halfLifeNumberLineNode.bottom
    } ) );
  }
}

buildANucleus.register( 'HalfLifeInformationNode', HalfLifeInformationNode );
export default HalfLifeInformationNode;
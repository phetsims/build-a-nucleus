// Copyright 2022-2023, University of Colorado Boulder

/**
 * Half-life information section at the top half of the Decay screen contains the units label, 'more stable' and 'less
 * stable' arrow indicators.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import HalfLifeNumberLineNode from './HalfLifeNumberLineNode.js';
import { HBox, HBoxOptions, Node, Text } from '../../../../scenery/js/imports.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import HalfLifeInfoDialog from './HalfLifeInfoDialog.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';

// constants
const LABEL_FONT = new PhetFont( 14 );

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
                      isStableBooleanProperty: TReadOnlyProperty<boolean>,
                      protonCountProperty: TReadOnlyProperty<number>,
                      neutronCountProperty: TReadOnlyProperty<number>,
                      doesNuclideExistBooleanProperty: TReadOnlyProperty<boolean> ) {
    super();

    // create and add the halfLifeNumberLineNode
    const halfLifeNumberLineNode = new HalfLifeNumberLineNode( halfLifeNumberProperty, isStableBooleanProperty, {
      tickMarkExtent: 18, // TODO: but isn't it 24 actually? https://github.com/phetsims/build-a-nucleus/issues/102
      numberLineLabelFont: new PhetFont( 15 ),
      numberLineWidth: 550,
      halfLifeArrowLength: 30,
      isHalfLifeLabelFixed: true,
      unitsLabelFont: LABEL_FONT
    } );
    this.addChild( halfLifeNumberLineNode );

    // create and add the HalfLifeInfoDialog
    const halfLifeInfoDialog = new HalfLifeInfoDialog( halfLifeNumberProperty, isStableBooleanProperty,
      protonCountProperty, neutronCountProperty, doesNuclideExistBooleanProperty );

    // create and add the info button
    const infoButton = new InfoButton( {
      listener: () => halfLifeInfoDialog.show(),
      baseColor: BANColors.infoButtonColorProperty,
      maxHeight: BANConstants.INFO_BUTTON_MAX_HEIGHT
    } );
    infoButton.centerY = halfLifeNumberLineNode.halfLifeDisplayNode.centerY;
    infoButton.left = halfLifeNumberLineNode.left + BANConstants.INFO_BUTTON_INDENT_DISTANCE;
    this.addChild( infoButton );

    const leftArrow = new ArrowNode( 30, 0, 0,
      0, ARROW_OPTIONS );
    const leftArrowText = new Text( BuildANucleusStrings.lessStableStringProperty, TEXT_OPTIONS );
    const leftArrowAndLabelHBox = new HBox( HBOX_OPTIONS );
    leftArrowAndLabelHBox.children = [ leftArrow, leftArrowText ];

    const rightArrow = new ArrowNode( 0, 0, 30,
      0, ARROW_OPTIONS );
    const rightArrowText = new Text( BuildANucleusStrings.moreStableStringProperty, TEXT_OPTIONS );
    const rightArrowAndLabelHBox = new HBox( HBOX_OPTIONS );
    rightArrowAndLabelHBox.children = [ rightArrowText, rightArrow ];

    this.addChild( new HBox( {
      children: [ leftArrowAndLabelHBox, rightArrowAndLabelHBox ],
      preferredWidth: halfLifeNumberLineNode.width,
      centerY: halfLifeNumberLineNode.bottom
    } ) );
  }
}

buildANucleus.register( 'HalfLifeInformationNode', HalfLifeInformationNode );
export default HalfLifeInformationNode;
// Copyright 2022, University of Colorado Boulder

/**
 * Half-life information section at the top half of the Decay screen contains the units label, 'more stable' and 'less
 * stable' arrow indicators.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import HalfLifeNumberLineNode from './HalfLifeNumberLineNode.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import HalfLifeInfoDialog from './HalfLifeInfoDialog.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';

// constants
const LABEL_FONT = new PhetFont( 14 );

class HalfLifeInformationNode extends Node {

  public constructor( halfLifeNumberProperty: IReadOnlyProperty<number>,
               isStableBooleanProperty: IReadOnlyProperty<boolean>,
               protonCountProperty: IReadOnlyProperty<number>,
               neutronCountProperty: IReadOnlyProperty<number>,
               doesNuclideExistBooleanProperty: IReadOnlyProperty<boolean> ) {
    super();

    // create and add the halfLifeNumberLineNode
    const halfLifeNumberLineNode = new HalfLifeNumberLineNode( halfLifeNumberProperty, isStableBooleanProperty, {
      tickMarkExtent: 18,
      numberLineLabelFont: new PhetFont( 15 ),
      numberLineWidth: 550,
      halfLifeArrowLength: 30,
      isHalfLifeLabelFixed: true
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

    // function to create and add the arrow and more/less stable label set
    const arrowAndStableLabel = ( arrowNodeTailX: number, arrowNodeTipX: number, stabilityText: string ): number => {
      const arrow = new ArrowNode( arrowNodeTailX, halfLifeNumberLineNode.bottom + 10, arrowNodeTipX,
        halfLifeNumberLineNode.bottom + 10, {
          headWidth: 6,
          tailWidth: 1
        } );
      this.addChild( arrow );

      const arrowText = new Text( stabilityText, { font: LABEL_FONT, maxWidth: 175 } );
      arrowText.centerY = arrow.centerY;
      if ( arrowNodeTipX === halfLifeNumberLineNode.left ) {
        arrowText.left = arrow.right + 5;
      }
      else {
        arrowText.right = arrow.left - 5;
      }
      this.addChild( arrowText );
      return arrow.centerY;
    };

    // create and add the 'less stable' and 'more  stable' arrow and text set and return the centerY of the label's
    const labelCenterY = arrowAndStableLabel( halfLifeNumberLineNode.left + 30, halfLifeNumberLineNode.left,
      buildANucleusStrings.lessStable );
    arrowAndStableLabel( halfLifeNumberLineNode.right - 30, halfLifeNumberLineNode.right, buildANucleusStrings.moreStable );

    // create and add the units label on the number line
    const numberLineUnitsLabel = new Text( buildANucleusStrings.seconds, { font: LABEL_FONT, maxWidth: 150 } );
    numberLineUnitsLabel.centerY = labelCenterY;
    numberLineUnitsLabel.centerX = halfLifeNumberLineNode.centerX;
    this.addChild( numberLineUnitsLabel );
  }
}

buildANucleus.register( 'HalfLifeInformationNode', HalfLifeInformationNode );
export default HalfLifeInformationNode;
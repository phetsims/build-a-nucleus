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

// constants
const LABEL_FONT = new PhetFont( 14 );

class HalfLifeInformationNode extends Node {

  constructor( halfLifeNumberProperty: IReadOnlyProperty<number>,
               isStableBooleanProperty: IReadOnlyProperty<boolean> ) {
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
    const halfLifeInfoDialog = new HalfLifeInfoDialog( halfLifeNumberProperty, isStableBooleanProperty );

    // create and add the info button
    const infoButton = new InfoButton( {
      listener: () => halfLifeInfoDialog.show(),
      baseColor: BANColors.infoButtonColorProperty,
      maxHeight: 30
    } );
    infoButton.top = halfLifeNumberLineNode.top - 1.5;
    infoButton.left = halfLifeNumberLineNode.left + 124;
    this.addChild( infoButton );

    // create and add the units label on the number line
    const numberLineUnitsLabel = new Text( buildANucleusStrings.seconds, { font: LABEL_FONT } );
    numberLineUnitsLabel.top = halfLifeNumberLineNode.bottom;
    numberLineUnitsLabel.centerX = halfLifeNumberLineNode.centerX;
    this.addChild( numberLineUnitsLabel );

    // function to create and add the arrow and more/less stable label set
    const arrowAndStableLabel = ( arrowNodeTailX: number, arrowNodeTipX: number, stabilityText: string ): void => {
      const arrow = new ArrowNode( arrowNodeTailX, halfLifeNumberLineNode.bottom + 10, arrowNodeTipX,
        halfLifeNumberLineNode.bottom + 10, {
          headWidth: 6,
          tailWidth: 1
        } );
      this.addChild( arrow );

      const arrowText = new Text( stabilityText, { font: LABEL_FONT } );
      arrowText.centerY = arrow.centerY;
      if ( stabilityText === buildANucleusStrings.lessStable ) {
        arrowText.left = arrow.right + 5;
      }
      else {
        arrowText.right = arrow.left - 5;
      }
      this.addChild( arrowText );
    };

    // create and add the 'less stable' and 'more  stable' arrow and text set
    arrowAndStableLabel( halfLifeNumberLineNode.left + 30, halfLifeNumberLineNode.left, buildANucleusStrings.lessStable );
    arrowAndStableLabel( halfLifeNumberLineNode.right - 30, halfLifeNumberLineNode.right, buildANucleusStrings.moreStable );
  }
}

buildANucleus.register( 'HalfLifeInformationNode', HalfLifeInformationNode );
export default HalfLifeInformationNode;
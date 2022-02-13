// Copyright 2022, University of Colorado Boulder

/**
 * Half-life information section at the top half of the Decay screen contains the units label, 'more stable' and 'less
 * stable' arrow indicators and the info button.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import HalfLifeNumberLineNode from './HalfLifeNumberLineNode.js';
import { Text, Node } from '../../../../scenery/js/imports.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import BuildANucleusColors from '../../common/BuildANucleusColors.js';
import HalfLifeInfoDialog from './HalfLifeInfoDialog.js';

// constants
const LABEL_FONT = new PhetFont( 14 );

class HalfLifeInformationNode extends Node {

  constructor( halfLifeNumberProperty: NumberProperty ) {

    super();

    // create and add the halfLifeNumberLineNode
    const halfLifeNumberLineNode = new HalfLifeNumberLineNode( halfLifeNumberProperty, -18, 18, 450, 30, false );
    this.addChild( halfLifeNumberLineNode );

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

    // create and add the HalfLifeInfoDialog
    const halfLifeInfoDialog = new HalfLifeInfoDialog( halfLifeNumberProperty );

    // create and add the info button
    const infoButton = new InfoButton( {
      listener: () => halfLifeInfoDialog.show(),
      baseColor: BuildANucleusColors.infoButtonColorProperty,
      maxHeight: 45,
      bottom: halfLifeNumberLineNode.centerY - 15,
      right: halfLifeNumberLineNode.right
    } );
    this.addChild( infoButton );
  }
}

buildANucleus.register( 'HalfLifeInformationNode', HalfLifeInformationNode );
export default HalfLifeInformationNode;
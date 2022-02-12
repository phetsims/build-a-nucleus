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
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';

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

    // create and add the 'less stable' arrow and text
    const leftArrow = new ArrowNode( halfLifeNumberLineNode.left + 30, halfLifeNumberLineNode.bottom + 10,
      halfLifeNumberLineNode.left, halfLifeNumberLineNode.bottom + 10, {
        headWidth: 6,
        tailWidth: 1
      } );
    this.addChild( leftArrow );
    const lessStableText = new Text( buildANucleusStrings.lessStable, { font: LABEL_FONT } );
    lessStableText.left = leftArrow.right + 5;
    lessStableText.centerY = leftArrow.centerY;
    this.addChild( lessStableText );

    // create and add the 'more stable' arrow and text
    const rightArrow = new ArrowNode( halfLifeNumberLineNode.right - 30, halfLifeNumberLineNode.bottom + 10,
      halfLifeNumberLineNode.right, halfLifeNumberLineNode.bottom + 10, {
        headWidth: 6,
        tailWidth: 1
      } );
    this.addChild( rightArrow );
    const moreStableText = new Text( buildANucleusStrings.moreStable, { font: LABEL_FONT } );
    moreStableText.right = rightArrow.left - 5;
    moreStableText.centerY = rightArrow.centerY;
    this.addChild( moreStableText );
  }
}

buildANucleus.register( 'HalfLifeInformationNode', HalfLifeInformationNode );
export default HalfLifeInformationNode;
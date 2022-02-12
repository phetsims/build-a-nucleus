// Copyright 2022, University of Colorado Boulder

/**
 * Node that has a number line with makeshift log-scale values and an arrow that points to a specific number on the
 * number line.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Line, Node, RichText } from '../../../../scenery/js/imports.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import TickMarkSet from '../../../../bamboo/js/TickMarkSet.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import TickLabelSet from '../../../../bamboo/js/TickLabelSet.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import BuildANucleusColors from '../../common/BuildANucleusColors.js';

// constants
const TICK_MARK_EXTENT = 18;

class HalfLifeNumberLineNode extends Node {

  private readonly arrowXPositionProperty: NumberProperty;

  constructor( startX: number, endX: number, numberLineWidth: number ) {
    super();

    const viewWidth = numberLineWidth;
    const numberLineLength = new Range( startX, endX ).getLength();
    const tickMarkLength = viewWidth / numberLineLength;

    // TODO: Fix the view Y's
    const modelViewTransform = ModelViewTransform2.createRectangleMapping(
      new Bounds2( startX, 0, endX, 1 ),
      new Bounds2( 0, 0, viewWidth, tickMarkLength )
    );

    const createExponentialLabel = ( value: number ): RichText => {
      const numberValue = value === 0 ? 1 : `10<sup>${value}</sup>`;
      return new RichText( numberValue, {
        font: new PhetFont( 15 ),
        supScale: 0.6,
        supYOffset: -1
      } );
    };

    // create and add numberLineNode
    const numberLineNode = new Node();
    const chartTransform = new ChartTransform( {
      viewWidth: viewWidth,
      modelXRange: new Range( startX, endX )
    } );
    const tickXSpacing = 3;
    const tickMarkSet = new TickMarkSet( chartTransform, Orientation.HORIZONTAL, tickXSpacing, {
      stroke: Color.BLACK,
      extent: TICK_MARK_EXTENT,
      lineWidth: 2
    } );
    tickMarkSet.centerY = 0;
    numberLineNode.addChild( tickMarkSet );
    const tickLabelSet = new TickLabelSet( chartTransform, Orientation.HORIZONTAL, tickXSpacing, {
      extent: 0,
      createLabel: ( value: number ) => createExponentialLabel( value )
    } );
    tickLabelSet.top = tickMarkSet.bottom;
    numberLineNode.addChild( tickLabelSet );
    const numberLine = new Line( {
      x1: modelViewTransform.modelToViewX( startX ), y1: tickMarkSet.centerY,
      x2: modelViewTransform.modelToViewX( endX ), y2: tickMarkSet.centerY, stroke: Color.BLACK
    } );
    this.addChild( numberLine );
    this.addChild( numberLineNode );

    // create and add the halfLifeArrow
    const halfLifeArrow = new ArrowNode( 0, tickMarkSet.top * 3, 0, tickMarkSet.centerY, {
        fill: BuildANucleusColors.halfLifeColorProperty,
        stroke: null,
        tailWidth: 4,
        headWidth: 12
      } );
    this.addChild( halfLifeArrow );

    // keep track of the x position of the half-life arrow in model coordinates
    this.arrowXPositionProperty = new NumberProperty( 0 );
    this.arrowXPositionProperty.link( xPosition => {
      halfLifeArrow.translation = new Vector2( modelViewTransform.modelToViewX( xPosition ), tickMarkSet.centerY );
    } );
  }

  /**
   * Animate the half-life arrow to the new half-life position along the number line.
   */
  public moveHalfLifeArrow( newXPosition: number ) {
    const animation = new Animation( {
      to: newXPosition,
      property: this.arrowXPositionProperty,
      duration: 0.5, // TODO: set duration based on the length it has to travel
      easing: Easing.QUADRATIC_IN_OUT
    } );
    animation.start();
  }
}

buildANucleus.register( 'HalfLifeNumberLineNode', HalfLifeNumberLineNode );
export default HalfLifeNumberLineNode;
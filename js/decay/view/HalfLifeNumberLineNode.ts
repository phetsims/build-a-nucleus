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
import { Color, Line, Node, RichText, Text } from '../../../../scenery/js/imports.js';
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
import Utils from '../../../../dot/js/Utils.js';

// constants
const TICK_MARK_EXTENT = 18;
const LABEL_FONT = new PhetFont( 15 );

class HalfLifeNumberLineNode extends Node {

  private readonly arrowXPositionProperty: NumberProperty;
  private readonly tickMarkSet: TickMarkSet;
  private modelViewTransform: ModelViewTransform2;

  constructor( startX: number, endX: number, numberLineWidth: number, arrowLength: number ) {
    super();

    const viewWidth = numberLineWidth;
    const numberLineLength = new Range( startX, endX ).getLength();
    const tickMarkLength = viewWidth / numberLineLength;

    // TODO: Fix the view Y's
    this.modelViewTransform = ModelViewTransform2.createRectangleMapping(
      new Bounds2( startX, 0, endX, 1 ),
      new Bounds2( 0, 0, viewWidth, tickMarkLength )
    );

    const createExponentialLabel = ( value: number ): RichText => {
      const numberValue = value === 0 ? 1 : `10<sup>${value}</sup>`;
      return new RichText( numberValue, {
        font: LABEL_FONT,
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
    this.tickMarkSet = new TickMarkSet( chartTransform, Orientation.HORIZONTAL, tickXSpacing, {
      stroke: Color.BLACK,
      extent: TICK_MARK_EXTENT,
      lineWidth: 2
    } );
    this.tickMarkSet.centerY = 0;
    numberLineNode.addChild( this.tickMarkSet );
    const tickLabelSet = new TickLabelSet( chartTransform, Orientation.HORIZONTAL, tickXSpacing, {
      extent: 0,
      createLabel: ( value: number ) => createExponentialLabel( value )
    } );
    tickLabelSet.top = this.tickMarkSet.bottom;
    numberLineNode.addChild( tickLabelSet );
    const numberLine = new Line( {
      x1: this.modelViewTransform.modelToViewX( startX ), y1: this.tickMarkSet.centerY,
      x2: this.modelViewTransform.modelToViewX( endX ), y2: this.tickMarkSet.centerY, stroke: Color.BLACK
    } );
    numberLineNode.addChild( numberLine );
    this.addChild( numberLineNode );

    // create and add the halfLifeArrow
    const halfLifeArrow = new ArrowNode( 0, -arrowLength, 0, this.tickMarkSet.centerY, {
      fill: BuildANucleusColors.halfLifeColorProperty,
      stroke: null,
      tailWidth: 4,
      headWidth: 12
    } );
    this.addChild( halfLifeArrow );

    // keep track of the x position of the half-life arrow in model coordinates
    this.arrowXPositionProperty = new NumberProperty( 0 );
    this.arrowXPositionProperty.link( xPosition => {
      halfLifeArrow.translation = new Vector2( this.modelViewTransform.modelToViewX( xPosition ), this.tickMarkSet.centerY );
    } );
  }

  /**
   * Animate the half-life arrow to the new half-life position along the number line.
   */
  public moveHalfLifeArrow( halfLife: number ): void {
    const newXPosition = HalfLifeNumberLineNode.logScaleNumberToLinearScaleNumber( halfLife );
    const animation = new Animation( {
      to: newXPosition,
      property: this.arrowXPositionProperty,
      duration: 0.5, // TODO: set duration based on the length it has to travel
      easing: Easing.QUADRATIC_IN_OUT
    } );
    animation.start();
  }

  /**
   * Add an arrow with a label number to the number line.
   */
  public addArrowAndNumber( number: number, halfLife: number ): void {
    const xPosition = HalfLifeNumberLineNode.logScaleNumberToLinearScaleNumber( halfLife );
    const arrow = new ArrowNode( this.modelViewTransform.modelToViewX( xPosition ), -50,
      this.modelViewTransform.modelToViewX( xPosition ), this.tickMarkSet.centerY, {
        fill: BuildANucleusColors.legendArrowColorProperty,
        stroke: null,
        tailWidth: 1.5,
        headWidth: 5
      } );
    this.addChild( arrow );
    const numberText = new Text( number, { font: LABEL_FONT } );
    numberText.bottom = arrow.top;
    numberText.centerX = arrow.centerX;
    this.addChild( numberText );
  }

  /**
   * Convert the half-life number (in seconds) to a linear scale number to plot it on the number line.
   */
  private static logScaleNumberToLinearScaleNumber( halfLifeNumber: number ): number {
    return Utils.log10( halfLifeNumber );
  }
}

buildANucleus.register( 'HalfLifeNumberLineNode', HalfLifeNumberLineNode );
export default HalfLifeNumberLineNode;
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
import { Color, HBox, Line, Node, NodeOptions, RichText } from '../../../../scenery/js/imports.js';
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
import BANColors from '../../common/BANColors.js';
import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANConstants from '../../common/BANConstants.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

// types
type HalfLifeNumberLineNodeSelfOptions = {
  tickMarkExtent: number,
  numberLineLabelFont: PhetFont,
  numberLineLargeLabelFont: PhetFont,
  numberLineWidth: number,
  halfLifeArrowLength: number,
  isHalfLifeLabelFixed: boolean // if the half-life label is fixed, place it centered above the number line, otherwise,
  // animate its position with the half-life arrow
};
export type HalfLifeNumberLineNodeOptions = HalfLifeNumberLineNodeSelfOptions & NodeOptions;

// constants
const TITLE_FONT = new PhetFont( 24 );
const NUMBER_LINE_START_EXPONENT = BANConstants.HALF_LIFE_NUMBER_LINE_START_EXPONENT;
const NUMBER_LINE_END_EXPONENT = BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT;

class HalfLifeNumberLineNode extends Node {

  private readonly arrowXPositionProperty: NumberProperty;
  private readonly tickMarkSet: TickMarkSet;
  private modelViewTransform: ModelViewTransform2;
  private arrowAnimation: null | Animation;
  private readonly halfLifeTextXPositionProperty: NumberProperty | undefined;
  private readonly labelFont: PhetFont | undefined;

  constructor( halfLifeNumberProperty: DerivedProperty<number,
                 [ protonCount: number, neutronCount: number, doesNuclideExist: boolean, isStable: boolean ]>,
               isStableBooleanProperty: DerivedProperty<boolean, [ protonCount: number, neutronCount: number ]>,
               providedOptions: HalfLifeNumberLineNodeOptions ) {
    super();

    const options = optionize<HalfLifeNumberLineNodeOptions, HalfLifeNumberLineNodeSelfOptions, NodeOptions>( {}, providedOptions );
    this.labelFont = options.numberLineLabelFont;

    const viewWidth = options.numberLineWidth;
    const numberLineLength = new Range( NUMBER_LINE_START_EXPONENT, NUMBER_LINE_END_EXPONENT ).getLength();
    const tickMarkLength = viewWidth / numberLineLength;

    // TODO: Fix the view Y's
    this.modelViewTransform = ModelViewTransform2.createRectangleMapping(
      new Bounds2( NUMBER_LINE_START_EXPONENT, 0, NUMBER_LINE_END_EXPONENT, 1 ),
      new Bounds2( 0, 0, viewWidth, tickMarkLength )
    );

    const createExponentialLabel = ( value: number ): RichText => {
      const numberValue = value === 0 ? 1 : `10<sup>${value}</sup>`;
      return new RichText( numberValue, {
        font: options.numberLineLabelFont,
        supScale: 0.6,
        supYOffset: -1
      } );
    };

    // create and add numberLineNode
    const numberLineNode = new Node();
    const chartTransform = new ChartTransform( {
      viewWidth: viewWidth,
      modelXRange: new Range( NUMBER_LINE_START_EXPONENT, NUMBER_LINE_END_EXPONENT )
    } );
    const tickXSpacing = 3;
    this.tickMarkSet = new TickMarkSet( chartTransform, Orientation.HORIZONTAL, tickXSpacing, {
      stroke: Color.BLACK,
      extent: options.tickMarkExtent,
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
      x1: this.modelViewTransform.modelToViewX( NUMBER_LINE_START_EXPONENT ), y1: this.tickMarkSet.centerY,
      x2: this.modelViewTransform.modelToViewX( NUMBER_LINE_END_EXPONENT ), y2: this.tickMarkSet.centerY,
      stroke: Color.BLACK
    } );
    numberLineNode.addChild( numberLine );
    this.addChild( numberLineNode );

    // create and add the halfLifeArrow
    const halfLifeArrow = new ArrowNode( 0, -options.halfLifeArrowLength, 0, this.tickMarkSet.centerY, {
      fill: BANColors.halfLifeColorProperty,
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
    this.arrowAnimation = null;

    // return the half-life label and number readout string
    const halfLifeTextFillIn = ( halfLife: string ): string => {
      const decimal = halfLife.slice( 0, halfLife.indexOf( 'e' ) );
      if ( decimal === '0.0' ) {
        return buildANucleusStrings.halfLifeColon;
      }
      const exponentSliceIndex = halfLife.indexOf( '+' ) === -1 ? halfLife.indexOf( 'e' ) : halfLife.indexOf( '+' );
      return StringUtils.fillIn( buildANucleusStrings.halfLifePattern, {
        decimal: decimal,
        exponent: halfLife.slice( exponentSliceIndex + 1 )
      } ) + ' ' + buildANucleusStrings.s;
    };

    // create and add the half life label and number readout
    const halfLifeColonText = new RichText( buildANucleusStrings.halfLifeColon, {
      font: options.isHalfLifeLabelFixed ? TITLE_FONT : options.numberLineLabelFont
    } );
    const halfLifeString = halfLifeNumberProperty.value.toExponential( 1 );
    const halfLifeNumberText = new RichText( halfLifeTextFillIn( halfLifeString ), {
      font: options.isHalfLifeLabelFixed ? TITLE_FONT : options.numberLineLabelFont,
      supScale: 0.6,
      supYOffset: -1
    } );
    const halfLifeText = new HBox( { children: [ halfLifeColonText, halfLifeNumberText ], align: 'top', spacing: 10 } );
    halfLifeText.bottom = options.isHalfLifeLabelFixed ? this.top : halfLifeArrow.top;
    if ( options.isHalfLifeLabelFixed ) {
      halfLifeText.left = this.centerX - this.width / 4;
    }
    else {
      halfLifeText.centerX = halfLifeArrow.centerX;
    }
    this.addChild( halfLifeText );

    // keep track of the x position of the halfLifeText in model coordinates, if the half-life text is a label to the arrow
    if ( !options.isHalfLifeLabelFixed ) {
      this.halfLifeTextXPositionProperty = new NumberProperty( 0 );
      this.halfLifeTextXPositionProperty.link( xPosition => {
        halfLifeText.translation = new Vector2( this.modelViewTransform.modelToViewX( xPosition ) - halfLifeText.width / 2, halfLifeArrow.top - halfLifeText.height );
      } );
    }

    // function to show or hide the halfLifeArrow
    const showHalfLifeArrow = ( show: boolean ) => {
      if ( show && !this.hasChild( halfLifeArrow ) ) {
        this.addChild( halfLifeArrow );
      }
      else if ( !show && this.hasChild( halfLifeArrow ) ) {
        this.removeChild( halfLifeArrow );
      }
    };

    // TODO: Peg the indicator to the right when the half-life goes off-scale but still show the accurate half-life readout
    // link the halfLifeNumberProperty to the half-life arrow indicator and to the half-life number readout
    halfLifeNumberProperty.link( halfLifeNumber => {

      // the nuclide does not exist
      if ( halfLifeNumber === 0 ) {
        showHalfLifeArrow( false );
        halfLifeNumberText.setText( '' );
        halfLifeNumberText.setFont( options.isHalfLifeLabelFixed ? TITLE_FONT : options.numberLineLabelFont );
        this.moveHalfLifePointerSet( halfLifeNumber, options.isHalfLifeLabelFixed );
      }
      // the nuclide is stable
      else if ( isStableBooleanProperty.value ) {
        showHalfLifeArrow( true );
        halfLifeNumberText.setText( MathSymbols.INFINITY );
        halfLifeNumberText.setFont( options.numberLineLargeLabelFont );
        // peg the indicator to the right when stable
        this.moveHalfLifePointerSet( halfLifeNumber, options.isHalfLifeLabelFixed );
      }
      // the nuclide is unstable but the half-life data is unknown
      else if ( halfLifeNumber === -1 ) {
        showHalfLifeArrow( false );
        halfLifeNumberText.setText( buildANucleusStrings.unknown );
        halfLifeNumberText.setFont( options.isHalfLifeLabelFixed ? TITLE_FONT : options.numberLineLabelFont );
      }
      // the nuclide is unstable and the half-life data is known
      else {
        showHalfLifeArrow( true );
        halfLifeNumberText.setText( halfLifeTextFillIn( halfLifeNumber.toExponential( 1 ) ) );
        halfLifeNumberText.setFont( options.isHalfLifeLabelFixed ? TITLE_FONT : options.numberLineLabelFont );
        this.moveHalfLifePointerSet( halfLifeNumber, options.isHalfLifeLabelFixed );
      }
    } );
  }

  /**
   * Animate the half-life arrow to the new half-life position along the number line. If the half-life text is a label
   * to the half-life arrow, animate it to its new half-life position too.
   */
  private moveHalfLifePointerSet( halfLife: number, isHalfLifeLabelFixed: boolean ): void {
    const newXPosition = HalfLifeNumberLineNode.logScaleNumberToLinearScaleNumber( halfLife );

    if ( this.arrowAnimation ) {
      this.arrowAnimation.stop();
      this.arrowAnimation = null;
    }

    if ( isHalfLifeLabelFixed ) {
      this.arrowAnimation = new Animation( {
        to: newXPosition,
        property: this.arrowXPositionProperty,
        duration: 0.5,
        easing: Easing.QUADRATIC_IN_OUT
      } );
    }
    else {
      this.arrowAnimation = new Animation( {
        targets: [ {
          to: newXPosition,
          property: this.arrowXPositionProperty
        }, {
          to: newXPosition,
          property: this.halfLifeTextXPositionProperty
        } ],
        duration: 0.5,
        easing: Easing.QUADRATIC_IN_OUT
      } );
    }
    this.arrowAnimation.start();

    this.arrowAnimation.finishEmitter.addListener( () => {
      this.arrowAnimation = null;
    } );
  }

  /**
   * Add an arrow with a label to the number line.
   */
  public addArrowAndLabel( label: string, halfLife: number ): void {
    const xPosition = HalfLifeNumberLineNode.logScaleNumberToLinearScaleNumber( halfLife );
    const arrow = new ArrowNode( this.modelViewTransform.modelToViewX( xPosition ), -40,
      this.modelViewTransform.modelToViewX( xPosition ), this.tickMarkSet.centerY, {
        fill: BANColors.legendArrowColorProperty,
        stroke: null,
        tailWidth: 1.5,
        headWidth: 5
      } );
    this.addChild( arrow );
    const numberText = new RichText( label, { font: this.labelFont } );
    numberText.bottom = arrow.top;
    numberText.centerX = arrow.centerX;
    this.addChild( numberText );
  }

  /**
   * Convert the half-life number (in seconds) to a linear scale number to plot it on the number line.
   */
  private static logScaleNumberToLinearScaleNumber( halfLifeNumber: number ): number {
    if ( halfLifeNumber === 0 ) {
      return 0;
    }
    return Utils.log10( halfLifeNumber );
  }
}

buildANucleus.register( 'HalfLifeNumberLineNode', HalfLifeNumberLineNode );
export default HalfLifeNumberLineNode;
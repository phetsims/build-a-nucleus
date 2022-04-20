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
import { Color, HBox, Line, Node, NodeOptions, RichText, Text } from '../../../../scenery/js/imports.js';
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
import buildANucleusStrings from '../../buildANucleusStrings.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANConstants from '../../common/BANConstants.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ScientificNotationNode from '../../../../scenery-phet/js/ScientificNotationNode.js';
import Property from '../../../../axon/js/Property.js';

// types
type HalfLifeNumberLineNodeSelfOptions = {
  tickMarkExtent: number;
  numberLineLabelFont: PhetFont;
  numberLineLargeLabelFont: PhetFont;
  numberLineWidth: number;
  halfLifeArrowLength: number;
  isHalfLifeLabelFixed: boolean; // if the half-life label is fixed, place it centered above the number line, otherwise,
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
  private arrowXPositionAnimation: null | Animation;
  private readonly halfLifeTextXPositionProperty: NumberProperty | undefined;
  private readonly labelFont: PhetFont | undefined;
  private arrowRotationAnimation: null | Animation;
  private readonly halfLifeArrowRotationProperty: NumberProperty;
  private halfLifeArrowLength: number | undefined;

  constructor( halfLifeNumberProperty: DerivedProperty<number,
                 [ protonCount: number, neutronCount: number, doesNuclideExist: boolean, isStable: boolean ]>,
               isStableBooleanProperty: DerivedProperty<boolean, [ protonCount: number, neutronCount: number ]>,
               providedOptions: HalfLifeNumberLineNodeOptions ) {
    super();

    const options = optionize<HalfLifeNumberLineNodeOptions, HalfLifeNumberLineNodeSelfOptions, NodeOptions>()( {}, providedOptions );
    this.labelFont = options.numberLineLabelFont;
    this.halfLifeArrowLength = options.halfLifeArrowLength;

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
    const arrowNode = new ArrowNode( 0, 0, 0, options.halfLifeArrowLength, {
      fill: BANColors.halfLifeColorProperty,
      stroke: null,
      tailWidth: 4,
      headWidth: 12
    } );
    const halfLifeArrow = new Node();
    halfLifeArrow.addChild( arrowNode );

    // keep track of the x position of the half-life arrow in model coordinates
    this.arrowXPositionProperty = new NumberProperty( 0 );
    this.arrowXPositionProperty.link( xPosition => {
      halfLifeArrow.translation = new Vector2( this.modelViewTransform.modelToViewX( xPosition ), this.tickMarkSet.centerY - options.halfLifeArrowLength );
    } );
    this.arrowXPositionAnimation = null;
    this.arrowRotationAnimation = null;

    // create and add the half life label and number readout
    const halfLifeColonText = new RichText( buildANucleusStrings.halfLifeColon, {
      font: options.isHalfLifeLabelFixed ? TITLE_FONT : options.numberLineLabelFont
    } );

    // would be either the infinity symbol, 'Unknown', or empty, or infinity
    const halfLifeValueText = new RichText( '', {
      font: options.isHalfLifeLabelFixed ? TITLE_FONT : options.numberLineLabelFont
    } );

    // the half life number in scientific notation with an 's' for seconds at the end
    const halfLifeScientificNotation = new ScientificNotationNode( halfLifeNumberProperty, {
      font: options.isHalfLifeLabelFixed ? TITLE_FONT : options.numberLineLabelFont
    } );
    const halfLifeNumberText = new HBox( {
      children: [
        halfLifeScientificNotation,
        new Text( buildANucleusStrings.s, { font: options.isHalfLifeLabelFixed ? TITLE_FONT : options.numberLineLabelFont } )
      ],
      align: 'bottom',
      spacing: 10
    } );

    // TODO: align the left and right side in the infinity case, and align the halfLifeText node so it doesnt jump up and down
    // waiting for CK to take a look at this
    const halfLifeText = new HBox( {
      children: [ halfLifeColonText, halfLifeValueText ],
      align: 'bottom',
      spacing: 10
    } );
    halfLifeText.bottom = halfLifeArrow.top;
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

    this.halfLifeArrowRotationProperty = new NumberProperty( 0 );
    Property.multilink( [ this.halfLifeArrowRotationProperty ], ( rotation: number ) => {
      halfLifeArrow.rotation = rotation;
    } );

    // function to show or hide the halfLifeArrow
    const showHalfLifeArrow = ( show: boolean ) => {
      if ( show && !this.hasChild( halfLifeArrow ) ) {
        this.addChild( halfLifeArrow );
      }
      else if ( !show && this.hasChild( halfLifeArrow ) ) {
        this.removeChild( halfLifeArrow );
      }
    };

    // function to show the halfLifeNumberText (true) or the halfLifeValueText (false)
    const showHalfLifeNumber = ( show: boolean ) => {
      if ( show && halfLifeText.hasChild( halfLifeValueText ) ) {
        halfLifeText.replaceChild( halfLifeValueText, halfLifeNumberText );
        halfLifeNumberText.bottom = halfLifeColonText.bottom;
      }
      else if ( !show && halfLifeText.hasChild( halfLifeNumberText ) ) {
        halfLifeText.replaceChild( halfLifeNumberText, halfLifeValueText );
        halfLifeValueText.bottom = halfLifeColonText.bottom;
      }
    };

    // link the halfLifeNumberProperty to the half-life arrow indicator and to the half-life number readout
    halfLifeNumberProperty.link( halfLifeNumber => {

      // the nuclide is stable
      if ( isStableBooleanProperty.value ) {
        showHalfLifeArrow( true );
        halfLifeValueText.setText( MathSymbols.INFINITY );
        halfLifeValueText.setFont( options.numberLineLargeLabelFont );
        showHalfLifeNumber( false );

        // peg the indicator to the right when stable
        this.moveHalfLifePointerSet( halfLifeNumber, options.isHalfLifeLabelFixed );
      }

      // the nuclide is unstable or does not exist
      else {
        halfLifeValueText.setFont( options.isHalfLifeLabelFixed ? TITLE_FONT : options.numberLineLabelFont );

        // the nuclide does not exist
        if ( halfLifeNumber === 0 ) {
          showHalfLifeArrow( false );
          showHalfLifeNumber( false );
          halfLifeValueText.setText( '' );
          this.moveHalfLifePointerSet( halfLifeNumber, options.isHalfLifeLabelFixed );
        }

        // the nuclide is unstable but the half-life data is unknown
        else if ( halfLifeNumber === -1 ) {
          showHalfLifeArrow( false );
          showHalfLifeNumber( false );
          halfLifeValueText.setText( buildANucleusStrings.unknown );
        }

        // the nuclide is unstable and the half-life data is known
        else {
          showHalfLifeArrow( true );
          showHalfLifeNumber( true );
          halfLifeValueText.setText( '' );

          // peg the indicator to the right when the half-life goes off-scale but still show the accurate half-life readout
          if ( halfLifeNumber > Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT ) ) {
            this.moveHalfLifePointerSet( Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT ), options.isHalfLifeLabelFixed );
          }
          else {
            this.moveHalfLifePointerSet( halfLifeNumber, options.isHalfLifeLabelFixed );
          }
        }
      }
    } );
  }

  /**
   * Animate the half-life arrow to the new half-life position along the number line. If the half-life text is a label
   * to the half-life arrow, animate it to its new half-life position too.
   */
  private moveHalfLifePointerSet( halfLife: number, isHalfLifeLabelFixed: boolean ): void {
    const newXPosition = HalfLifeNumberLineNode.logScaleNumberToLinearScaleNumber( halfLife );

    const arrowXPositionAnimationDuration = 0.7; // in seconds

    // animate the half-life arrow's x position
    if ( this.arrowXPositionAnimation ) {
      this.arrowXPositionAnimation.stop();
      this.arrowXPositionAnimation = null;
    }

    if ( isHalfLifeLabelFixed ) {
      this.arrowXPositionAnimation = new Animation( {
        to: newXPosition,
        property: this.arrowXPositionProperty,
        duration: arrowXPositionAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      } );
    }
    else {
      this.arrowXPositionAnimation = new Animation( {
        targets: [ {
          to: newXPosition,
          property: this.arrowXPositionProperty
        }, {
          to: newXPosition,
          property: this.halfLifeTextXPositionProperty
        } ],
        duration: arrowXPositionAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      } );
    }

    const arrowRotationAnimationDuration = 0.05; // in seconds

    // if the halfLife number is stable, then animate the arrow's rotation
    if ( this.arrowRotationAnimation ) {
      this.arrowRotationAnimation.stop();
      this.arrowRotationAnimation = null;
    }

    if ( halfLife === Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT ) ) {
      // rotate arrow horizontally, pointing right
      this.arrowRotationAnimation = new Animation( {
        to: -Math.PI / 2,
        property: this.halfLifeArrowRotationProperty,
        duration: arrowRotationAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      } );

      this.arrowXPositionAnimation.then( this.arrowRotationAnimation );
      this.arrowXPositionAnimation.start();

      this.arrowRotationAnimation.finishEmitter.addListener( () => {
        this.arrowRotationAnimation = null;
        this.arrowXPositionAnimation = null;
      } );
    }
    else {
      // rotate arrow back vertically, pointing down
      this.arrowRotationAnimation = new Animation( {
        to: 0,
        property: this.halfLifeArrowRotationProperty,
        duration: arrowRotationAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      } );

      this.arrowRotationAnimation.then( this.arrowXPositionAnimation );
      this.arrowRotationAnimation.start();

      this.arrowXPositionAnimation.finishEmitter.addListener( () => {
        this.arrowXPositionAnimation = null;
        this.arrowRotationAnimation = null;
      } );
    }
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
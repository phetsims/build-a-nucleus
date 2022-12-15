// Copyright 2022, University of Colorado Boulder

/**
 * Node that represents a number line for nucleons. The current nucleon count is highlighted on the number line.
 *
 * @author Luisa Vargas
 */

import { Color, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import ParticleType from '../../common/view/ParticleType.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import BANConstants from '../../common/BANConstants.js';
import Range from '../../../../dot/js/Range.js';
import TickMarkSet from '../../../../bamboo/js/TickMarkSet.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import TickLabelSet from '../../../../bamboo/js/TickLabelSet.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import BANColors from '../../common/BANColors.js';

class NucleonNumberLine extends Node {

  public constructor( particleType: ParticleType, particleCountProperty: TReadOnlyProperty<number>, orientation: Orientation ) {
    super();

    assert && assert( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON,
      'The particleType should be of type PROTON or NEUTRON. particleType = ' + particleType.name );

    const modelXStartRange = particleType === ParticleType.PROTON ?
                             BANConstants.DEFAULT_INITIAL_PROTON_COUNT : BANConstants.DEFAULT_INITIAL_NEUTRON_COUNT;
    const modelXEndRange = particleType === ParticleType.PROTON ? 10 : 12; // TODO: magic numbers or fine?
    const viewWidth = particleType === ParticleType.PROTON ? 250 : 300;
    const numberLineLength = new Range( modelXStartRange, modelXEndRange ).getLength();
    const tickMarkLength = viewWidth / numberLineLength;

    let modelViewTransform: ModelViewTransform2;
    if ( orientation === Orientation.HORIZONTAL ) {
      modelViewTransform = ModelViewTransform2.createRectangleMapping(
        new Bounds2( modelXStartRange, 0, modelXEndRange, 1 ),
        new Bounds2( 0, 0, viewWidth, tickMarkLength )
      );
    }
    else {
      modelViewTransform = ModelViewTransform2.createRectangleMapping(
        new Bounds2( 0, modelXStartRange, 1, modelXEndRange ),
        new Bounds2( 0, 0, tickMarkLength, viewWidth )
      );
    }

    const numberLineNode = new Node();
    let chartTransform;
    if ( orientation === Orientation.HORIZONTAL ) {
      chartTransform = new ChartTransform( {
        viewWidth: viewWidth,
        modelXRange: new Range( modelXStartRange, modelXEndRange )
      } );
    }
    else {
      chartTransform = new ChartTransform( {
        viewHeight: -viewWidth,
        modelYRange: new Range( modelXStartRange, modelXEndRange ),
        modelYRangeInverted: true
      } );
    }

    // create and add the tick marks
    const tickXSpacing = 1;
    const tickMarkSet = new TickMarkSet( chartTransform, orientation, tickXSpacing, {
      stroke: Color.BLACK,
      lineWidth: 2
    } );
    numberLineNode.addChild( tickMarkSet );

    // create and add the tick labels
    const tickLabelSet = new TickLabelSet( chartTransform, orientation, tickXSpacing, {
      extent: 5,
      createLabel: ( value: number ) => new Text( value, {
        fontSize: 12,
        fill: Color.BLACK
      } ),
      positionLabel: ( label: Node, tickBounds: Bounds2, axisOrientation: Orientation ) => {
        if ( axisOrientation === Orientation.HORIZONTAL ) {

          // ticks flow horizontally, so tick labels should be below
          label.centerTop = tickBounds.centerBottom.plusXY( modelViewTransform.modelToViewX( -0.5 ), 1 );
        }
        else {

          // ticks flow vertically, so tick labels should be to the left
          label.rightCenter = tickBounds.leftCenter.plusXY( -1, modelViewTransform.modelToViewY( 0.5 ) );
        }
        return label;
      }
    } );
    numberLineNode.addChild( tickLabelSet );

    // create and add the rectangle that would highlight the current particle count number on the number line
    const numberHighlightRectangle = new Rectangle( {
      // TODO: base this height and width off of the legend text size
      rectWidth: 8,
      rectHeight: 12,
      fill: particleType === ParticleType.PROTON ? BANColors.protonColorProperty : BANColors.neutronColorProperty
    } );
    if ( orientation === Orientation.HORIZONTAL ) {
      numberHighlightRectangle.centerY = tickLabelSet.centerY;

      // 'highlight' the label with the current particleCount on the tickLabelSet
      particleCountProperty.link( particleCount => {
        numberHighlightRectangle.x = tickLabelSet.left + ( particleCount * 25 );

        // for double digits double the width and adjust where the highlight starts
        if ( particleCount > 9 ) {
          numberHighlightRectangle.rectWidth = 16;
          numberHighlightRectangle.x -= 4;
        }
        else {
          numberHighlightRectangle.rectWidth = 8;
        }
      } );
    }
    else {
      numberHighlightRectangle.centerX = tickLabelSet.centerX;
    }
    this.addChild( numberHighlightRectangle );

    // create and add the arrow to the number line
    const tailX = particleType === ParticleType.NEUTRON ? modelViewTransform.modelToViewX( modelXStartRange - 1 ) : tickMarkSet.centerX;
    const tailY = particleType === ParticleType.NEUTRON ? tickMarkSet.centerY : modelViewTransform.modelToViewY( modelXStartRange + 1 );
    const tipX = particleType === ParticleType.NEUTRON ? modelViewTransform.modelToViewX( modelXEndRange + 1 ) : tickMarkSet.centerX;
    const tipY = particleType === ParticleType.NEUTRON ? tickMarkSet.centerY : modelViewTransform.modelToViewY( -( modelXEndRange + 1 ) );
    const numberLine = new ArrowNode( tailX, tailY, tipX, tipY, {
      stroke: Color.BLACK,
      tailWidth: 0.5,
      headWidth: 5
    } );
    numberLineNode.addChild( numberLine );
    this.addChild( numberLineNode );

    // create and add the number line axis label
    const numberLineLabel = new Text( StringUtils.fillIn( BuildANucleusStrings.nucleonNumber, {
      nucleonType: particleType.label
    } ), { fontSize: 14 } );
    if ( orientation === Orientation.HORIZONTAL ) {
      numberLineLabel.top = numberLine.bottom + 15;
      numberLineLabel.centerX = numberLine.centerX;
    }
    else {
      numberLineLabel.setRotation( 3 * Math.PI / 2 );
      numberLineLabel.centerX = numberLine.centerX - 20;
      numberLineLabel.centerY = numberLine.centerY;
    }
    this.addChild( numberLineLabel );
  }
}

buildANucleus.register( 'NucleonNumberLine', NucleonNumberLine );
export default NucleonNumberLine;
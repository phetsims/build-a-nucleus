// Copyright 2022-2023, University of Colorado Boulder

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
import Bounds2 from '../../../../dot/js/Bounds2.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import BANColors from '../../common/BANColors.js';
import AxisArrowNode from '../../../../bamboo/js/AxisArrowNode.js';

class NucleonNumberLine extends Node {

  public constructor( particleType: ParticleType, particleCountProperty: TReadOnlyProperty<number>, orientation: Orientation ) {
    super();

    assert && assert( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON,
      'The particleType should be of type PROTON or NEUTRON. particleType = ' + particleType.name );

    const numberLineNode = new Node();
    const chartTransform = new ChartTransform( {
      viewWidth: 250,
      modelXRange: new Range( BANConstants.DEFAULT_INITIAL_NEUTRON_COUNT, 12 ),
      viewHeight: 200,
      modelYRange: new Range( BANConstants.DEFAULT_INITIAL_PROTON_COUNT, 10 )
    } );

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
          label.centerTop = tickBounds.centerBottom.plusXY( chartTransform.modelToViewDeltaX( -0.5 ), 0 );
        }
        else {

          // ticks flow vertically, so tick labels should be to the left
          label.rightCenter = tickBounds.leftCenter.plusXY( 0, chartTransform.modelToViewDeltaY( -0.5 ) );
        }
        return label;
      }
    } );
    numberLineNode.addChild( tickLabelSet );

    // create and add the rectangle that would highlight the current particle count number on the number line
    const rectWidth = 8;
    const numberHighlightRectangle = new Rectangle( {
      // TODO: base this height and width off of the legend text size
      rectWidth: rectWidth,
      rectHeight: 12,
      fill: particleType === ParticleType.PROTON ? BANColors.protonColorProperty : BANColors.neutronColorProperty
    } );
    if ( orientation === Orientation.HORIZONTAL ) {
      numberHighlightRectangle.centerY = tickLabelSet.centerY;

      // 'highlight' the label with the current particleCount on the tickLabelSet
      particleCountProperty.link( particleCount => {
        numberHighlightRectangle.x = tickLabelSet.left + ( particleCount * chartTransform.modelToViewX( tickXSpacing ) );

        // for double digits double the width and adjust where the highlight starts
        if ( particleCount > 9 ) {
          numberHighlightRectangle.rectWidth = rectWidth * 2;
          numberHighlightRectangle.x -= 4;
        }
        else {
          numberHighlightRectangle.rectWidth = rectWidth;
        }
      } );
    }
    else {
      particleCountProperty.link( particleCount => {
        numberHighlightRectangle.bottom = tickLabelSet.bottom - ( particleCount * chartTransform.modelToViewX( tickXSpacing ) );

        if ( particleCount > 9 ) {
          numberHighlightRectangle.rectWidth = rectWidth * 2;
        }
        else {
          numberHighlightRectangle.rectWidth = rectWidth;
        }
        numberHighlightRectangle.right = tickLabelSet.right;
      } );
    }
    this.addChild( numberHighlightRectangle );

    // create and add the arrow to the number line
    const numberLine = new AxisArrowNode( chartTransform, orientation, {
      doubleHead: false,
      tailWidth: 1,
      headWidth: 7
    } );
    numberLineNode.addChild( numberLine );
    this.addChild( numberLineNode );

    // create and add the number line axis label
    const numberLineLabel = new Text( StringUtils.fillIn( BuildANucleusStrings.nucleonNumber, {
      nucleonType: particleType.label
    } ), { fontSize: 12 } );
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

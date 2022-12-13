// Copyright 2022, University of Colorado Boulder

/**
 * Node that represents a number line for nucleons. The current nucleon count is highlighted on the number line.
 *
 * @author Luisa Vargas
 */

import { Color, Node, Text } from '../../../../scenery/js/imports.js';
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

class NucleonNumberLine extends Node {

  public constructor( particleType: ParticleType ) {
    super();

    assert && assert( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON,
      'The particleType should be of type PROTON or NEUTRON. particleType = ' + particleType.name );

    const modelXStartRange = particleType === ParticleType.PROTON ?
                             BANConstants.DEFAULT_INITIAL_PROTON_COUNT : BANConstants.DEFAULT_INITIAL_NEUTRON_COUNT;
    const modelXEndRange = particleType === ParticleType.PROTON ? 10 : 12; // TODO: magic numbers or fine?
    const viewWidth = 300;
    const numberLineLength = new Range( modelXStartRange, modelXEndRange ).getLength();
    const tickMarkLength = viewWidth / numberLineLength;

    // TODO: Fix the view Y's
    const modelViewTransform = ModelViewTransform2.createRectangleMapping(
      new Bounds2( modelXStartRange, 0, modelXEndRange, 1 ),
      new Bounds2( 0, 0, viewWidth, tickMarkLength )
    );

    const numberLineNode = new Node();
    const tickMarkChartTransform = new ChartTransform( {
      viewWidth: viewWidth,
      modelXRange: new Range( modelXStartRange, modelXEndRange + 1 )
    } );
    const tickLabelChartTransform = new ChartTransform( {
      viewWidth: viewWidth,
      modelXRange: new Range( modelXStartRange, modelXEndRange )
    } );

    const tickXSpacing = 1;
    const tickMarkSet = new TickMarkSet( tickMarkChartTransform, Orientation.HORIZONTAL, tickXSpacing, {
      stroke: Color.BLACK,
      lineWidth: 2
    } );
    tickMarkSet.centerY = 0;
    numberLineNode.addChild( tickMarkSet );

    const tickLabelSet = new TickLabelSet( tickLabelChartTransform, Orientation.HORIZONTAL, tickXSpacing, {
      extent: 0,
      createLabel: ( value: number ) => new Text( value, {
        fontSize: 12,
        fill: Color.BLACK
      } )
    } );
    tickLabelSet.top = tickMarkSet.bottom;
    numberLineNode.addChild( tickLabelSet );

    const numberLine = new ArrowNode( modelViewTransform.modelToViewX( modelXStartRange ), tickMarkSet.centerY,
      modelViewTransform.modelToViewX( modelXEndRange + 1 ), tickMarkSet.centerY, {
        stroke: Color.BLACK,
        tailWidth: 0.5,
        headWidth: 5
    } );
    numberLineNode.addChild( numberLine );
    this.addChild( numberLineNode );

    const numberLineLabel = new Text( StringUtils.fillIn( BuildANucleusStrings.nucleonNumber, {
      nucleonType: particleType.label
    } ), { fontSize: 14 } );
    // TODO: not working
    numberLineLabel.top = numberLineLabel.bottom + 15;
    //numberLineLabel.centerY = numberLineNode.centerY;
    this.addChild( numberLineLabel );
  }
}

buildANucleus.register( 'NucleonNumberLine', NucleonNumberLine );
export default NucleonNumberLine;
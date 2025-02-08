// Copyright 2022-2025, University of Colorado Boulder

/**
 * Button with two arrows side by side that both point up or down.
 * Press and release immediately and the button fires on 'up'.
 * Press and hold for M milliseconds and the button will fire repeatedly every N milliseconds until released.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import TPaint from '../../../../scenery/js/util/TPaint.js';
import RectangularPushButton, { RectangularPushButtonOptions } from '../../../../sun/js/buttons/RectangularPushButton.js';
import buildANucleus from '../../buildANucleus.js';

export type ArrowButtonDirection = 'up' | 'down';

type SelfOptions = {

  // From tip to base.
  arrowHeight: number;

  // Width of base.
  arrowWidth: number;

  leftArrowFill: TPaint;
  rightArrowFill: TPaint;
};

export type DoubleArrowButtonOptions = SelfOptions & StrictOmit<RectangularPushButtonOptions, 'listener' | 'content'>;

export default class DoubleArrowButton extends RectangularPushButton {

  public constructor( direction: ArrowButtonDirection, callback: () => void, providedOptions?: DoubleArrowButtonOptions ) {

    const options =
      optionize<DoubleArrowButtonOptions, SelfOptions, RectangularPushButtonOptions>()( {

        // Options for the button.
        cursor: 'pointer',
        baseColor: 'white',
        stroke: 'black',
        lineWidth: 1,
        cornerRadius: 4,
        xMargin: 7,
        yMargin: 5,
        touchAreaXDilation: 7,
        touchAreaYDilation: 7,
        heightSizable: false
      }, providedOptions );

    options.listener = callback;

    // Arrow shape pointing up.
    const arrowShape = new Shape();
    arrowShape.moveTo( 0, 0 )
      .lineTo( options.arrowWidth / 2, options.arrowHeight )
      .lineTo( -options.arrowWidth / 2, options.arrowHeight ).close();

    // Function to create a double arrow path.
    const createDoubleArrow = ( direction: ArrowButtonDirection, leftArrowFill: TPaint, rightArrowFill: TPaint ) => {
      const leftArrowPath = new Path( arrowShape, { fill: leftArrowFill } );
      const rightArrowPath = new Path( arrowShape, { fill: rightArrowFill } );
      const doubleArrow = new HBox( {
        children: [ leftArrowPath, rightArrowPath ],
        sizable: false,
        spacing: 0
      } );

      if ( direction === 'down' ) {
        doubleArrow.setRotation( Math.PI );

        // Switch the colors since the arrow was rotated 180 degrees.
        leftArrowPath.fill = rightArrowFill;
        rightArrowPath.fill = leftArrowFill;
      }

      return doubleArrow;
    };

    options.content = createDoubleArrow( direction, options.leftArrowFill, options.rightArrowFill );

    super( options );
  }
}

buildANucleus.register( 'DoubleArrowButton', DoubleArrowButton );
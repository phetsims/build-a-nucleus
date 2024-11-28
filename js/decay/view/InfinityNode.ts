// Copyright 2022-2024, University of Colorado Boulder

/**
 * A symmetrical infinity symbol.
 *
 * @author Luisa Vargas
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Color, Path, PathOptions } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';

type SelfOptions = {
  radius?: number;
};
export type InfinityNodeOptions = SelfOptions & PathOptions;

class InfinityNode extends Path {

  public constructor( providedOptions?: InfinityNodeOptions ) {

    const options =
      optionize<InfinityNodeOptions, SelfOptions, PathOptions>()( {
        radius: 6,
        lineWidth: 2,
        stroke: Color.BLACK
      }, providedOptions );

    const radius = options.radius; // For convenience.
    const distanceBetweenCircles = 2.85 * radius; // Empirically determined to have the straight lines form an 'X'.

    const infinityShape = new Shape()
      .ellipticalArc( 0, -radius, radius, radius, 0, Math.PI / 4, -Math.PI / 4, false )
      .ellipticalArc( distanceBetweenCircles, -radius, radius, radius, 0, 3 * Math.PI / 4, 5 * Math.PI / 4, true )
      .close();

    super( infinityShape, options );
  }
}

buildANucleus.register( 'InfinityNode', InfinityNode );
export default InfinityNode;
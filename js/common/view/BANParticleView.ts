// Copyright 2023, University of Colorado Boulder

/**
 * Composite class to keep options consistent for ParticleView usages.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Particle from '../../../../shred/js/model/Particle.js';
import buildANucleus from '../../buildANucleus.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ParticleView, { ParticleViewOptions } from '../../../../shred/js/view/ParticleView.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';

export type BANParticleViewOptions = ParticleViewOptions;

export default class BANParticleView extends ParticleView {

  public constructor( particle: Particle, modelViewTransform: ModelViewTransform2, providedOptions?: BANParticleViewOptions ) {
    const options = optionize<BANParticleViewOptions, EmptySelfOptions, ParticleViewOptions>()( {
      touchOffset: new Vector2( 0, -30 ) // empirically determined, https://github.com/phetsims/build-a-nucleus/issues/197
    }, providedOptions );
    super( particle, modelViewTransform, options );
  }
}

buildANucleus.register( 'BANParticleView', BANParticleView );
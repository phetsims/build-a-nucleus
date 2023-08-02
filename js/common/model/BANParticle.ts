// Copyright 2023, University of Colorado Boulder

/**
 * Composite class to keep the animation velocity consistent.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

import Particle, { ParticleOptions } from '../../../../shred/js/model/Particle.js';
import BANConstants from '../BANConstants.js';
import buildANucleus from '../../buildANucleus.js';
import { ParticleTypeString } from '../../../../shred/js/model/Particle.js';

export type BANParticleOptions = ParticleOptions;
export default class BANParticle extends Particle {

  public constructor( type: ParticleTypeString, providedOptions?: BANParticleOptions ) {
    super( type, providedOptions );
    this.animationVelocityProperty.value = BANConstants.PARTICLE_ANIMATION_SPEED;
  }
}

buildANucleus.register( 'BANParticle', BANParticle );
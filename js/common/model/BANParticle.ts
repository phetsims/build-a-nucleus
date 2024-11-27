// Copyright 2023, University of Colorado Boulder

/**
 * Composite class to keep the animation velocity consistent.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Particle, { ParticleOptions, ParticleTypeString } from '../../../../shred/js/model/Particle.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../BANConstants.js';

const ANIMATION_TIME = 0.6; // in seconds
export type BANParticleOptions = ParticleOptions;
export default class BANParticle extends Particle {

  public constructor( type: ParticleTypeString, providedOptions?: BANParticleOptions ) {

    const options =
      optionize<BANParticleOptions, EmptySelfOptions, BANParticleOptions>()( {
        maxZLayer: BANConstants.NUMBER_OF_NUCLEON_LAYERS - 1
      }, providedOptions );
    super( type, options );
  }

  public static setAnimationDestination( particle: Particle, destination: Vector2, consistentTime = false ): void {
    particle.destinationProperty.value = destination;

    const distance = particle.destinationProperty.value.distance( particle.positionProperty.value );
    particle.animationVelocityProperty.value = consistentTime ?
                                               distance / ANIMATION_TIME :
                                               BANConstants.PARTICLE_ANIMATION_SPEED;
  }
}

buildANucleus.register( 'BANParticle', BANParticle );
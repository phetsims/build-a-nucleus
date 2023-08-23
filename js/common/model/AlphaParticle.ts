// Copyright 2023, University of Colorado Boulder

/**
 * A model element that represents an alpha particle, which is made up of 2 protons and 2 neutrons.
 *
 * @author Luisa Vargas
 */

import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import buildANucleus from '../../buildANucleus.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import BANConstants from '../BANConstants.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import Particle from '../../../../shred/js/model/Particle.js';

class AlphaParticle extends ParticleAtom {

  // for use in distance calculations
  public velocity = 0;

  public static readonly NUMBER_OF_ALLOWED_PROTONS = 2;
  public static readonly NUMBER_OF_ALLOWED_NEUTRONS = 2;

  public constructor() {
    super();
  }

  /**
   * Animate the alpha particle to a destination and remove its particles when it reaches that destination.
   */
  public animateAndRemoveParticle( destination: Vector2, removeParticle: ( particle: Particle ) => void ): Animation {
    const totalDistanceAlphaParticleTravels = this.positionProperty.value.distance( destination );

    // ParticleAtom doesn't have the same animation, like Particle.animationVelocityProperty
    const animationDuration = totalDistanceAlphaParticleTravels / BANConstants.PARTICLE_ANIMATION_SPEED;

    this.velocity = totalDistanceAlphaParticleTravels / animationDuration;

    const alphaParticleEmissionAnimation = new Animation( {
      property: this.positionProperty,
      to: destination,
      duration: animationDuration,
      easing: Easing.LINEAR
    } );

    // remove all particles individually from the model
    // REVIEW: I (jbphet) ran a test where I put a debug statement in this listener and then hit Reset All before the
    //         animation was complete, and the listener never fired, so the dispose function was never called.  This
    //         might lead to a minor memory lead.  Perhaps endedEmitter should be used instead?
    alphaParticleEmissionAnimation.finishEmitter.addListener( () => {
      this.neutrons.forEach( neutron => {
        removeParticle( neutron );
      } );
      this.protons.forEach( proton => {
        removeParticle( proton );
      } );
      this.dispose();
    } );
    alphaParticleEmissionAnimation.start();

    return alphaParticleEmissionAnimation;
  }
}

buildANucleus.register( 'AlphaParticle', AlphaParticle );
export default AlphaParticle;
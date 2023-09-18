// Copyright 2022-2023, University of Colorado Boulder

/**
 * Creates Particle's when pressed down on.
 *
 * @author Luisa Vargas
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { DragListener, Node, PressListenerEvent } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import ParticleType from '../model/ParticleType.js';
import BANConstants from '../BANConstants.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BANParticle from '../model/BANParticle.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Particle from '../../../../shred/js/model/Particle.js';

class NucleonCreatorNode extends Node {

  public constructor( particleType: ParticleType, getLocalPoint: ( point: Vector2 ) => Vector2,
                      addAndDragParticle: ( event: PressListenerEvent, particle: Particle ) => void,
                      particleTransform: ModelViewTransform2 ) {
    super();

    const targetNode = new ParticleNode( particleType.particleTypeString, BANConstants.PARTICLE_RADIUS );
    this.addChild( targetNode );
    this.touchArea = this.localBounds.dilated( 10 );

    this.addInputListener( DragListener.createForwardingListener( event => {

      // We want this relative to the screen view, so it is guaranteed to be the proper view coordinates.
      const viewPosition = getLocalPoint( event.pointer.point );
      const particle = new BANParticle( particleType.particleTypeString );

      // Once we have the number's bounds, we set the position so that our pointer is in the middle of the drag target.
      particle.setPositionAndDestination(
        particleTransform.viewToModelPosition( viewPosition ).minus( particle.positionProperty.value )
      );

      // Create and start dragging the new particle.
      addAndDragParticle( event, particle );
    } ) );
  }
}

buildANucleus.register( 'NucleonCreatorNode', NucleonCreatorNode );
export default NucleonCreatorNode;
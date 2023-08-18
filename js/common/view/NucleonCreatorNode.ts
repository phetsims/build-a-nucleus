// Copyright 2022-2023, University of Colorado Boulder

/**
 * Creates Particle's when pressed down on.
 *
 * @author Luisa Vargas
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { DragListener, Node } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BANScreenView from './BANScreenView.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import ParticleType from '../model/ParticleType.js';
import BANModel from '../model/BANModel.js';
import BANConstants from '../BANConstants.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BANParticle from '../model/BANParticle.js';

class NucleonCreatorNode<T extends ParticleAtom> extends Node {

  public constructor( particleType: ParticleType, screenView: BANScreenView<BANModel<T>>, particleTransform: ModelViewTransform2 ) {
    super();

    const targetNode = new ParticleNode( particleType.particleTypeString, BANConstants.PARTICLE_RADIUS );
    this.addChild( targetNode );
    this.touchArea = this.localBounds.dilated( 10 );

    this.addInputListener( DragListener.createForwardingListener( event => {

      // We want this relative to the screen view, so it is guaranteed to be the proper view coordinates.
      const viewPosition = screenView.globalToLocalPoint( event.pointer.point );
      const particle = new BANParticle( particleType.particleTypeString );
      particle.animationVelocityProperty.value = BANConstants.PARTICLE_ANIMATION_SPEED;

      // Once we have the number's bounds, we set the position so that our pointer is in the middle of the drag target.
      particle.setPositionAndDestination(
        particleTransform.viewToModelPosition( viewPosition ).minus( particle.positionProperty.value )
      );

      // Create and start dragging the new particle
      screenView.addAndDragParticle( event, particle );
    } ) );
  }
}

buildANucleus.register( 'NucleonCreatorNode', NucleonCreatorNode );
export default NucleonCreatorNode;
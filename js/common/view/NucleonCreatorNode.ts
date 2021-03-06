// Copyright 2022, University of Colorado Boulder

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
import ParticleType from '../../decay/view/ParticleType.js';
import Particle from '../../../../shred/js/model/Particle.js';
import DecayScreenView from '../../decay/view/DecayScreenView.js';
import BANModel from '../model/BANModel.js';
import BANConstants from '../BANConstants.js';

class NucleonCreatorNode extends Node {

  public constructor( particleType: ParticleType, screenView: BANScreenView<BANModel> ) {
    super();

    const targetNode = new ParticleNode( particleType.name.toLowerCase(), 10 );
    this.addChild( targetNode );
    this.touchArea = this.localBounds.dilated( 10 );

    this.addInputListener( DragListener.createForwardingListener( event => {

      // We want this relative to the screen view, so it is guaranteed to be the proper view coordinates.
      const viewPosition = screenView.globalToLocalPoint( event.pointer.point );
      const particle = new Particle( particleType.name.toLowerCase(), {
        maxZLayer: DecayScreenView.NUMBER_OF_NUCLEON_LAYERS - 1
      } );
      particle.animationVelocityProperty.value = BANConstants.PARTICLE_ANIMATION_SPEED;

      // Once we have the number's bounds, we set the position so that our pointer is in the middle of the drag target.
      particle.setPositionAndDestination(
        screenView.modelViewTransform.viewToModelPosition( viewPosition ).minus( particle.positionProperty.value )
      );

      // Create and start dragging the new particle
      screenView.addAndDragParticle( event, particle );
    } ) );
  }
}

buildANucleus.register( 'NucleonCreatorNode', NucleonCreatorNode );
export default NucleonCreatorNode;
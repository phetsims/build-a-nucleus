// Copyright 2022-2023, University of Colorado Boulder

/**
 * ScreenView class that the 'Decay' and 'Nuclide Chart' will extend.
 *
 * @author Luisa Vargas
 */

import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANModel from '../model/BANModel.js';
import { Node, PressListenerEvent } from '../../../../scenery/js/imports.js';
import NucleonNumberPanel from './NucleonNumberPanel.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ParticleType from '../model/ParticleType.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ShellModelNucleus from '../../chart-intro/model/ShellModelNucleus.js';
import ParticleAtomNode from './ParticleAtomNode.js';
import DecayType from '../model/DecayType.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import BANParticle from '../model/BANParticle.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import AlphaParticle from '../model/AlphaParticle.js';
import ElementNameText from './ElementNameText.js';
import NucleonCreatorsNode from './NucleonCreatorsNode.js';
import BANQueryParameters from '../BANQueryParameters.js';

// types
type SelfOptions = {

  // Position of the center of the atom in the Decay screen and the top left corner of the energy levels in the
  // Chart Intro screen.
  particleViewPosition?: Vector2;
};
export type BANScreenViewOptions = SelfOptions & ScreenViewOptions;

export type ParticleViewMap = Record<number, ParticleView>;
type ParticleTypeInfo = {
  maxNumber: number;
  creatorNode: Node;
  numberOfNucleons: number;
  outgoingNucleons: number;
};

abstract class BANScreenView<M extends BANModel<ParticleAtom | ShellModelNucleus>> extends ScreenView {

  protected model: M;
  private previousProtonNumber = 0;
  private previousNeutronNumber = 0;
  protected readonly resetAllButton: Node;
  protected readonly nucleonNumberPanel: Node;

  // The time since the step() count has started.
  private timeSinceCountdownStarted = 0;

  // ParticleView.id => {ParticleView} - lookup map for efficiency. Used for storage only.
  protected readonly particleViewMap: ParticleViewMap = {};

  // The spinner buttons.
  protected readonly nucleonCreatorsNode: NucleonCreatorsNode;

  protected readonly elementNameText: ElementNameText;

  // The view for the ParticleAtom, the cluster of nucleons in Decay screen and the mini-atom in the Chart Intro screen.
  protected readonly particleAtomNode: ParticleAtomNode;

  // MVT for dragging particle's, setting particle's positions, and positioning energy levels and
  // DecayScreen particleAtom center.
  protected readonly particleTransform: ModelViewTransform2;

  protected constructor( model: M, atomCenter: Vector2, providedOptions?: BANScreenViewOptions ) {

    const options =
      optionize<BANScreenViewOptions, SelfOptions, ScreenViewOptions>()( {

        // To help with animation lagging, see https://github.com/phetsims/build-a-nucleus/issues/47
        preventFit: true,

        particleViewPosition: atomCenter,
        layoutBounds: BANConstants.LAYOUT_BOUNDS
      }, providedOptions );

    super( options );

    this.model = model;

    // Create and add the NucleonNumberPanel.
    this.nucleonNumberPanel = new NucleonNumberPanel(
      this.model.particleAtom.protonCountProperty, this.model.protonNumberRange,
      this.model.particleAtom.neutronCountProperty, this.model.neutronNumberRange );
    this.nucleonNumberPanel.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( this.nucleonNumberPanel );

    // Create and add the textual readout for the element name.
    this.elementNameText = new ElementNameText( this.model.particleAtom.protonCountProperty,
      this.model.particleAtom.neutronCountProperty,
      this.model.nuclideExistsProperty );
    this.addChild( this.elementNameText );

    this.particleTransform = ModelViewTransform2.createSinglePointScaleMapping( Vector2.ZERO, options.particleViewPosition, 1 );

    this.nucleonCreatorsNode = new NucleonCreatorsNode( this.model, this.addAndDragParticle.bind( this ),
      this.particleTransform, this.createParticleFromStack.bind( this ), this.returnParticleToStack.bind( this ) );
    this.nucleonCreatorsNode.centerX = atomCenter.x;
    this.nucleonCreatorsNode.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( this.nucleonCreatorsNode );

    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // Cancel interactions that may be in progress.
        this.model.reset();
        this.reset();

        assert &&
        BANQueryParameters.decayScreenProtons === 0 && BANQueryParameters.decayScreenNeutrons === 0 &&
        BANQueryParameters.chartIntroScreenProtons === 0 && BANQueryParameters.chartIntroScreenNeutrons === 0 &&
        assert( Object.keys( this.particleViewMap ).length === 0,
          'all views should be cleaned up on reset\n' +
          Object.keys( this.particleViewMap ).map( ( x: string ) => {
            const particle = this.particleViewMap[ x as unknown as number ].particle;
            return particle ?
                   `${particle.id}, ${particle.type}, disposed:${particle.isDisposed}, ${particle.colorProperty.value.toString()}` :
                   '';
          } ) );
      },
      right: this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN
    } );
    this.addChild( this.resetAllButton );


    // Add ParticleView's to match the model.
    this.model.particles.addItemAddedListener( ( particle: Particle ) => {
      const particleView = new ParticleView( particle, this.particleTransform );

      this.particleViewMap[ particleView.particle.id ] = particleView;
      this.addParticleView( particle );
      const particleType = ParticleType.getParticleTypeFromStringType( particle.type );

      if ( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ) {

        // Called when a nucleon is finished being dragged.
        particle.userControlledProperty.lazyLink( userControlled => !userControlled && this.dragEndedListener( particle, this.model.particleAtom ) );
        this.checkIfCreatorNodeShouldBeInvisible( particleType );
      }

      particle.disposeEmitter.addListener( () => {
        delete this.particleViewMap[ particle.id ];

        particleView.dispose();

        const particleType = ParticleType.getParticleTypeFromStringType( particle.type );

        if ( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ) {
          this.checkIfCreatorNodeShouldBeVisible( particleType );
        }
      } );
    } );

    // Remove ParticleView's to match the model. Dispose emitter deals with the view portion.
    this.model.particles.addItemRemovedListener( ( particle: Particle ) => {
      particle.dispose();
    } );

    // Create the particleAtomNode but add it in subclasses so particles are in top layer.
    this.particleAtomNode = new ParticleAtomNode( this.model.particleAtom, atomCenter, this.model.protonNumberRange );

    // Update the cloud size as the massNumber changes.
    this.model.particleAtom.protonCountProperty.link(
      protonNumber => this.particleAtomNode.updateCloudSize( protonNumber, 0.27, 10, 20 ) );

    this.pdomPlayAreaNode.pdomOrder = [
      this.nucleonCreatorsNode
    ];
    this.pdomControlAreaNode.pdomOrder = [ this.resetAllButton ];
  }

  /**
   * Get information for a specific particle type.
   */
  private getInfoForParticleType( particleType: ParticleType ): ParticleTypeInfo {
    const maxNumber = particleType === ParticleType.PROTON ? this.model.protonNumberRange.max :
                      this.model.neutronNumberRange.max;
    const creatorNode = particleType === ParticleType.PROTON ? this.nucleonCreatorsNode.protonsCreatorNode :
                        this.nucleonCreatorsNode.neutronsCreatorNode;
    const numberOfNucleons = [ ...this.model.particles ]
      .filter( particle => particle.type === particleType.particleTypeString ).length;
    const outgoingNucleons = [ ...this.model.outgoingParticles ]
      .filter( particle => particle.type === particleType.particleTypeString ).length;

    return {
      maxNumber: maxNumber,
      creatorNode: creatorNode,
      numberOfNucleons: numberOfNucleons,
      outgoingNucleons: outgoingNucleons
    };
  }

  /**
   * Hides the given creator node if the number for that nucleon type has reached its max.
   */
  private checkIfCreatorNodeShouldBeInvisible( particleType: ParticleType ): void {
    const infoForParticleType = this.getInfoForParticleType( particleType );

    if ( ( infoForParticleType.numberOfNucleons - infoForParticleType.outgoingNucleons ) >= infoForParticleType.maxNumber ) {
      BANScreenView.setCreatorNodeVisibility( infoForParticleType.creatorNode, false );
    }
  }

  /**
   * Shows the given creator node if the number for that nucleon type is below its max.
   */
  private checkIfCreatorNodeShouldBeVisible( particleType: ParticleType ): void {
    const infoForParticleType = this.getInfoForParticleType( particleType );

    if ( ( infoForParticleType.numberOfNucleons - infoForParticleType.outgoingNucleons ) < infoForParticleType.maxNumber ) {
      BANScreenView.setCreatorNodeVisibility( infoForParticleType.creatorNode, true );
    }
  }

  /**
   * Make nucleon creator nodes visible if their nucleon numbers are below their max amounts.
   */
  private checkIfCreatorNodesShouldBeVisible(): void {
    this.checkIfCreatorNodeShouldBeVisible( ParticleType.PROTON );
    this.checkIfCreatorNodeShouldBeVisible( ParticleType.NEUTRON );
  }

  /**
   * Set the input enabled and visibility of a creator node.
   */
  private static setCreatorNodeVisibility( creatorNode: Node, visible: boolean ): void {
    if ( creatorNode.visible !== visible ) {
      creatorNode.visible = visible;
      creatorNode.inputEnabled = visible;
    }
  }

  /**
   * Create a particle of particleType at its creator node and send it (and add it) to the particleAtom.
   */
  protected createParticleFromStack( particleType: ParticleType ): Particle {

    // Create a particle at the center of its creator node.
    const particle = new BANParticle( particleType.particleTypeString );
    const origin = particleType === ParticleType.PROTON ?
                   this.nucleonCreatorsNode.protonsCreatorNodeModelCenter :
                   this.nucleonCreatorsNode.neutronsCreatorNodeModelCenter;
    particle.setPositionAndDestination( origin );

    // Send the particle the center of the particleAtom and add it to the model.
    particle.destinationProperty.value = this.model.getParticleDestination( particleType, particle );
    this.model.addParticle( particle );

    // Don't let the particle be clicked until it reaches the particleAtom.
    const particleView = this.findParticleView( particle );
    particleView.inputEnabled = false;

    if ( particleType === ParticleType.PROTON ) {
      this.model.incomingProtons.push( particle );
    }
    else {
      this.model.incomingNeutrons.push( particle );
    }

    // Add the particle to the particleAtom once it reaches the center of the particleAtom and allow it to be clicked.
    particle.animationEndedEmitter.addListener( () => {
      if ( !this.model.particleAtom.containsParticle( particle ) ) {

        this.model.clearIncomingParticle( particle, particleType );

        this.model.particleAtom.addParticle( particle );
        particleView.inputEnabled = true;
      }
    } );

    return particle;
  }

  /**
   * Remove a particle of particleType from the particleAtom, if it is in the particleAtom, and send it back to its
   * creator node.
   */
  private returnParticleToStack( particleType: ParticleType ): void {
    const creatorNodePosition = particleType === ParticleType.PROTON ?
                                this.nucleonCreatorsNode.protonsCreatorNodeModelCenter :
                                this.nucleonCreatorsNode.neutronsCreatorNodeModelCenter;

    const particleToReturn = this.model.getParticleToReturn( particleType, creatorNodePosition );

    // Remove the particle from the particleAtom, if the particle is a part of the particleAtom. It should not count
    // in the atom while animating back to the stack
    if ( this.model.particleAtom.containsParticle( particleToReturn ) ) {
      this.model.particleAtom.removeParticle( particleToReturn );
    }
    else if ( this.model.incomingNeutrons.includes( particleToReturn )
              || this.model.incomingProtons.includes( particleToReturn ) ) {
      this.model.clearIncomingParticle( particleToReturn, particleType );
    }
    else {
      assert && assert( false, 'The above cases should cover all possibilities' );
    }

    assert && assert( !particleToReturn.animationEndedEmitter.hasListeners(),
      'should not have animation listeners, we are about to animate' );

    // Send particle back to its creator node position.
    this.animateAndRemoveParticle( particleToReturn, creatorNodePosition );
  }

  /**
   * Animate particle to the given destination, if there is one, and then remove it.
   */
  protected animateAndRemoveParticle( particle: Particle, destination?: Vector2 ): void {
    const particleView = this.findParticleView( particle );
    particleView.inputEnabled = false;

    if ( destination ) {
      particle.destinationProperty.value = destination;

      particle.animationEndedEmitter.addListener( () => {
        !particle.isDisposed && this.model.removeParticle( particle );
      } );
    }
    else {
      this.model.removeParticle( particle );
    }
  }

  /**
   * Add a particle to the model and immediately start dragging it with the provided event.
   */
  public addAndDragParticle( event: PressListenerEvent, particle: Particle ): void {
    this.model.addParticle( particle );
    const particleView = this.findParticleView( particle );
    particleView.startSyntheticDrag( event );
  }

  protected reset(): void {
    this.previousProtonNumber = 0;
    this.previousNeutronNumber = 0;
    this.timeSinceCountdownStarted = 0;
  }

  /**
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    const protonNumber = this.model.particleAtom.protonCountProperty.value;
    const neutronNumber = this.model.particleAtom.neutronCountProperty.value;

    // A special case for when there are no particles, since it technically doesn't exist, but it is an acceptable state.
    const p0n0Case = protonNumber === 0 && neutronNumber === 0;

    // We don't want this automatic atom-fixing behavior for the p0,n0 case.
    if ( !this.model.nuclideExistsProperty.value && !p0n0Case ) {

      // Start countdown to show the nuclide that does not exist for {{BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST}} seconds.
      this.timeSinceCountdownStarted += dt;
    }
    else {
      this.timeSinceCountdownStarted = 0;

      // Store the last valid atom configuration to go back to after a certain amount of time.
      this.previousProtonNumber = protonNumber;
      this.previousNeutronNumber = neutronNumber;
    }

    // Show the nuclide that does not exist for one second, then return the necessary particles.
    if ( this.timeSinceCountdownStarted >= BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST &&

         // User controlled particles get another behavior because we want that specific particle to go back to
         // the atom, see this.dragEndedListener().
         this.model.userControlledNeutrons.length === 0 &&
         this.model.userControlledProtons.length === 0 ) {
      this.timeSinceCountdownStarted = 0;

      assert && assert( AtomIdentifier.doesExist( this.previousProtonNumber, this.previousNeutronNumber ) ||
                        ( this.previousProtonNumber === 0 && this.previousNeutronNumber === 0 ),
        `cannot set back to a non existent previous: p${this.previousProtonNumber}, n${this.previousNeutronNumber}` );

      if ( this.previousProtonNumber < protonNumber ) {
        _.times( protonNumber - this.previousProtonNumber, () => {
          this.returnParticleToStack( ParticleType.PROTON );
        } );
      }
      else if ( this.previousProtonNumber > protonNumber ) {
        _.times( this.previousProtonNumber - protonNumber, () => {
          this.createParticleFromStack( ParticleType.PROTON );
        } );
      }
      if ( this.previousNeutronNumber < neutronNumber ) {
        _.times( neutronNumber - this.previousNeutronNumber, () => {
          this.returnParticleToStack( ParticleType.NEUTRON );
        } );
      }
      else if ( this.previousNeutronNumber > neutronNumber ) {
        _.times( this.previousNeutronNumber - neutronNumber, () => {
          this.createParticleFromStack( ParticleType.NEUTRON );
        } );
      }
    }
  }

  /**
   * Given a Particle, find our current display (ParticleView) of it.
   */
  protected findParticleView( particle: Particle ): ParticleView {
    const particleView = this.particleViewMap[ particle.id ];
    assert && assert( particleView, 'Did not find matching ParticleView for type ' + particle.type
                                    + ' and id ' + particle.id );
    return particleView;
  }

  /**
   * Define a function that will decide where to put nucleons.
   */
  private dragEndedListener( nucleon: Particle, atom: ParticleAtom ): void {
    const particleCreatorNodeModelCenter = nucleon.type === ParticleType.PROTON.particleTypeString ?
                                           this.nucleonCreatorsNode.protonsCreatorNodeModelCenter :
                                           this.nucleonCreatorsNode.neutronsCreatorNodeModelCenter;

    // If removing the nucleon will create a nuclide that does not exist, re-add the nucleon to the atom.
    const currentlyNonExistentAtom =
      this.model.particleAtom.massNumberProperty.value !== 0 &&
      !AtomIdentifier.doesExist( this.model.particleAtom.protonCountProperty.value,
        this.model.particleAtom.neutronCountProperty.value );


    if ( this.isNucleonInCaptureArea( nucleon, atom.positionProperty ) || currentlyNonExistentAtom ) {
      atom.addParticle( nucleon );
    }
    else {
      this.animateAndRemoveParticle( nucleon, particleCreatorNodeModelCenter );
    }
  }

  /**
   * Returns if a nucleon is in the capture area which is in a certain radius around the atom in the Decay Screen, and
   * the energy level area in the Chart Screen.
   */
  protected abstract isNucleonInCaptureArea( nucleon: Particle, atomPositionProperty: TReadOnlyProperty<Vector2> ): boolean;

  /**
   * Add particleView to correct layer.
   */
  protected abstract addParticleView( particle: Particle ): void;

  /**
   * Given a decayType, conduct that decay on the model's ParticleAtom.
   */
  protected decayAtom( decayType: DecayType | null ): void {
    const protons = this.model.particleAtom.protonCountProperty.value;
    const neutrons = this.model.particleAtom.neutronCountProperty.value;
    assert && assert( AtomIdentifier.doesExist( protons, neutrons ),
      `Decaying for a non existent atom with ${protons} protons and ${neutrons} neutrons.` );

    switch( decayType ) {
      case DecayType.NEUTRON_EMISSION:
        this.emitNucleon( ParticleType.NEUTRON );
        break;
      case DecayType.PROTON_EMISSION:
        this.emitNucleon( ParticleType.PROTON );
        break;
      case DecayType.BETA_PLUS_DECAY:
        this.betaDecay( DecayType.BETA_PLUS_DECAY );
        break;
      case DecayType.BETA_MINUS_DECAY:
        this.betaDecay( DecayType.BETA_MINUS_DECAY );
        break;
      case DecayType.ALPHA_DECAY:
        this.emitAlphaParticle();
        break;
      default:
        // No decay if there is no supported decayType.
        break;
    }
  }

  /**
   * Returns a random position, in view coordinates, outside the screen view's visible bounds.
   */
  protected getRandomEscapePosition(): Vector2 {
    const visibleBounds = this.visibleBoundsProperty.value.dilated( BANConstants.PARTICLE_DIAMETER * 10 ); // 10 particles wide
    const destinationBounds = visibleBounds.dilated( 300 );

    let randomVector = Vector2.ZERO;
    while ( visibleBounds.containsPoint( randomVector ) ) {
      randomVector = new Vector2( dotRandom.nextDoubleBetween( destinationBounds.minX, destinationBounds.maxX ),
        dotRandom.nextDoubleBetween( destinationBounds.minY, destinationBounds.maxY ) );
    }

    return randomVector;
  }

  /**
   * Removes a nucleon from the nucleus and animates it out of view.
   */
  protected emitNucleon( particleType: ParticleType, particleAtom: ParticleAtom = this.model.particleAtom ): void {
    const nucleon = particleAtom.extractParticle( particleType.particleTypeString );
    this.model.outgoingParticles.add( nucleon );
    this.animateAndRemoveParticle( nucleon, this.getRandomExternalModelPosition() );
  }

  /**
   * Return a random position, in model coordinates, that is outside the visible bounds.
   */
  protected abstract getRandomExternalModelPosition(): Vector2;

  /**
   * Creates an alpha particle by removing the needed nucleons from the nucleus, arranging them, and then animates the
   * particle out of view.
   */
  protected emitAlphaParticle( particleAtom: ParticleAtom = this.model.particleAtom ): AlphaParticle {
    assert && assert( this.model.particleAtom.protonCountProperty.value >= AlphaParticle.NUMBER_OF_ALLOWED_PROTONS &&
    this.model.particleAtom.neutronCountProperty.value >= AlphaParticle.NUMBER_OF_ALLOWED_NEUTRONS,
      'The particleAtom needs 2 protons and 2 neutrons to emit an alpha particle.' );

    // Create and add the alpha particle node.
    const alphaParticle = new AlphaParticle();

    // Get the protons and neutrons closest to the center of the particleAtom and remove them from the particleAtom.
    const protonsToRemove = _.times( AlphaParticle.NUMBER_OF_ALLOWED_PROTONS,
      () => particleAtom.extractParticleClosestToCenter( ParticleType.PROTON.particleTypeString ) );
    const neutronsToRemove = _.times( AlphaParticle.NUMBER_OF_ALLOWED_NEUTRONS,
      () => particleAtom.extractParticleClosestToCenter( ParticleType.NEUTRON.particleTypeString ) );

    // Add the obtained protons and neutrons to the alphaParticle.
    [ ...protonsToRemove, ...neutronsToRemove ].forEach( nucleon => {
      alphaParticle.addParticle( nucleon );
      this.model.outgoingParticles.add( nucleon );
      this.findParticleView( nucleon ).inputEnabled = false;
    } );

    // Ensure the creator nodes are visible since particles are being removed from the particleAtom.
    alphaParticle.moveAllParticlesToDestination();
    this.checkIfCreatorNodesShouldBeVisible();

    // Animate the particle to a random destination outside the model.
    const alphaParticleEmissionAnimation = alphaParticle.animateAndRemoveParticle(
      this.getRandomExternalModelPosition(), this.model.removeParticle.bind( this.model ) );
    this.model.particleAnimations.push( alphaParticleEmissionAnimation );

    return alphaParticle;
  }

  /**
   * Changes the nucleon type of a particle in the atom and emits an electron or positron from behind that particle.
   */
  protected betaDecay( betaDecayType: DecayType, particleAtom: ParticleAtom = this.model.particleAtom ): Particle {
    let particleArray;
    let particleToEmit: Particle;
    if ( betaDecayType === DecayType.BETA_MINUS_DECAY ) {
      particleArray = particleAtom.neutrons;
      particleToEmit = new BANParticle( ParticleType.ELECTRON.particleTypeString );
    }
    else {
      particleArray = particleAtom.protons;
      particleToEmit = new BANParticle( ParticleType.POSITRON.particleTypeString );
    }

    // Get a random particle from the particleArray to determine the particleType.
    const particleTypeString = ParticleType.enumeration.getValue( particleArray.get( 0 ).type.toUpperCase() ).name;
    assert && assert( particleArray.lengthProperty.value >= 1,
      'The particleAtom needs a ' + particleTypeString + ' for a ' + betaDecayType.name );

    // The particle that will change its nucleon type will be the one closest to the center of the atom.
    const closestParticle = _.sortBy( [ ...particleArray ],
      closestParticle => closestParticle.positionProperty.value.distance( particleAtom.positionProperty.value )
    ).shift()!;

    // Place the particleToEmit in the same position and behind the particle that is changing its nucleon type.
    particleToEmit.positionProperty.value = closestParticle.positionProperty.value;
    particleToEmit.zLayerProperty.value = closestParticle.zLayerProperty.value + 1;

    const destination = this.getRandomExternalModelPosition();

    this.model.outgoingParticles.add( particleToEmit );

    // Add the particle to the model to emit it, then change the nucleon type and remove the particle.
    particleAtom.changeNucleonType( closestParticle, () => {
      assert && assert( !particleToEmit.isDisposed, 'cannot animate a removedParticle' );
      this.animateAndRemoveParticle( particleToEmit, destination );
      this.checkIfCreatorNodeShouldBeInvisible( ParticleType.PROTON );
      this.checkIfCreatorNodeShouldBeInvisible( ParticleType.NEUTRON );
      this.checkIfCreatorNodesShouldBeVisible();
    } );

    return particleToEmit;
  }
}

buildANucleus.register( 'BANScreenView', BANScreenView );
export default BANScreenView;

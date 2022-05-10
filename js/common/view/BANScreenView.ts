// Copyright 2022, University of Colorado Boulder

/**
 * ScreenView class that the 'Decay' and 'Nuclide Chart' will extend.
 *
 * @author Luisa Vargas
 */

import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANModel from '../model/BANModel.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import { Circle, Node, PressListenerEvent, ProfileColorProperty, RadialGradient, Text, VBox } from '../../../../scenery/js/imports.js';
import BANColors from '../BANColors.js';
import NucleonCountPanel from './NucleonCountPanel.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import DoubleArrowButton, { DoubleArrowButtonDirection } from './DoubleArrowButton.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import NucleonCreatorNode from './NucleonCreatorNode.js';
import ParticleType from '../../decay/view/ParticleType.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DecayScreenView from '../../decay/view/DecayScreenView.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import Property from '../../../../axon/js/Property.js';


// empirically determined, from the ElectronCloudView radius
const MIN_ELECTRON_CLOUD_RADIUS = 42.5;

// types
export type BANScreenViewOptions = ScreenViewOptions & PickRequired<ScreenViewOptions, 'tandem'>;
export type ParticleViewMap = {
  [ key: number ]: ParticleView;
};

// constants
const HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS = 160;

abstract class BANScreenView<M extends BANModel> extends ScreenView {

  public readonly resetAllButton: ResetAllButton;
  public readonly nucleonCountPanel: NucleonCountPanel;
  protected model: M;
  private readonly particleViewMap: ParticleViewMap;
  protected readonly particleViewLayerNode: Node;
  protected modelViewTransform: ModelViewTransform2;
  protected readonly protonsCreatorNode: NucleonCreatorNode;
  protected readonly neutronsCreatorNode: NucleonCreatorNode;
  protected readonly electronCloud: Circle;
  public static protonsCreatorNodeModelCenter: Vector2;
  public static neutronsCreatorNodeModelCenter: Vector2;
  private timeSinceCountdownStarted: number;
  private previousProtonCount: number;
  private previousNeutronCount: number;

  protected constructor( model: M, providedOptions?: BANScreenViewOptions ) {

    const options = optionize<BANScreenViewOptions, {}, ScreenViewOptions>()( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

    this.model = model;
    this.timeSinceCountdownStarted = 0;
    this.previousProtonCount = 0;
    this.previousNeutronCount = 0;

    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      new Vector2( 335, 339 ), // the center of the atom node
      1.0 );

    // ParticleView.id => {ParticleView} - lookup map for efficiency
    this.particleViewMap = {};

    // where the ParticleView's are, is added at the end of subclasses for the correct z order
    this.particleViewLayerNode = new Node();

    this.nucleonCountPanel = new NucleonCountPanel( model.particleAtom.protonCountProperty, model.protonCountRange,
      model.particleAtom.neutronCountProperty, model.neutronCountRange );
    this.nucleonCountPanel.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.nucleonCountPanel.left = this.layoutBounds.maxX - 200;
    this.addChild( this.nucleonCountPanel );

    const arrowButtonSpacing = 7; // spacing between the 'up' arrow buttons and 'down' arrow buttons
    const arrowButtonOptions = {
      arrowWidth: 14,
      arrowHeight: 14
    };

    // return if any nuclides exist above, below, or to the left or right of a given nuclide
    const getNextOrPreviousIso = ( direction: string, particleType: ParticleType, protonCount: number, neutronCount: number ) => {

      if ( direction === 'up' ) {

        // proton up arrow
        if ( particleType === ParticleType.PROTON ) {
          return AtomIdentifier.doesNextIsotoneExist( protonCount, neutronCount );
        }

        // neutron up arrow
        return AtomIdentifier.doesNextIsotopeExist( protonCount, neutronCount );
      }

      // proton down arrow
      if ( particleType === ParticleType.PROTON ) {
        return AtomIdentifier.doesPreviousIsotoneExist( protonCount, neutronCount );
      }

      // neutron down arrow
      return AtomIdentifier.doesPreviousIsotopeExist( protonCount, neutronCount );
    };

    // function to return whether the protonCount or neutronCount is at its min or max range
    const returnNucleonCountAtRange = ( direction: string, particleType: ParticleType, protonCount: number, neutronCount: number ) => {
      if ( direction === 'up' ) {

        // proton up arrow
        if ( particleType === ParticleType.PROTON ) {
          return protonCount !== model.protonCountRange.max;
        }

        // neutron up arrow
        return neutronCount !== model.neutronCountRange.max;
      }

      // proton down arrow
      if ( particleType === ParticleType.PROTON ) {
        return protonCount !== model.protonCountRange.min;
      }

      // neutron down arrow
      return neutronCount !== model.neutronCountRange.min;
    };

    const creatorNodeEnabled = ( creatorNode: Node, enable: boolean ) => {
      if ( creatorNode ) {
        creatorNode.inputEnabled = enable;
        creatorNode.opacity = enable ? 1 : 0.5;
      }
    };

    // function to create the arrow enabled properties
    const createArrowEnabledProperty = ( direction: string, firstParticleType: ParticleType, secondParticleType?: ParticleType ) => {
      return new DerivedProperty( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty,
          model.incomingProtons.lengthProperty, model.incomingNeutrons.lengthProperty ],
        ( atomProtonCount, atomNeutronCount, incomingProtonsCount, incomingNeutronsCount ) => {

          const protonCount = atomProtonCount + incomingProtonsCount;
          const neutronCount = atomNeutronCount + incomingNeutronsCount;

          // disable all arrow buttons if the nuclide does not exist
          if ( !AtomIdentifier.doesExist( protonCount, neutronCount ) && model.massNumberProperty.value !== 0 ) {
            creatorNodeEnabled( this.protonsCreatorNode, false );
            creatorNodeEnabled( this.neutronsCreatorNode, false );
            return false;
          }

          else {
            creatorNodeEnabled( this.protonsCreatorNode, true );
            creatorNodeEnabled( this.neutronsCreatorNode, true );

            const nextOrPreviousIsoExists = secondParticleType ?
                                            !getNextOrPreviousIso( direction, firstParticleType, protonCount, neutronCount ) ||
                                            !getNextOrPreviousIso( direction, secondParticleType, protonCount, neutronCount ) :
                                            !getNextOrPreviousIso( direction, firstParticleType, protonCount, neutronCount );

            const doesNuclideExist = AtomIdentifier.doesExist( protonCount, neutronCount );
            const nuclideExistsBoolean = direction === 'up' ? !doesNuclideExist : doesNuclideExist;

            const doesPreviousNuclideExist = secondParticleType && direction === 'down' ? !AtomIdentifier.doesPreviousNuclideExist( protonCount, neutronCount ) : nextOrPreviousIsoExists;

            // it is allowed to go back the default starting case of zero protons and zero neutrons even though a nuclide
            // with zero protons and zero neutrons does not exist
            if ( nuclideExistsBoolean && doesPreviousNuclideExist && ( atomProtonCount + atomNeutronCount ) > 2 ) {
              return false;
            }
            return secondParticleType ? returnNucleonCountAtRange( direction, firstParticleType, protonCount, neutronCount ) &&
                                        returnNucleonCountAtRange( direction, secondParticleType, protonCount, neutronCount ) :
                   returnNucleonCountAtRange( direction, firstParticleType, protonCount, neutronCount );
          }

        } );
    };

    // create the arrow enabled properties
    const protonUpArrowEnabledProperty = createArrowEnabledProperty( 'up', ParticleType.PROTON );
    const neutronUpArrowEnabledProperty = createArrowEnabledProperty( 'up', ParticleType.NEUTRON );
    const doubleUpArrowEnabledProperty = createArrowEnabledProperty( 'up', ParticleType.PROTON, ParticleType.NEUTRON );
    const protonDownArrowEnabledProperty = createArrowEnabledProperty( 'down', ParticleType.PROTON );
    const neutronDownArrowEnabledProperty = createArrowEnabledProperty( 'down', ParticleType.NEUTRON );
    const doubleDownArrowEnabledProperty = createArrowEnabledProperty( 'down', ParticleType.PROTON, ParticleType.NEUTRON );

    // function to create the double arrow buttons
    const createDoubleArrowButtons = ( direction: DoubleArrowButtonDirection ): DoubleArrowButton => {
      return new DoubleArrowButton( direction,
        direction === 'up' ?
        () => createIncreaseNucleonCountListener( ParticleType.PROTON, ParticleType.NEUTRON ) :
        () => createDecreaseNucleonCountListener( ParticleType.PROTON, ParticleType.NEUTRON ),
        merge( {
          leftArrowFill: BANColors.protonColorProperty,
          rightArrowFill: BANColors.neutronColorProperty,
          enabledProperty: direction === 'up' ? doubleUpArrowEnabledProperty : doubleDownArrowEnabledProperty
        }, arrowButtonOptions )
      );
    };

    // create the double arrow buttons
    const doubleArrowButtons = new VBox( {
      children: [ createDoubleArrowButtons( 'up' ), createDoubleArrowButtons( 'down' ) ],
      spacing: arrowButtonSpacing
    } );
    doubleArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    doubleArrowButtons.centerX = this.modelViewTransform.modelToViewX( model.particleAtom.positionProperty.value.x );
    this.addChild( doubleArrowButtons );

    // function to create the listeners that create or remove a particle
    const createIncreaseNucleonCountListener = ( firstNucleonType: ParticleType, secondNucleonType?: ParticleType ) => {
      this.createParticleFromStack( firstNucleonType );
      if ( secondNucleonType ) {
        this.createParticleFromStack( secondNucleonType );
      }
    };
    const createDecreaseNucleonCountListener = ( firstNucleonType: ParticleType, secondNucleonType?: ParticleType ) => {
      this.returnParticleToStack( firstNucleonType );
      if ( secondNucleonType ) {
        this.returnParticleToStack( secondNucleonType );
      }
    };

    // function to create the single arrow buttons
    const createSingleArrowButtons = ( nucleonType: ParticleType, nucleonColorProperty: ProfileColorProperty ): VBox => {
      const singleArrowButtonOptions = merge( { arrowFill: nucleonColorProperty }, arrowButtonOptions );
      const upArrowButton = new ArrowButton( 'up', () => createIncreaseNucleonCountListener( nucleonType ),
        merge( {
            enabledProperty: nucleonType === ParticleType.PROTON ? protonUpArrowEnabledProperty : neutronUpArrowEnabledProperty
          },
          singleArrowButtonOptions )
      );
      const downArrowButton = new ArrowButton( 'down', () => createDecreaseNucleonCountListener( nucleonType ),
        merge( {
            enabledProperty: nucleonType === ParticleType.PROTON ? protonDownArrowEnabledProperty : neutronDownArrowEnabledProperty
          },
          singleArrowButtonOptions )
      );
      return new VBox( {
        children: [ upArrowButton, downArrowButton ],
        spacing: arrowButtonSpacing
      } );
    };

    // create the single arrow buttons
    const protonArrowButtons = createSingleArrowButtons( ParticleType.PROTON, BANColors.protonColorProperty );
    protonArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    protonArrowButtons.right = doubleArrowButtons.left - HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS;
    this.addChild( protonArrowButtons );
    const neutronArrowButtons = createSingleArrowButtons( ParticleType.NEUTRON, BANColors.neutronColorProperty );
    neutronArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    neutronArrowButtons.left = doubleArrowButtons.right + HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS;
    this.addChild( neutronArrowButtons );

    // function to keep track of when a double arrow button was clicked
    const createSingleOrDoubleArrowButtonClickedListener = ( isDoubleArrowButton: boolean, arrowButtons: VBox ) => {
      arrowButtons.getChildren().forEach( arrowButton => {
        // @ts-ignore TODO-TS: How do you assume sub-types of children?
        arrowButton.addListener( () => {
          model.doubleArrowButtonClickedBooleanProperty.value = isDoubleArrowButton;
        } );
      } );
    };

    createSingleOrDoubleArrowButtonClickedListener( true, doubleArrowButtons );
    createSingleOrDoubleArrowButtonClickedListener( false, protonArrowButtons );
    createSingleOrDoubleArrowButtonClickedListener( false, neutronArrowButtons );

    // create and add the electron cloud
    this.electronCloud = new Circle( {
      radius: MIN_ELECTRON_CLOUD_RADIUS,
      fill: new RadialGradient( 0, 0, 0, 0, 0, MIN_ELECTRON_CLOUD_RADIUS )
        .addColorStop( 0, 'rgba( 0, 0, 255, 200 )' )
        .addColorStop( 0.9, 'rgba( 0, 0, 255, 0 )' )
    } );
    this.electronCloud.center = this.modelViewTransform.modelToViewPosition( model.particleAtom.positionProperty.value );
    this.addChild( this.electronCloud );

    // create and add the Protons and Neutrons label
    const protonsLabel = new Text( buildANucleusStrings.protons, { font: new PhetFont( 20 ) } );
    protonsLabel.bottom = doubleArrowButtons.bottom;
    protonsLabel.centerX = ( doubleArrowButtons.left - protonArrowButtons.right ) / 2 + protonArrowButtons.right;
    this.addChild( protonsLabel );

    const neutronsLabel = new Text( buildANucleusStrings.neutrons, { font: new PhetFont( 20 ) } );
    neutronsLabel.bottom = doubleArrowButtons.bottom;
    neutronsLabel.centerX = ( neutronArrowButtons.left - doubleArrowButtons.right ) / 2 + doubleArrowButtons.right;
    this.addChild( neutronsLabel );

    // create and add the NucleonCreatorNode for the protons and neutrons
    this.protonsCreatorNode = new NucleonCreatorNode( ParticleType.PROTON, this );
    this.protonsCreatorNode.top = doubleArrowButtons.top;
    this.protonsCreatorNode.centerX = protonsLabel.centerX;
    this.addChild( this.protonsCreatorNode );

    this.neutronsCreatorNode = new NucleonCreatorNode( ParticleType.NEUTRON, this );
    this.neutronsCreatorNode.top = doubleArrowButtons.top;
    this.neutronsCreatorNode.centerX = neutronsLabel.centerX;
    this.addChild( this.neutronsCreatorNode );

    BANScreenView.protonsCreatorNodeModelCenter = this.modelViewTransform.viewToModelPosition( this.protonsCreatorNode.center );
    BANScreenView.neutronsCreatorNodeModelCenter = this.modelViewTransform.viewToModelPosition( this.neutronsCreatorNode.center );

    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( this.resetAllButton );

    // called when a Particle finished being dragged
    const particleDragFinished = ( particle: Particle ) => { this.dragEndedListener( particle, this.model.particleAtom ); };

    const userControlledListener = ( isUserControlled: boolean, particle: Particle ) => {
      if ( isUserControlled && this.model.particleAtom.containsParticle( particle ) ) {
        this.model.particleAtom.removeParticle( particle );
      }
    };

    // add ParticleView's to match the model
    this.model.nucleons.addItemAddedListener( ( particle: Particle ) => {
      const particleView = new ParticleView( particle, this.modelViewTransform );

      this.particleViewMap[ particleView.particle.id ] = particleView;
      this.addParticleView( particle, particleView );

      // @ts-ignore TODO-TS: Fix listener type
      particle.dragEndedEmitter.addListener( particleDragFinished );

      // TODO: unlink userControlledListener
      particle.userControlledProperty.link( isUserControlled => userControlledListener( isUserControlled, particle ) );
    } );

    // remove ParticleView's to match the model
    this.model.nucleons.addItemRemovedListener( ( particle: Particle ) => {
      const particleView = this.findParticleView( particle );

      // @ts-ignore TODO-TS: Fix listener type
      particle.dragEndedEmitter.removeListener( particleDragFinished );

      delete this.particleViewMap[ particleView.particle.id ];

      particleView.dispose();
      particle.dispose();
    } );

    Property.multilink( [ this.model.particleAtom.protonCountProperty, this.model.incomingProtons.lengthProperty ], ( protonCount, incomingProtonsCount ) => {

      // hide the protonsCreatorNode when at the last proton
      if ( ( protonCount + incomingProtonsCount ) === this.model.protonCountRange.max ) {
        this.checkCreatorNodeVisibility( this.protonsCreatorNode, false );
      }
    } );

    Property.multilink( [ this.model.particleAtom.neutronCountProperty, this.model.incomingNeutrons.lengthProperty ], ( neutronCount, incomingNeutronsCount ) => {

      // hide the neutronsCreatorNode when at the last neutron
      if ( ( neutronCount + incomingNeutronsCount ) === this.model.neutronCountRange.max ) {
        this.checkCreatorNodeVisibility( this.neutronsCreatorNode, false );
      }
    } );
  }

  /**
   * Set the input enabled and visibility of a creator node.
   */
  protected checkCreatorNodeVisibility( creatorNode: Node, visible: boolean ): void {
    if ( creatorNode.visible !== visible ) {
      creatorNode.visible = visible;
      creatorNode.inputEnabled = visible;
    }
  }

  /**
   * Create a particle of particleType at its creator node and send it (and add it) to the particleAtom.
   */
  public createParticleFromStack( particleType: ParticleType ): void {

    // create a particle at the center of its creator node
    const particle = new Particle( particleType.name.toLowerCase(), {
      maxZLayer: DecayScreenView.NUM_NUCLEON_LAYERS - 1
    } );
    particle.animationVelocityProperty.value = BANConstants.PARTICLE_ANIMATION_SPEED;
    const origin = particleType === ParticleType.PROTON ?
                   BANScreenView.protonsCreatorNodeModelCenter : BANScreenView.neutronsCreatorNodeModelCenter;
    particle.setPositionAndDestination( origin );

    // send the particle the center of the particleAtom and add it to the model
    particle.destinationProperty.value = this.model.particleAtom.positionProperty.value;
    this.model.addParticle( particle );

    // don't let the particle be clicked until it reaches the particleAtom
    const particleView = this.findParticleView( particle );
    particleView.inputEnabled = false;

    if ( particleType === ParticleType.PROTON ) {
      this.model.incomingProtons.push( particle );
    }
    else {
      this.model.incomingNeutrons.push( particle );
    }

    // add the particle to the particleAtom once it reaches the center of the particleAtom and allow it to be clicked
    particle.animationEndedEmitter.addListener( () => {
      if ( !this.model.particleAtom.containsParticle( particle ) ) {
        this.model.particleAtom.addParticle( particle );
        particleView.inputEnabled = true;

        if ( particleType === ParticleType.PROTON ) {
          arrayRemove( this.model.incomingProtons, particle );
        }
        else {
          arrayRemove( this.model.incomingNeutrons, particle );
        }

        particle.animationEndedEmitter.removeAllListeners();
      }
    } );
  }

  /**
   * Remove a particle of particleType from the particleAtom and send it back to its creator node.
   */
  public returnParticleToStack( particleType: ParticleType ): void {
    const creatorNodePosition = particleType === ParticleType.PROTON ?
                                BANScreenView.protonsCreatorNodeModelCenter : BANScreenView.neutronsCreatorNodeModelCenter;
    const particles = [ ...this.model.nucleons ];

    // array of all of the particles that are of particleType and part of the particleAtom
    _.remove( particles, particle => {
      return !this.model.particleAtom.containsParticle( particle ) || particle.type !== particleType.name.toLowerCase();
    } );

    // select the particle closest to its creator node
    const sortedParticles = _.sortBy( particles, particle => {
      return particle!.positionProperty.value.distance( creatorNodePosition );
    } );
    const particleToReturn = sortedParticles.shift();

    if ( particleToReturn ) {

      // remove the particle from the particleAtom and send it back to its creator node position
      assert && assert( this.model.particleAtom.containsParticle( particleToReturn ),
        'There is no particle of this type in the atom.' );
      this.model.particleAtom.removeParticle( particleToReturn );
      this.animateAndRemoveNucleon( particleToReturn, creatorNodePosition );
    }
  }

  /**
   * Animate particle to the given destination and then remove it.
   */
  public animateAndRemoveNucleon( particle: Particle, destination: Vector2 ): void {
    const particleView = this.findParticleView( particle );
    particleView.inputEnabled = false;

    particle.destinationProperty.value = destination;

    particle.animationEndedEmitter.addListener( () => {
      this.model.removeParticle( particle );

      // make the creator node visible when removing the last nucleon from the particle atom
      this.checkCreatorNodeVisibility( particle.type === ParticleType.PROTON.name.toLowerCase() ?
                                       this.protonsCreatorNode : this.neutronsCreatorNode, true );
    } );
  }

  /**
   * Add a particle to the model and immediately start dragging it with the provided event.
   */
  public addAndDragParticle( event: PressListenerEvent, particle: Particle ): void {
    this.model.addParticle( particle );
    const particleView = this.findParticleView( particle );
    particleView.startSyntheticDrag( event );
  }

  public reset(): void {
    //TODO
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public override step( dt: number ): void {
    const protonCount = this.model.particleAtom.protonCountProperty.value;
    const neutronCount = this.model.particleAtom.neutronCountProperty.value;

    if ( !this.model.doesNuclideExistBooleanProperty.value && ( protonCount + neutronCount ) > 0 ) {
      this.timeSinceCountdownStarted += dt;
    }
    else {
      this.timeSinceCountdownStarted = 0;

      // keep track of the old values of protonCountProperty and neutronCountProperty to know which value increased
      this.previousProtonCount = protonCount;
      this.previousNeutronCount = neutronCount;
    }

    // show the nuclide that does not exist for one second, then return the necessary particles
    if ( this.timeSinceCountdownStarted >= 1 ) {
      this.timeSinceCountdownStarted = 0;

      // TODO: change this because it is a bit hacky, uses a boolean property to keep track of if a double arrow button
      //  was clicked
      // a proton and neutron were added to create a nuclide that does not exist, so return a proton and neutron
      if ( this.model.doubleArrowButtonClickedBooleanProperty.value &&
           AtomIdentifier.doesPreviousNuclideExist( protonCount, neutronCount ) ) {
        this.returnParticleToStack( ParticleType.NEUTRON );
        this.returnParticleToStack( ParticleType.PROTON );
      }

      // the neutronCount increased to create a nuclide that does not exist, so return a neutron to the stack
      else if ( this.previousNeutronCount < neutronCount &&
                AtomIdentifier.doesPreviousIsotopeExist( protonCount, neutronCount ) ) {
        this.returnParticleToStack( ParticleType.NEUTRON );
      }

      // the protonCount increased to create a nuclide that does not exist, so return a proton to the stack
      else if ( this.previousProtonCount < protonCount &&
                AtomIdentifier.doesPreviousIsotoneExist( protonCount, neutronCount ) ) {
        this.returnParticleToStack( ParticleType.PROTON );
      }
    }
  }

  /**
   * Given a Particle, find our current display (ParticleView) of it.
   */
  public findParticleView( particle: Particle ): ParticleView {
    const particleView = this.particleViewMap[ particle.id ];
    assert && assert( particleView, 'Did not find matching ParticleView' );
    return particleView;
  }

  protected dragEndedListener( particle: Particle, particleAtom: ParticleAtom ): void {}

  protected addParticleView( particle: Particle, particleView: ParticleView ): void {}
}

buildANucleus.register( 'BANScreenView', BANScreenView );
export default BANScreenView;
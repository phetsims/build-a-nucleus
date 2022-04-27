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
import { PressListenerEvent, ProfileColorProperty, VBox, Circle, RadialGradient, Text, Node } from '../../../../scenery/js/imports.js';
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
import DecayScreenView from '../../decay/view/DecayScreenView.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';


// empirically determined, from the ElectronCloudView radius
const MIN_ELECTRON_CLOUD_RADIUS = 42.5;
const MAX_ELECTRON_CLOUD_RADIUS = 130;
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
  static readonly MAX_ELECTRON_CLOUD_RADIUS: number = MAX_ELECTRON_CLOUD_RADIUS;
  static readonly MIN_ELECTRON_CLOUD_RADIUS: number = MIN_ELECTRON_CLOUD_RADIUS;

  protected constructor( model: M, providedOptions?: BANScreenViewOptions ) {

    const options = optionize<BANScreenViewOptions, {}, ScreenViewOptions>()( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

    this.model = model;

    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      new Vector2( 335, 339 ), // the center of the atom node
      1.0 );

    // ParticleView.id => {ParticleView} - lookup map for efficiency
    this.particleViewMap = {};

    // where the ParticleView's are
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

    // function to create the arrow enabled properties
    const createArrowEnabledProperty = ( direction: string, firstParticleType: ParticleType, secondParticleType?: ParticleType ) => {
      return new DerivedProperty( [ model.doesNuclideExistBooleanProperty, model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty ],
        ( doesNuclideExist, protonCount, neutronCount ) => {
          const nextIsoExists = secondParticleType ?
                                !getNextOrPreviousIso( direction, firstParticleType, protonCount, neutronCount ) ||
                                !getNextOrPreviousIso( direction, secondParticleType, protonCount, neutronCount ) :
                                !getNextOrPreviousIso( direction, firstParticleType, protonCount, neutronCount );
          const nuclideExistsBoolean = direction === 'up' ? !doesNuclideExist : doesNuclideExist;
          if ( nuclideExistsBoolean && nextIsoExists ) {
            return false;
          }
          return secondParticleType ? returnNucleonCountAtRange( direction, firstParticleType, protonCount, neutronCount ) &&
                                      returnNucleonCountAtRange( direction, secondParticleType, protonCount, neutronCount ) :
                 returnNucleonCountAtRange( direction, firstParticleType, protonCount, neutronCount );
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

    // function to create the listeners the increase or decrease the given nucleon count properties by a value of +1 or -1
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
    } );

    // add the particleViewLayerNode
    this.addChild( this.particleViewLayerNode );
  }

  private createParticleFromStack( particleType: ParticleType ) {
    const particle = new Particle( particleType.name.toLowerCase(), {
      maxZLayer: DecayScreenView.NUM_NUCLEON_LAYERS - 1
    } );
    const origin = particleType === ParticleType.PROTON ? this.protonsCreatorNode.center : this.neutronsCreatorNode.center;
    particle.setPositionAndDestination( this.modelViewTransform.viewToModelPosition( origin ) );
    particle.destinationProperty.value = this.model.particleAtom.positionProperty.value;
    this.model.addParticle( particle );
    particle.animationEndedEmitter.addListener( () => {
      if ( !this.model.particleAtom.containsParticle( particle ) ) {
        this.model.particleAtom.addParticle( particle );
        particle.animationEndedEmitter.removeAllListeners();
      }
    } );
  }

  private returnParticleToStack( particleType: ParticleType ) {

    const creatorNodePosition = particleType === ParticleType.PROTON ?
                                this.protonsCreatorNode.center : this.neutronsCreatorNode.center;

    // array of all the particles of particleType
    const particles = [ ...this.model.nucleons ];

    _.remove( particles, particle => {
      return particle.destinationProperty.value.equals( this.modelViewTransform.viewToModelPosition( creatorNodePosition ) )
             || particle.type !== particleType.name.toLowerCase();
    } );

    const sortedParticles = _.sortBy( particles, particle => {
      return particle!.positionProperty.value.distance( creatorNodePosition );
    } );

    const particleToReturn = sortedParticles.shift();
    assert && assert( particleToReturn, 'There is no particle of this type in the atom.' );
    if ( particleToReturn ) {
      this.model.particleAtom.removeParticle( particleToReturn );
      this.animateAndRemoveNucleon( particleToReturn, this.modelViewTransform.viewToModelPosition( creatorNodePosition ) );
    }
  }

  /**
   * Add a particle to the model and immediately start dragging it with the provided event.
   */
  public addAndDragParticle( event: PressListenerEvent, particle: Particle ) {
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
    //TODO
  }

  /**
   * Given a Particle, find our current display (ParticleView) of it.
   */
  public findParticleView( particle: Particle ): ParticleView {
    const particleView = this.particleViewMap[ particle.id ];
    assert && assert( particleView, 'Did not find matching ParticleView' );
    return particleView;
  }

  /**
   * Animate particle to the given destination and then remove it.
   */
  public animateAndRemoveNucleon( particle: Particle, destination: Vector2 ) {
    particle.destinationProperty.value = destination;

    particle.animationEndedEmitter.addListener( () => {
      this.model.removeParticle( particle );
    } );
  }

  protected dragEndedListener( particle: Particle, particleAtom: ParticleAtom ) {}

  protected addParticleView( particle: Particle, particleView: ParticleView ) {}
}

buildANucleus.register( 'BANScreenView', BANScreenView );
export default BANScreenView;
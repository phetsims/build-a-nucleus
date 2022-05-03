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
  public static protonsCreatorNodeModelCenter: Vector2;
  public static neutronsCreatorNodeModelCenter: Vector2;

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

    // function to create the arrow enabled properties
    const createArrowEnabledProperty = ( direction: string, firstParticleType: ParticleType, secondParticleType?: ParticleType ) => {
      return new DerivedProperty( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty,
          model.incomingProtons.lengthProperty, model.incomingNeutrons.lengthProperty ],
        ( atomProtonCount, atomNeutronCount, incomingProtonsCount, incomingNeutronsCount ) => {

          const protonCount = atomProtonCount + incomingProtonsCount;
          const neutronCount = atomNeutronCount + incomingNeutronsCount;

          // disable all arrow buttons if the nuclide does not exist
          if ( !AtomIdentifier.doesExist( protonCount, neutronCount ) && model.massNumberProperty.value !== 0 ) {
            return false;
          }

          else {

            const nextOrPreviousIsoExists = secondParticleType ?
                                  !getNextOrPreviousIso( direction, firstParticleType, protonCount, neutronCount ) ||
                                  !getNextOrPreviousIso( direction, secondParticleType, protonCount, neutronCount ) :
                                  !getNextOrPreviousIso( direction, firstParticleType, protonCount, neutronCount );

            const doesNuclideExist = AtomIdentifier.doesExist( protonCount, neutronCount );
            const nuclideExistsBoolean = direction === 'up' ? !doesNuclideExist : doesNuclideExist;

            const doesPreviousNuclideExist = secondParticleType && direction === 'down' ? !AtomIdentifier.doesPreviousNuclideExist( protonCount, neutronCount ) : nextOrPreviousIsoExists;

            // it is allowed to go back the default starting case of zero protons and zero neutrons even though a nuclide
            // with zero protons and zero neutrons does not exist
            if ( nuclideExistsBoolean && doesPreviousNuclideExist && ( atomProtonCount + atomNeutronCount ) > 1 ) {
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
      this.model.createParticleFromStack( firstNucleonType );
      if ( secondNucleonType ) {
        this.model.createParticleFromStack( secondNucleonType );
      }
    };
    const createDecreaseNucleonCountListener = ( firstNucleonType: ParticleType, secondNucleonType?: ParticleType ) => {
      this.model.returnParticleToStack( firstNucleonType );
      if ( secondNucleonType ) {
        this.model.returnParticleToStack( secondNucleonType );
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
        // @ts-ignore TODO-TS: addListener isn't a  method on Node's, only on ArrowButton's
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
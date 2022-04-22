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
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
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


// empirically determined, from the ElectronCloudView radius
const MIN_ELECTRON_CLOUD_RADIUS = 42.5;
const MAX_ELECTRON_CLOUD_RADIUS = 130;
// types
export type BANScreenViewOptions = ScreenViewOptions & PickRequired<ScreenViewOptions, 'tandem'>;
export type ParticleViewMap = {
  [ key: number ]: ParticleView;
};

// constants
const HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS = 150;

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

    this.nucleonCountPanel = new NucleonCountPanel( model.protonCountProperty, model.neutronCountProperty );
    this.nucleonCountPanel.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.nucleonCountPanel.left = this.layoutBounds.maxX - 200;
    this.addChild( this.nucleonCountPanel );

    const arrowButtonSpacing = 7; // spacing between the 'up' arrow buttons and 'down' arrow buttons
    const arrowButtonOptions = {
      arrowWidth: 14,
      arrowHeight: 14
    };

    // function to create the double arrow buttons
    const createDoubleArrowButtons = ( direction: DoubleArrowButtonDirection ): DoubleArrowButton => {
      return new DoubleArrowButton( direction,
        direction === 'up' ?
        () => createIncreaseNucleonCountListener( model.protonCountProperty, model.neutronCountProperty ) :
        () => createDecreaseNucleonCountListener( model.protonCountProperty, model.neutronCountProperty ),
        merge( {
          leftArrowFill: BANColors.protonColorProperty,
          rightArrowFill: BANColors.neutronColorProperty
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
    const createIncreaseNucleonCountListener = ( firstNucleonCountProperty: NumberProperty, secondNucleonCountProperty?: NumberProperty ) => {
      firstNucleonCountProperty.value = Math.min( firstNucleonCountProperty.range!.max, firstNucleonCountProperty.value + 1 );
      if ( secondNucleonCountProperty ) {
        secondNucleonCountProperty.value = Math.min( secondNucleonCountProperty.range!.max, secondNucleonCountProperty.value + 1 );
      }
    };
    const createDecreaseNucleonCountListener = ( firstNucleonCountProperty: NumberProperty, secondNucleonCountProperty?: NumberProperty ) => {
      firstNucleonCountProperty.value = Math.max( firstNucleonCountProperty.range!.min, firstNucleonCountProperty.value - 1 );
      if ( secondNucleonCountProperty ) {
        secondNucleonCountProperty.value = Math.max( secondNucleonCountProperty.range!.min, secondNucleonCountProperty.value - 1 );
      }
    };

    // function to create the single arrow buttons
    const createSingleArrowButtons = ( nucleonCountProperty: NumberProperty, nucleonColorProperty: ProfileColorProperty ): VBox => {
      const singleArrowButtonOptions = merge( { arrowFill: nucleonColorProperty }, arrowButtonOptions );
      const upArrowButton = new ArrowButton( 'up', () => createIncreaseNucleonCountListener( nucleonCountProperty ),
        singleArrowButtonOptions );
      const downArrowButton = new ArrowButton( 'down', () => createDecreaseNucleonCountListener( nucleonCountProperty ),
        singleArrowButtonOptions );
      return new VBox( {
        children: [ upArrowButton, downArrowButton ],
        spacing: arrowButtonSpacing
      } );
    };

    // create the single arrow buttons
    const protonArrowButtons = createSingleArrowButtons( model.protonCountProperty, BANColors.protonColorProperty );
    protonArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    protonArrowButtons.right = doubleArrowButtons.left - HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS;
    this.addChild( protonArrowButtons );
    const neutronArrowButtons = createSingleArrowButtons( model.neutronCountProperty, BANColors.neutronColorProperty );
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

    // function to create observers that disable the single arrow buttons when the nucleonCountProperty values are at its min
    // or max range
    const nucleonCountPropertyObserver = ( nucleonCount: number, nucleonArrowButtons: VBox, nucleonCountProperty: NumberProperty ) => {

      // up arrow button
      nucleonArrowButtons.getChildAt( 0 ).enabled = nucleonCount !== nucleonCountProperty.range!.max;

      // down arrow button
      nucleonArrowButtons.getChildAt( 1 ).enabled = nucleonCount !== nucleonCountProperty.range!.min;
    };

    // create the observers to disable the arrow buttons, see the comment on the observer above
    model.protonCountProperty.link( protonCount => {
      nucleonCountPropertyObserver( protonCount, protonArrowButtons, model.protonCountProperty );
    } );
    model.neutronCountProperty.link( neutronCount => {
      nucleonCountPropertyObserver( neutronCount, neutronArrowButtons, model.neutronCountProperty );
    } );

    // function to prevent a user from creating nuclides that do not exist on the chart
    Property.multilink( [ model.protonCountProperty, model.neutronCountProperty ], ( protonCount, neutronCount ) => {

      // observers that disable the double arrow buttons when the protonCountProperty and the neutronCountProperty are at
      // its max or min range
      doubleArrowButtons.getChildAt( 0 ).enabled = protonCount !== model.protonCountProperty.range!.max &&
                                                   neutronCount !== model.neutronCountProperty.range!.max;
      doubleArrowButtons.getChildAt( 1 ).enabled = protonCount !== model.protonCountProperty.range!.min &&
                                                   neutronCount !== model.neutronCountProperty.range!.min;

      // if on a nuclide that does not exist, check if there are nuclides ahead (next isotones, or isotopes)
      if ( !model.doesNuclideExistBooleanProperty.value ) {

        // TODO: disable all buttons once the nucleons are added
        const nextIsotope = AtomIdentifier.getNextExistingIsotope( protonCount, neutronCount );
        const nextIsotone = AtomIdentifier.getNextExistingIsotone( protonCount, neutronCount );

        // if the nextIsotone does not exist, disable the proton up arrow
        if ( !nextIsotone ) {
          protonArrowButtons.getChildAt( 0 ).enabled = false;
          doubleArrowButtons.getChildAt( 0 ).enabled = false;
        }

        // if the nextIsotope does not exist, disable the neutron up arrow
        if ( !nextIsotope ) {
          neutronArrowButtons.getChildAt( 0 ).enabled = false;
          doubleArrowButtons.getChildAt( 0 ).enabled = false;
        }
      }
      else {

        // re-enable the up arrow buttons on the nucleons
        protonArrowButtons.getChildAt( 0 ).enabled = protonCount !== model.protonCountProperty.range!.max;
        neutronArrowButtons.getChildAt( 0 ).enabled = neutronCount !== model.neutronCountProperty.range!.max;

        // If removing a neutron forms an isotope that does not exist, then disable the neutron down arrow button
        if ( AtomIdentifier.doesPreviousIsotopeExist( protonCount, neutronCount ) ) {
          // re-enable the neutron down arrow button
          neutronArrowButtons.getChildAt( 1 ).enabled = neutronCount !== model.neutronCountProperty.range!.min;
        }
        else {
          neutronArrowButtons.getChildAt( 1 ).enabled = false;
        }

        // If removing a proton forms an isotope that does not exist, then disable the proton down arrow button
        if ( AtomIdentifier.doesPreviousIsotoneExist( protonCount, neutronCount ) ) {
          // re-enable the proton down arrow button
          protonArrowButtons.getChildAt( 1 ).enabled = protonCount !== model.protonCountProperty.range!.min;
        }
        else {
          protonArrowButtons.getChildAt( 1 ).enabled = false;
        }
      }
    } );

    // called when a Particle finished being dragged
    const particleDragFinished = ( particle: Particle ) => { this.dragEndedListener( particle, this.model.particleAtom ); };

    // add ParticleView's to match the model
    this.model.nucleons.addItemAddedListener( ( particle: Particle ) => {
      const particleView = new ParticleView( particle, this.modelViewTransform );

      this.particleViewMap[ particleView.particle.id ] = particleView;
      this.addParticleView( particle, particleView );

      // @ts-ignore TODO-TS: Fix listener type
      particle.dragEndedEmitter.addListener( particleDragFinished );
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

  protected dragEndedListener( particle: Particle, particleAtom: ParticleAtom ) {}

  protected addParticleView( particle: Particle, particleView: ParticleView ) {}
}

buildANucleus.register( 'BANScreenView', BANScreenView );
export default BANScreenView;
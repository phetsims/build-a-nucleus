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
import { Circle, Color, Node, PressListenerEvent, ProfileColorProperty, RadialGradient, Text, VBox } from '../../../../scenery/js/imports.js';
import BANColors from '../BANColors.js';
import NucleonCountPanel from './NucleonCountPanel.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import DoubleArrowButton, { DoubleArrowButtonDirection } from './DoubleArrowButton.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import NucleonCreatorNode from './NucleonCreatorNode.js';
import ParticleType from './ParticleType.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import AtomNode from '../../../../shred/js/view/AtomNode.js';
import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import BANQueryParameters from '../BANQueryParameters.js';

// empirically determined, from the ElectronCloudView radius
const MIN_ELECTRON_CLOUD_RADIUS = 42.5;

const TOUCH_AREA_Y_DILATION = 3;
const NUMBER_OF_NUCLEON_LAYERS = 22; // This is based on max number of particles, may need adjustment if that changes.

// types
type SelfOptions = {
  particleViewMVT?: ModelViewTransform2;
};
export type BANScreenViewOptions = SelfOptions & WithRequired<ScreenViewOptions, 'tandem'>;
export type ParticleViewMap = Record<number, ParticleView>;

type ParticleTypeInfo = {
  maxCount: number;
  creatorNode: Node;
  numberOfNucleons: number;
  outgoingNucleons: number;
};

// constants
const HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS = 160;

abstract class BANScreenView<M extends BANModel> extends ScreenView {

  public static readonly NUMBER_OF_NUCLEON_LAYERS = NUMBER_OF_NUCLEON_LAYERS;

  protected model: M;
  private timeSinceCountdownStarted: number;
  private previousProtonCount: number;
  private previousNeutronCount: number;
  public modelViewTransform: ModelViewTransform2;
  public readonly resetAllButton: Node;
  public readonly nucleonCountPanel: Node;
  protected readonly electronCloud: Circle;

  protected readonly atomNode: Node;

  // layers where nucleons exist
  protected readonly nucleonLayers: Node[];

  // ParticleView.id => {ParticleView} - lookup map for efficiency
  private readonly particleViewMap: ParticleViewMap;

  // where the ParticleView's are
  protected readonly particleViewLayerNode: Node;

  // the NucleonCreatorNode for the protons and neutrons
  protected readonly protonsCreatorNode: Node;
  protected readonly neutronsCreatorNode: Node;

  public protonsCreatorNodeModelCenter: Vector2;
  public neutronsCreatorNodeModelCenter: Vector2;

  protected readonly doubleArrowButtons: Node;
  protected readonly protonArrowButtons: Node;
  protected readonly neutronArrowButtons: Node;
  protected readonly emptyAtomCircle: Node;
  protected readonly elementName: Text;
  private readonly particleViewMVT: ModelViewTransform2;

  protected constructor( model: M, modelViewTransform: ModelViewTransform2, providedOptions?: BANScreenViewOptions ) {

    const options = optionize<BANScreenViewOptions, SelfOptions, ScreenViewOptions>()( {

      particleViewMVT: modelViewTransform,

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

    this.particleViewMVT = options.particleViewMVT;
    this.model = model;
    this.timeSinceCountdownStarted = 0;
    this.previousProtonCount = 0;
    this.previousNeutronCount = 0;

    this.modelViewTransform = modelViewTransform;

    this.particleViewMap = {};

    // this is added at the end of subclasses for the correct z order
    this.particleViewLayerNode = new Node();

    this.nucleonCountPanel = new NucleonCountPanel( model.particleAtom.protonCountProperty, model.protonCountRange,
      model.particleAtom.neutronCountProperty, model.neutronCountRange );
    this.nucleonCountPanel.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( this.nucleonCountPanel );

    // Create the textual readout for the element name.
    this.elementName = new Text( '', {
      font: BANConstants.REGULAR_FONT,
      fill: Color.RED,
      maxWidth: BANConstants.ELEMENT_NAME_MAX_WIDTH
    } );
    this.addChild( this.elementName );

    const arrowButtonSpacing = 7; // spacing between the 'up' arrow buttons and 'down' arrow buttons
    const arrowButtonOptions = {
      arrowWidth: 14,
      arrowHeight: 14,
      fireOnHold: false
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

    // function returns whether the protonCount or neutronCount is at its min or max range
    const isNucleonCountAtRangeBounds = ( direction: string, particleType: ParticleType, protonCount: number, neutronCount: number ) => {
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

    // enable or disable the creator node and adjust the opacity accordingly
    const creatorNodeEnabled = ( creatorNode: Node, enable: boolean ) => {
      if ( creatorNode ) {
        creatorNode.inputEnabled = enable;
        creatorNode.opacity = enable ? 1 : 0.5;
      }
    };

    // function to create the arrow enabled properties
    const createArrowEnabledProperty = ( direction: string, firstParticleType: ParticleType, secondParticleType?: ParticleType ) => {
      return new DerivedProperty( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty,
          model.incomingProtons.lengthProperty, model.incomingNeutrons.lengthProperty, model.userControlledProtons.lengthProperty,
          model.userControlledNeutrons.lengthProperty ],
        ( atomProtonCount, atomNeutronCount, incomingProtonsCount, incomingNeutronsCount,
          userControlledProtonCount, userControlledNeutronCount ) => {

          const protonCount = atomProtonCount + incomingProtonsCount + userControlledProtonCount;
          const neutronCount = atomNeutronCount + incomingNeutronsCount + userControlledNeutronCount;
          const userControlledNucleonCount = userControlledNeutronCount + userControlledProtonCount;

          // disable all arrow buttons if the nuclide does not exist
          if ( !AtomIdentifier.doesExist( protonCount, neutronCount ) && ( model.particleAtom.massNumberProperty.value !== 0 || userControlledNucleonCount !== 0 ) ) {
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

            const doesPreviousNuclideExist = secondParticleType && direction === 'down' ?
                                             !AtomIdentifier.doesPreviousNuclideExist( protonCount, neutronCount ) :
                                             nextOrPreviousIsoExists;

            if ( nuclideExistsBoolean && doesPreviousNuclideExist ) {
              return false;
            }
            return secondParticleType ? isNucleonCountAtRangeBounds( direction, firstParticleType, protonCount, neutronCount ) &&
                                        isNucleonCountAtRangeBounds( direction, secondParticleType, protonCount, neutronCount ) :
                   isNucleonCountAtRangeBounds( direction, firstParticleType, protonCount, neutronCount );
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
    const createDoubleArrowButtons = ( direction: DoubleArrowButtonDirection ): Node => {
      return new DoubleArrowButton( direction,
        direction === 'up' ?
        () => increaseNucleonCountListener( ParticleType.PROTON, ParticleType.NEUTRON ) :
        () => decreaseNucleonCountListener( ParticleType.PROTON, ParticleType.NEUTRON ),
        merge( {
          leftArrowFill: BANColors.protonColorProperty,
          rightArrowFill: BANColors.neutronColorProperty,
          enabledProperty: direction === 'up' ? doubleUpArrowEnabledProperty : doubleDownArrowEnabledProperty,
          touchAreaYDilation: TOUCH_AREA_Y_DILATION
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

    // functions to create the listeners that create or remove a particle
    const increaseNucleonCountListener = ( firstNucleonType: ParticleType, secondNucleonType?: ParticleType ) => {
      this.createParticleFromStack( firstNucleonType );
      if ( secondNucleonType ) {
        this.createParticleFromStack( secondNucleonType );
      }
    };
    const decreaseNucleonCountListener = ( firstNucleonType: ParticleType, secondNucleonType?: ParticleType ) => {
      this.returnParticleToStack( firstNucleonType );
      if ( secondNucleonType ) {
        this.returnParticleToStack( secondNucleonType );
      }
    };

    // function to create the single arrow buttons
    const createSingleArrowButtons = ( nucleonType: ParticleType, nucleonColorProperty: ProfileColorProperty ): Node => {
      const singleArrowButtonOptions = merge( { arrowFill: nucleonColorProperty }, arrowButtonOptions );
      const upArrowButton = new ArrowButton( 'up', () => increaseNucleonCountListener( nucleonType ),
        merge( {
            enabledProperty: nucleonType === ParticleType.PROTON ? protonUpArrowEnabledProperty : neutronUpArrowEnabledProperty,
            touchAreaYDilation: TOUCH_AREA_Y_DILATION
          },
          singleArrowButtonOptions )
      );
      const downArrowButton = new ArrowButton( 'down', () => decreaseNucleonCountListener( nucleonType ),
        merge( {
            enabledProperty: nucleonType === ParticleType.PROTON ? protonDownArrowEnabledProperty : neutronDownArrowEnabledProperty,
            touchAreaYDilation: TOUCH_AREA_Y_DILATION
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
    const createSingleOrDoubleArrowButtonClickedListener = ( isDoubleArrowButton: boolean, arrowButtons: Node ) => {
      const arrowButtonsChildren = arrowButtons.getChildren() as ArrowButton[];
      arrowButtonsChildren.forEach( arrowButton => {
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

    const nucleonLabelTextOptions = { font: new PhetFont( 20 ), maxWidth: 150 };

    // create and add the Protons and Neutrons label
    const protonsLabel = new Text( BuildANucleusStrings.protons, nucleonLabelTextOptions );
    protonsLabel.bottom = doubleArrowButtons.bottom;
    protonsLabel.centerX = ( doubleArrowButtons.left - protonArrowButtons.right ) / 2 + protonArrowButtons.right;
    this.addChild( protonsLabel );

    const neutronsLabel = new Text( BuildANucleusStrings.neutronsUppercase, nucleonLabelTextOptions );
    neutronsLabel.bottom = doubleArrowButtons.bottom;
    neutronsLabel.centerX = ( neutronArrowButtons.left - doubleArrowButtons.right ) / 2 + doubleArrowButtons.right;
    this.addChild( neutronsLabel );

    // create and add the NucleonCreatorNode for the protons
    this.protonsCreatorNode = new NucleonCreatorNode( ParticleType.PROTON, this, options.particleViewMVT );
    this.protonsCreatorNode.top = doubleArrowButtons.top;
    this.protonsCreatorNode.centerX = protonsLabel.centerX;
    this.addChild( this.protonsCreatorNode );

    // create and add the NucleonCreatorNode for the neutrons
    this.neutronsCreatorNode = new NucleonCreatorNode( ParticleType.NEUTRON, this, options.particleViewMVT );
    this.neutronsCreatorNode.top = doubleArrowButtons.top;
    this.neutronsCreatorNode.centerX = neutronsLabel.centerX;
    this.addChild( this.neutronsCreatorNode );

    this.protonsCreatorNodeModelCenter = this.modelViewTransform.viewToModelPosition( this.protonsCreatorNode.center );
    this.neutronsCreatorNodeModelCenter = this.modelViewTransform.viewToModelPosition( this.neutronsCreatorNode.center );

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

    const userControlledListener = ( isUserControlled: boolean, particle: Particle ) => {
      if ( isUserControlled && this.model.particleAtom.containsParticle( particle ) ) {
        this.model.particleAtom.removeParticle( particle );
      }

      if ( isUserControlled && particle.type === ParticleType.PROTON.name.toLowerCase() && !this.model.userControlledProtons.includes( particle ) ) {
        this.model.userControlledProtons.add( particle );
      }
      else if ( !isUserControlled && particle.type === ParticleType.PROTON.name.toLowerCase() && this.model.userControlledProtons.includes( particle ) ) {
        this.model.userControlledProtons.remove( particle );
      }
      else if ( isUserControlled && particle.type === ParticleType.NEUTRON.name.toLowerCase() && !this.model.userControlledNeutrons.includes( particle ) ) {
        this.model.userControlledNeutrons.add( particle );
      }
      else if ( !isUserControlled && particle.type === ParticleType.NEUTRON.name.toLowerCase() && this.model.userControlledNeutrons.includes( particle ) ) {
        this.model.userControlledNeutrons.remove( particle );
      }
    };

    // convert string particle type to a ParticleType
    const getParticleTypeFromStringType = ( particleTypeString: string ) => {
      const particleType = particleTypeString === ParticleType.PROTON.name.toLowerCase() ? ParticleType.PROTON :
                           particleTypeString === ParticleType.NEUTRON.name.toLowerCase() ? ParticleType.NEUTRON :
                           particleTypeString === ParticleType.ELECTRON.name.toLowerCase() ? ParticleType.ELECTRON :
                           particleTypeString === ParticleType.POSITRON.name.toLowerCase() ? ParticleType.POSITRON :
                           null;
      assert && assert( particleType !== null, `Particle type ${particleTypeString} is not a valid particle type.` );
      return particleType;
    };

    // add ParticleView's to match the model
    this.model.particles.addItemAddedListener( ( particle: Particle ) => {
      const particleView = new ParticleView( particle, options.particleViewMVT );

      this.particleViewMap[ particleView.particle.id ] = particleView;
      this.addParticleView( particle, particleView );
      const particleType = getParticleTypeFromStringType( particle.type );

      if ( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ) {

        // called when a nucleon is finished being dragged
        particle.dragEndedEmitter.addListener( () => { this.dragEndedListener( particle, this.model.particleAtom ); } );
        this.checkIfCreatorNodeShouldBeInvisible( particleType );
      }

      // TODO: unlink userControlledListener
      particle.userControlledProperty.link( isUserControlled => userControlledListener( isUserControlled, particle ) );
    } );

    // remove ParticleView's to match the model
    this.model.particles.addItemRemovedListener( ( particle: Particle ) => {
      const particleView = this.findParticleView( particle );

      particle.dragEndedEmitter.dispose();
      particle.animationEndedEmitter.dispose();

      delete this.particleViewMap[ particleView.particle.id ];

      particleView.dispose();
      particle.dispose();

      const particleType = getParticleTypeFromStringType( particle.type );

      if ( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ) {
        this.checkIfCreatorNodeShouldBeVisible( particleType );
      }
    } );


    // create and add the dashed empty circle at the center
    const lineWidth = 1;
    this.emptyAtomCircle = new Circle( {
      radius: ShredConstants.NUCLEON_RADIUS - lineWidth,
      stroke: Color.GRAY,
      lineDash: [ 2, 2 ],
      lineWidth: lineWidth
    } );
    this.emptyAtomCircle.center = this.modelViewTransform.modelToViewPosition( model.particleAtom.positionProperty.value );
    this.addChild( this.emptyAtomCircle );

    // create and add the AtomNode
    this.atomNode = new AtomNode( model.particleAtom, this.modelViewTransform, {
      showCenterX: false,
      showElementNameProperty: new Property( false ),
      showNeutralOrIonProperty: new Property( false ),
      showStableOrUnstableProperty: new Property( false ),
      electronShellDepictionProperty: new Property( 'cloud' )
    } );
    this.atomNode.center = this.emptyAtomCircle.center;
    this.addChild( this.atomNode );

    // Add the nucleonLayers
    this.nucleonLayers = [];
    _.times( NUMBER_OF_NUCLEON_LAYERS, () => {
      const nucleonLayer = new Node();
      this.nucleonLayers.push( nucleonLayer );
      this.particleViewLayerNode.addChild( nucleonLayer );
    } );
    this.nucleonLayers.reverse(); // Set up the nucleon layers so that layer 0 is in front.

    // for use in positioning
    this.doubleArrowButtons = doubleArrowButtons;
    this.protonArrowButtons = protonArrowButtons;
    this.neutronArrowButtons = neutronArrowButtons;

    // add initial neutrons and protons specified by the query parameters to the atom
    _.times( Math.max( BANQueryParameters.neutrons, BANQueryParameters.protons ), () => {
      if ( this.model.particleAtom.neutronCountProperty.value < BANQueryParameters.neutrons ) {
        this.addNucleonImmediatelyToAtom( ParticleType.NEUTRON );
      }
      if ( this.model.particleAtom.protonCountProperty.value < BANQueryParameters.protons ) {
        this.addNucleonImmediatelyToAtom( ParticleType.PROTON );
      }
    } );
  }

  /**
   * This method increases the value of the smaller radius values and decreases the value of the larger ones.
   * This effectively reduces the range of radii values used.
   * This is a very specialized function for the purposes of this class.
   *
   * minChangedRadius and maxChangedRadius define the way in which an input value is increased or decreased. These values
   * can be adjusted as needed to make the cloud size appear as desired.
   */
  private static reduceRadiusRange( value: number, minShellRadius: number, maxShellRadius: number,
                                    minChangedRadius: number, maxChangedRadius: number ): number {
    const compressionFunction = new LinearFunction( minShellRadius, maxShellRadius, minChangedRadius, maxChangedRadius );
    return compressionFunction.evaluate( value );
  }

  /**
   * Maps a number of electrons to a diameter in screen coordinates for the electron shell.  This mapping function is
   * based on the real size relationships between the various atoms, but has some tweakable parameters to reduce the
   * range and scale to provide values that are usable for our needs on the canvas.
   */
  private getElectronShellDiameter( numElectrons: number, minChangedRadius: number, maxChangedRadius: number ): number {
    const maxElectrons = this.model.protonCountRange.max;
    const atomicRadius = AtomIdentifier.getAtomicRadius( numElectrons );
    if ( atomicRadius ) {
      return BANScreenView.reduceRadiusRange( atomicRadius, this.model.protonCountRange.min + 1, maxElectrons,
        minChangedRadius, maxChangedRadius );
    }
    else {
      assert && assert( numElectrons <= maxElectrons, `Atom has more than supported number of electrons, ${numElectrons}` );
      return 0;
    }
  }

  /**
   * Update size of electron cloud based on protonNumber since the nuclides created are neutral, meaning the number of
   * electrons is the same as the number of protons.
   */
  protected updateCloudSize( protonCount: number, factor: number, minChangedRadius: number, maxChangedRadius: number ): void {
    if ( protonCount === 0 ) {
      this.electronCloud.radius = 1E-5; // arbitrary non-zero value
      this.electronCloud.fill = 'transparent';
    }
    else {
      const radius = this.modelViewTransform.modelToViewDeltaX(
        this.getElectronShellDiameter( protonCount, minChangedRadius, maxChangedRadius ) / 2 );
      this.electronCloud.radius = radius * factor;
      this.electronCloud.fill = new RadialGradient( 0, 0, 0, 0, 0, radius * factor )
        .addColorStop( 0, 'rgba( 0, 0, 255, 200 )' )
        .addColorStop( 0.9, 'rgba( 0, 0, 255, 0 )' );
    }
  }

  /**
   * Get information for a specific particle type.
   */
  private getInfoForParticleType( particleType: ParticleType ): ParticleTypeInfo {
    const maxCount = particleType === ParticleType.PROTON ? this.model.protonCountRange.max : this.model.neutronCountRange.max;
    const creatorNode = particleType === ParticleType.PROTON ? this.protonsCreatorNode : this.neutronsCreatorNode;
    const numberOfNucleons = [ ...this.model.particles ]
      .filter( particle => particle.type === particleType.name.toLowerCase() ).length;
    const outgoingNucleons = [ ...this.model.outgoingParticles ]
      .filter( particle => particle.type === particleType.name.toLowerCase() ).length;

    return {
      maxCount: maxCount,
      creatorNode: creatorNode,
      numberOfNucleons: numberOfNucleons,
      outgoingNucleons: outgoingNucleons
    };
  }

  /**
   * Hides the given creator node if the count for that nucleon type has reached its max.
   */
  public checkIfCreatorNodeShouldBeInvisible( particleType: ParticleType ): void {
    const infoForParticleType = this.getInfoForParticleType( particleType );

    if ( ( infoForParticleType.numberOfNucleons - infoForParticleType.outgoingNucleons ) >= infoForParticleType.maxCount ) {
      BANScreenView.setCreatorNodeVisibility( infoForParticleType.creatorNode, false );
    }
  }

  /**
   * Shows the given creator node if the count for that nucleon type is below its max.
   */
  public checkIfCreatorNodeShouldBeVisible( particleType: ParticleType ): void {
    const infoForParticleType = this.getInfoForParticleType( particleType );

    if ( ( infoForParticleType.numberOfNucleons - infoForParticleType.outgoingNucleons ) < infoForParticleType.maxCount ) {
      BANScreenView.setCreatorNodeVisibility( infoForParticleType.creatorNode, true );
    }
  }

  /**
   * Create and add a nucleon of particleType immediately to the particleAtom.
   */
  public addNucleonImmediatelyToAtom( particleType: ParticleType ): void {
    const particle = new Particle( particleType.name.toLowerCase(), {
      maxZLayer: BANScreenView.NUMBER_OF_NUCLEON_LAYERS - 1
    } );

    // place the particle the center of the particleAtom and add it to the model and particleAtom
    particle.setPositionAndDestination( this.model.particleAtom.positionProperty.value );
    this.model.addParticle( particle );
    this.model.particleAtom.addParticle( particle );
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
  public createParticleFromStack( particleType: ParticleType ): void {

    // create a particle at the center of its creator node
    const particle = new Particle( particleType.name.toLowerCase(), {
      maxZLayer: BANScreenView.NUMBER_OF_NUCLEON_LAYERS - 1
    } );
    particle.animationVelocityProperty.value = BANConstants.PARTICLE_ANIMATION_SPEED;
    const origin = particleType === ParticleType.PROTON ?
                   this.protonsCreatorNodeModelCenter : this.neutronsCreatorNodeModelCenter;
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
                                this.protonsCreatorNodeModelCenter : this.neutronsCreatorNodeModelCenter;
    const particles = [ ...this.model.particles ];

    // array of all the particles that are of particleType and part of the particleAtom
    _.remove( particles, particle => {
      return !this.model.particleAtom.containsParticle( particle ) || particle.type !== particleType.name.toLowerCase();
    } );

    // select the particle closest to its creator node
    const sortedParticles = _.sortBy( particles, particle => {
      return particle.positionProperty.value.distance( creatorNodePosition );
    } );
    const particleToReturn = sortedParticles.shift();

    if ( particleToReturn ) {

      // remove the particle from the particleAtom and send it back to its creator node position
      assert && assert( this.model.particleAtom.containsParticle( particleToReturn ),
        'There is no particle of type in the atom.' );
      this.model.particleAtom.removeParticle( particleToReturn );
      this.animateAndRemoveParticle( particleToReturn, creatorNodePosition );
    }
  }

  /**
   * Animate particle to the given destination and then remove it.
   */
  public animateAndRemoveParticle( particle: Particle, destination?: Vector2 ): void {
    const particleView = this.findParticleView( particle );
    particleView.inputEnabled = false;

    if ( destination ) {
      particle.destinationProperty.value = destination;

      particle.animationEndedEmitter.addListener( () => {
        this.removeParticle( particle );
      } );
    }
    else {
      this.removeParticle( particle );
    }
  }

  /**
   * Remove the given particle from the model.
   */
  protected removeParticle( particle: Particle ): void {
    this.model.outgoingParticles.includes( particle ) && this.model.outgoingParticles.remove( particle );
    this.model.removeParticle( particle );
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
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    const protonCount = this.model.particleAtom.protonCountProperty.value;
    const neutronCount = this.model.particleAtom.neutronCountProperty.value;

    if ( !this.model.doesNuclideExistBooleanProperty.value ) {
      this.timeSinceCountdownStarted += dt;
    }
    else {
      this.timeSinceCountdownStarted = 0;

      // keep track of the old values of protonCountProperty and neutronCountProperty to know which value increased
      this.previousProtonCount = protonCount;
      this.previousNeutronCount = neutronCount;
    }

    // show the nuclide that does not exist for one second, then return the necessary particles
    if ( this.timeSinceCountdownStarted >= BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST ) {
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
    assert && assert( particleView, 'Did not find matching ParticleView for type ' + particle.type + ' and id ' + particle.id );
    return particleView;
  }

  /**
   * Add ParticleView to the correct nucleonLayer.
   */
  protected addParticleView( particle: Particle, particleView: ParticleView ): void {
    this.nucleonLayers[ particle.zLayerProperty.get() ].addChild( particleView );

    // Add a listener that adjusts a nucleon's z-order layering.
    particle.zLayerProperty.link( zLayer => {
      assert && assert(
        this.nucleonLayers.length > zLayer,
        'zLayer for nucleon exceeds number of layers, max number may need increasing.'
      );

      // Determine whether nucleon view is on the correct layer.
      let onCorrectLayer = false;
      const nucleonLayersChildren = this.nucleonLayers[ zLayer ].getChildren() as ParticleView[];
      nucleonLayersChildren.forEach( particleView => {
        if ( particleView.particle === particle ) {
          onCorrectLayer = true;
        }
      } );

      if ( !onCorrectLayer ) {

        // Remove particle view from its current layer.
        let particleView = null;
        for ( let layerIndex = 0; layerIndex < this.nucleonLayers.length && particleView === null; layerIndex++ ) {
          for ( let childIndex = 0; childIndex < this.nucleonLayers[ layerIndex ].children.length; childIndex++ ) {
            const nucleonLayersChildren = this.nucleonLayers[ layerIndex ].getChildren() as ParticleView[];
            if ( nucleonLayersChildren[ childIndex ].particle === particle ) {
              particleView = nucleonLayersChildren[ childIndex ];
              this.nucleonLayers[ layerIndex ].removeChildAt( childIndex );
              break;
            }
          }
        }

        // Add the particle view to its new layer.
        assert && assert( particleView, 'Particle view not found during relayering' );
        this.nucleonLayers[ zLayer ].addChild( particleView! );
      }
    } );
  }

  /**
   * Define the update function for the element name.
   */
  public static updateElementName( elementNameText: Text, protonCount: number, neutronCount: number,
                                   doesNuclideExist: boolean, centerX: number, centerY?: number ): void {
    let name = AtomIdentifier.getName( protonCount );
    const massNumber = protonCount + neutronCount;

    // show "{name} - {massNumber} does not form" in the elementName's place when a nuclide that does not exist on Earth is built
    if ( !doesNuclideExist && massNumber !== 0 ) {

      // no protons
      if ( name.length === 0 ) {
        name += massNumber.toString() + ' ' + BuildANucleusStrings.neutronsLowercase + ' ' + BuildANucleusStrings.doesNotForm;
      }
      else {
        name += ' - ' + massNumber.toString() + ' ' + BuildANucleusStrings.doesNotForm;
      }
    }

    // no protons
    else if ( name.length === 0 ) {

      // no neutrons
      if ( neutronCount === 0 ) {
        name = '';
      }

      // only one neutron
      else if ( neutronCount === 1 ) {
        name = neutronCount + ' ' + BuildANucleusStrings.neutronLowercase;
      }

      // multiple neutrons
      else {
        name = StringUtils.fillIn( BuildANucleusStrings.clusterOfNeutronsPattern, {
          neutronNumber: neutronCount
        } );
      }

    }
    else {
      name += ' - ' + massNumber.toString();
    }
    elementNameText.text = name;
    elementNameText.centerX = centerX;
    if ( centerY ) {
      elementNameText.centerY = centerY;
    }
  }

  /**
   * Define a function that will decide where to put nucleons.
   */
  protected dragEndedListener( nucleon: Particle, atom: ParticleAtom ): void {
    const particleCreatorNodeCenter = nucleon.type === ParticleType.PROTON.name.toLowerCase() ?
                                      this.protonsCreatorNode.center : this.neutronsCreatorNode.center;

    if ( this.isNucleonInCaptureArea( nucleon, atom ) ||

         // if removing the nucleon will create a nuclide that does not exist, re-add the nucleon to the atom
         ( ( this.model.particleAtom.protonCountProperty.value + this.model.particleAtom.neutronCountProperty.value ) !== 0 &&
           !AtomIdentifier.doesExist( this.model.particleAtom.protonCountProperty.value, this.model.particleAtom.neutronCountProperty.value )
         )
    ) {
      atom.addParticle( nucleon );
    }

    // only animate the removal of a nucleon if it was dragged out of the creator node
    else if ( nucleon.positionProperty.value.distance( particleCreatorNodeCenter ) > 10 ) {
      this.animateAndRemoveParticle( nucleon, this.modelViewTransform.viewToModelPosition( particleCreatorNodeCenter ) );
    }
  }

  protected isNucleonInCaptureArea( nucleon: Particle, atom: ParticleAtom ): boolean {
    // Please see subclass implementations
    return false;
  }

}

buildANucleus.register( 'BANScreenView', BANScreenView );
export default BANScreenView;
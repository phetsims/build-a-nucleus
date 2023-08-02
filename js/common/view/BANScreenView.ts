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
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import { Color, Node, PressListenerEvent, ProfileColorProperty, Text, VBox } from '../../../../scenery/js/imports.js';
import BANColors from '../BANColors.js';
import NucleonCountPanel from './NucleonCountPanel.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import DoubleArrowButton, { DoubleArrowButtonDirection } from './DoubleArrowButton.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import NucleonCreatorNode from './NucleonCreatorNode.js';
import ParticleType from '../model/ParticleType.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import BANQueryParameters from '../BANQueryParameters.js';
import ParticleNucleus from '../../chart-intro/model/ParticleNucleus.js';
import ParticleAtomNode from './ParticleAtomNode.js';
import DecayType from '../model/DecayType.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import BANParticle from '../model/BANParticle.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import AlphaParticle from '../model/AlphaParticle.js';

const TOUCH_AREA_Y_DILATION = 3;

// types
type SelfOptions = {
  particleViewPositionVector?: Vector2;
};
export type BANScreenViewOptions = SelfOptions & ScreenViewOptions;
export type ParticleViewMap = Record<number, ParticleView>;

type ParticleTypeInfo = {
  maxCount: number;
  creatorNode: Node;
  numberOfNucleons: number;
  outgoingNucleons: number;
};

// constants
const HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS = 160;

abstract class BANScreenView<M extends BANModel<ParticleAtom | ParticleNucleus>> extends ScreenView {

  protected model: M;
  private timeSinceCountdownStarted: number;
  private previousProtonCount: number;
  private previousNeutronCount: number;
  public readonly resetAllButton: Node;
  public readonly nucleonCountPanel: Node;

  // ParticleView.id => {ParticleView} - lookup map for efficiency. Used for storage only.
  protected readonly particleViewMap: ParticleViewMap;

  // the NucleonCreatorNode for the protons and neutrons
  protected readonly protonsCreatorNode: Node;
  protected readonly neutronsCreatorNode: Node;

  public readonly protonsCreatorNodeModelCenter: Vector2;
  public readonly neutronsCreatorNodeModelCenter: Vector2;

  protected readonly doubleArrowButtons: Node;
  protected readonly protonArrowButtons: Node;
  protected readonly neutronArrowButtons: Node;
  protected readonly elementName: Text;

  // The contents of the formatted display string for the current Element of the atom. Including if it does not form.
  protected readonly elementNameStringProperty: TReadOnlyProperty<string>;
  private readonly atomCenter: Vector2;
  private readonly particleViewPositionVector: Vector2;
  protected readonly particleAtomNode: ParticleAtomNode;
  protected readonly particleTransform: ModelViewTransform2;

  protected constructor( model: M, atomCenter: Vector2, providedOptions?: BANScreenViewOptions ) {

    const options = optionize<BANScreenViewOptions, SelfOptions, ScreenViewOptions>()( {

      particleViewPositionVector: atomCenter
    }, providedOptions );

    super( options );

    this.particleViewPositionVector = options.particleViewPositionVector;
    this.model = model;
    this.timeSinceCountdownStarted = 0;
    this.previousProtonCount = 0;
    this.previousNeutronCount = 0;

    this.atomCenter = atomCenter;

    this.particleViewMap = {};

    this.nucleonCountPanel = new NucleonCountPanel( model.particleAtom.protonCountProperty, model.protonCountRange,
      model.particleAtom.neutronCountProperty, model.neutronCountRange );
    this.nucleonCountPanel.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( this.nucleonCountPanel );

    this.elementNameStringProperty = new DerivedStringProperty( [
      model.particleAtom.protonCountProperty,
      model.particleAtom.neutronCountProperty,
      model.doesNuclideExistBooleanProperty,

      // We need to update whenever any of these strings change, to support Dynamic Locale
      BuildANucleusStrings.nameMassPatternStringProperty,
      BuildANucleusStrings.neutronsLowercaseStringProperty,
      BuildANucleusStrings.elementDoesNotFormPatternStringProperty,
      BuildANucleusStrings.doesNotFormStringProperty,
      BuildANucleusStrings.zeroParticlesDoesNotFormPatternStringProperty,
      BuildANucleusStrings.neutronLowercaseStringProperty,
      BuildANucleusStrings.clusterOfNeutronsPatternStringProperty
    ], ( protonCount, neutronCount, doesNuclideExist ) => {
      let name = AtomIdentifier.getName( protonCount );
      const massNumber = protonCount + neutronCount;

      const massNumberString = massNumber.toString();

      const nameMass = StringUtils.fillIn( BuildANucleusStrings.nameMassPatternStringProperty, {
        name: name,
        mass: massNumberString
      } );

      // show "{name} - {massNumber} does not form" in the elementName's place when a nuclide that does not exist on Earth is built
      if ( !doesNuclideExist && massNumber !== 0 ) {

        // no protons
        if ( name.length === 0 ) {
          name = StringUtils.fillIn( BuildANucleusStrings.zeroParticlesDoesNotFormPatternStringProperty, {
            mass: massNumberString,
            particleType: BuildANucleusStrings.neutronsLowercaseStringProperty,
            doesNotForm: BuildANucleusStrings.doesNotFormStringProperty
          } );
        }
        else {
          name = StringUtils.fillIn( BuildANucleusStrings.elementDoesNotFormPatternStringProperty, {
            nameMass: nameMass,
            doesNotForm: BuildANucleusStrings.doesNotFormStringProperty
          } );
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
          name = StringUtils.fillIn( BuildANucleusStrings.zeroParticlesDoesNotFormPatternStringProperty, {
            mass: neutronCount,
            particleType: BuildANucleusStrings.neutronLowercaseStringProperty,
            doesNotForm: ''
          } );
        }

        // multiple neutrons
        else {
          // TODO: how do I get here? https://github.com/phetsims/build-a-nucleus/issues/106
          name = StringUtils.fillIn( BuildANucleusStrings.clusterOfNeutronsPatternStringProperty, {
            neutronCount: neutronCount
          } );
        }

      }
      else {
        name = nameMass;
      }
      return name;
    } );

    // Create the textual readout for the element name.
    this.elementName = new Text( this.elementNameStringProperty, {
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
    const toggleCreatorNodeEnabled = ( creatorNode: Node, enable: boolean ) => {
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
          if ( !AtomIdentifier.doesExist( protonCount, neutronCount ) &&
               ( model.particleAtom.massNumberProperty.value !== 0 || userControlledNucleonCount !== 0 ) ) {
            toggleCreatorNodeEnabled( this.protonsCreatorNode, false );
            toggleCreatorNodeEnabled( this.neutronsCreatorNode, false );
            return false;
          }

          else {
            toggleCreatorNodeEnabled( this.protonsCreatorNode, true );
            toggleCreatorNodeEnabled( this.neutronsCreatorNode, true );

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

            // If there are no atoms actually in the atom (only potentially animating to the atom), see https://github.com/phetsims/build-a-nucleus/issues/74
            if ( direction === 'down' && _.some( [ firstParticleType, secondParticleType ], particleType => {
              return ( particleType === ParticleType.NEUTRON && atomNeutronCount === 0 ) ||
                     ( particleType === ParticleType.PROTON && atomProtonCount === 0 );
            } ) ) {
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
    doubleArrowButtons.centerX = this.atomCenter.x;
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

    const nucleonLabelTextOptions = { font: new PhetFont( 20 ), maxWidth: 150 };

    // create and add the Protons and Neutrons label
    const protonsLabel = new Text( BuildANucleusStrings.protonsStringProperty, nucleonLabelTextOptions );
    protonsLabel.boundsProperty.link( () => {
      protonsLabel.bottom = doubleArrowButtons.bottom;
      protonsLabel.centerX = ( doubleArrowButtons.left - protonArrowButtons.right ) / 2 + protonArrowButtons.right;
    } );
    this.addChild( protonsLabel );

    const neutronsLabel = new Text( BuildANucleusStrings.neutronsUppercaseStringProperty, nucleonLabelTextOptions );
    neutronsLabel.boundsProperty.link( () => {
      neutronsLabel.bottom = doubleArrowButtons.bottom;
      neutronsLabel.centerX = ( neutronArrowButtons.left - doubleArrowButtons.right ) / 2 + doubleArrowButtons.right;
    } );
    this.addChild( neutronsLabel );

    // create and add the NucleonCreatorNode for the protons
    this.protonsCreatorNode = new NucleonCreatorNode<ParticleAtom | ParticleNucleus>( ParticleType.PROTON, this, options.particleViewPositionVector );
    this.protonsCreatorNode.top = doubleArrowButtons.top;
    this.protonsCreatorNode.centerX = protonsLabel.centerX;
    this.addChild( this.protonsCreatorNode );

    // create and add the NucleonCreatorNode for the neutrons
    this.neutronsCreatorNode = new NucleonCreatorNode<ParticleAtom | ParticleNucleus>( ParticleType.NEUTRON, this, options.particleViewPositionVector );
    this.neutronsCreatorNode.top = doubleArrowButtons.top;
    this.neutronsCreatorNode.centerX = neutronsLabel.centerX;
    this.addChild( this.neutronsCreatorNode );

    this.particleTransform = ModelViewTransform2.createSinglePointScaleMapping( Vector2.ZERO, options.particleViewPositionVector, 1 );
    this.protonsCreatorNodeModelCenter = this.particleTransform.viewToModelPosition( this.protonsCreatorNode.center );
    this.neutronsCreatorNodeModelCenter = this.particleTransform.viewToModelPosition( this.neutronsCreatorNode.center );

    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN
    } );
    this.addChild( this.resetAllButton );

    const userControlledListener = ( isUserControlled: boolean, particle: Particle ) => {
      if ( isUserControlled && this.model.particleAtom.containsParticle( particle ) ) {
        this.model.particleAtom.removeParticle( particle );
      }

      if ( isUserControlled && particle.type === ParticleType.PROTON.particleTypeString && !this.model.userControlledProtons.includes( particle ) ) {
        this.model.userControlledProtons.add( particle );
      }
      else if ( !isUserControlled && particle.type === ParticleType.PROTON.particleTypeString && this.model.userControlledProtons.includes( particle ) ) {
        this.model.userControlledProtons.remove( particle );
      }
      else if ( isUserControlled && particle.type === ParticleType.NEUTRON.particleTypeString && !this.model.userControlledNeutrons.includes( particle ) ) {
        this.model.userControlledNeutrons.add( particle );
      }
      else if ( !isUserControlled && particle.type === ParticleType.NEUTRON.particleTypeString && this.model.userControlledNeutrons.includes( particle ) ) {
        this.model.userControlledNeutrons.remove( particle );
      }
    };

    // convert string particle type to a ParticleType
    const getParticleTypeFromStringType = ( particleTypeString: string ) => {
      const particleType = particleTypeString === ParticleType.PROTON.particleTypeString ? ParticleType.PROTON :
                           particleTypeString === ParticleType.NEUTRON.particleTypeString ? ParticleType.NEUTRON :
                           particleTypeString === ParticleType.ELECTRON.particleTypeString ? ParticleType.ELECTRON :
                           particleTypeString === ParticleType.POSITRON.particleTypeString ? ParticleType.POSITRON :
                           null;
      assert && assert( particleType !== null, `Particle type ${particleTypeString} is not a valid particle type.` );
      return particleType;
    };

    // add ParticleView's to match the model
    this.model.particles.addItemAddedListener( ( particle: Particle ) => {
      const particleView = new ParticleView( particle, this.particleTransform );

      this.particleViewMap[ particleView.particle.id ] = particleView;
      this.addParticleView( particle );
      const particleType = getParticleTypeFromStringType( particle.type );

      if ( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ) {

        // called when a nucleon is finished being dragged
        particle.dragEndedEmitter.addListener( () => { this.dragEndedListener( particle, this.model.particleAtom ); } );
        this.checkIfCreatorNodeShouldBeInvisible( particleType );
      }

      particle.userControlledProperty.link( isUserControlled => userControlledListener( isUserControlled, particle ) );

      particle.disposeEmitter.addListener( () => {
        delete this.particleViewMap[ particle.id ];

        particleView.dispose();

        const particleType = getParticleTypeFromStringType( particle.type );

        if ( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ) {
          this.checkIfCreatorNodeShouldBeVisible( particleType );
        }
      } );
    } );

    // remove ParticleView's to match the model
    this.model.particles.addItemRemovedListener( ( particle: Particle ) => {
      particle.dispose();
    } );

    this.particleAtomNode = new ParticleAtomNode( this.particleViewMap, this.atomCenter, this.model.protonCountRange );

    // for use in positioning
    this.doubleArrowButtons = doubleArrowButtons;
    this.protonArrowButtons = protonArrowButtons;
    this.neutronArrowButtons = neutronArrowButtons;

    // update the cloud size as the massNumber changes
    model.particleAtom.protonCountProperty.link( protonCount => this.particleAtomNode.updateCloudSize( protonCount, 0.27, 10, 20 ) );

    phet.joist.sim.isConstructionCompleteProperty.link( ( complete: boolean ) => {
      if ( complete ) {
        // add initial neutrons and protons specified by the query parameters to the atom
        _.times( Math.max( BANQueryParameters.neutrons, BANQueryParameters.protons ), () => {
          if ( this.model.particleAtom.neutronCountProperty.value < BANQueryParameters.neutrons &&
               this.model.particleAtom.neutronCountProperty.value < this.model.neutronCountRange.max ) {
            this.addNucleonImmediatelyToAtom( ParticleType.NEUTRON );
          }
          if ( this.model.particleAtom.protonCountProperty.value < BANQueryParameters.protons &&
               this.model.particleAtom.protonCountProperty.value < this.model.protonCountRange.max ) {
            this.addNucleonImmediatelyToAtom( ParticleType.PROTON );
          }
        } );
      }
    } );

    this.pdomPlayAreaNode.pdomOrder = [
      protonArrowButtons,
      doubleArrowButtons,
      neutronArrowButtons
    ];
    this.pdomControlAreaNode.pdomOrder = [ this.resetAllButton ];
  }

  /**
   * Get information for a specific particle type.
   */
  private getInfoForParticleType( particleType: ParticleType ): ParticleTypeInfo {
    const maxCount = particleType === ParticleType.PROTON ? this.model.protonCountRange.max : this.model.neutronCountRange.max;
    const creatorNode = particleType === ParticleType.PROTON ? this.protonsCreatorNode : this.neutronsCreatorNode;
    const numberOfNucleons = [ ...this.model.particles ]
      .filter( particle => particle.type === particleType.particleTypeString ).length;
    const outgoingNucleons = [ ...this.model.outgoingParticles ]
      .filter( particle => particle.type === particleType.particleTypeString ).length;

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
  private checkIfCreatorNodeShouldBeVisible( particleType: ParticleType ): void {
    const infoForParticleType = this.getInfoForParticleType( particleType );

    if ( ( infoForParticleType.numberOfNucleons - infoForParticleType.outgoingNucleons ) < infoForParticleType.maxCount ) {
      BANScreenView.setCreatorNodeVisibility( infoForParticleType.creatorNode, true );
    }
  }

  /**
   * Make nucleon creator nodes visible if their nucleon counts are below their max amounts.
   */
  protected checkIfCreatorNodesShouldBeVisible(): void {
    this.checkIfCreatorNodeShouldBeVisible( ParticleType.PROTON );
    this.checkIfCreatorNodeShouldBeVisible( ParticleType.NEUTRON );
  }

  /**
   * Show or hide nucleon creator nodes depending on their current nucleon counts and max allowed amount.
   */
  protected checkIfCreatorNodesShouldBeVisibleOrInvisible(): void {
    this.checkIfCreatorNodeShouldBeInvisible( ParticleType.PROTON );
    this.checkIfCreatorNodeShouldBeInvisible( ParticleType.NEUTRON );
    this.checkIfCreatorNodesShouldBeVisible();
  }

  /**
   * Create and add a nucleon of particleType immediately to the particleAtom.
   */
  public addNucleonImmediatelyToAtom( particleType: ParticleType ): void {
    const particle = new BANParticle( particleType.particleTypeString, {
      maxZLayer: BANConstants.NUMBER_OF_NUCLEON_LAYERS - 1
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
  public createParticleFromStack( particleType: ParticleType ): Particle {

    // create a particle at the center of its creator node
    const particle = new BANParticle( particleType.particleTypeString, {
      maxZLayer: BANConstants.NUMBER_OF_NUCLEON_LAYERS - 1
    } );
    const origin = particleType === ParticleType.PROTON ?
                   this.protonsCreatorNodeModelCenter : this.neutronsCreatorNodeModelCenter;
    particle.setPositionAndDestination( origin );

    // send the particle the center of the particleAtom and add it to the model
    particle.destinationProperty.value = this.model.getParticleDestination( particleType, particle );
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

        // must remove incoming particles before adding it to particleAtom so incoming count is accurate
        arrayRemove( particleType === ParticleType.PROTON ? this.model.incomingProtons : this.model.incomingNeutrons, particle );

        this.model.particleAtom.addParticle( particle );
        particleView.inputEnabled = true;
        particle.animationEndedEmitter.removeAllListeners();
      }
    } );

    return particle;
  }

  /**
   * Remove a particle of particleType from the particleAtom, if it is in the particleAtom, and send it back to its creator node.
   */
  public returnParticleToStack( particleType: ParticleType ): void {
    const creatorNodePosition = particleType === ParticleType.PROTON ?
                                this.protonsCreatorNodeModelCenter : this.neutronsCreatorNodeModelCenter;

    const particleToReturn = this.model.getParticleToReturn( particleType, creatorNodePosition );

    // Remove the particle from the particleAtom, if the particle is a part of the particleAtom. It should not count
    // in the atom while animating back to the stack
    if ( this.model.particleAtom.containsParticle( particleToReturn ) ) {
      this.model.particleAtom.removeParticle( particleToReturn );
    }
    else if ( this.model.incomingNeutrons.includes( particleToReturn ) || this.model.incomingProtons.includes( particleToReturn ) ) {
      this.clearIncomingParticle( particleToReturn, particleType );
    }
    else {
      assert && assert( false, 'The above cases should cover all possibilities' );
    }

    assert && assert( !particleToReturn.animationEndedEmitter.hasListeners(),
      'should not have animation listeners, we are about to animate' );

    // send particle back to its creator node position
    this.animateAndRemoveParticle( particleToReturn, creatorNodePosition );
  }

  /**
   * Don't finish the animation towards to the particle atom, because now it is time to remove this particle
   * (animating it back to the stack).
   */
  protected clearIncomingParticle( particle: Particle, particleType: ParticleType ): void {
    arrayRemove( particleType === ParticleType.PROTON ? this.model.incomingProtons : this.model.incomingNeutrons, particle );
    particle.animationEndedEmitter.removeAllListeners();
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
    assert && assert( !particle.isDisposed, 'cannot remove a particle that is already disposed' );

    this.model.outgoingParticles.includes( particle ) && this.model.outgoingParticles.remove( particle );
    if ( this.model.particles.includes( particle ) ) {
      this.model.removeParticle( particle );
    }
    else {
      // Remove particles flying away from the mini-nucleus. Dispose emitter deals with the view portion.
      assert && assert( !this.getParticleAtom().containsParticle( particle ), 'Particle is a decaying particle so it should not be a part of the miniParticleAtom.' );
      particle.dispose();
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

  public reset(): void {
    // Overridden by subtypes if needed
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

      // TODO: change this because it is a bit hacky, uses a boolean property to keep track of if a double arrow button was clicked https://github.com/phetsims/build-a-nucleus/issues/93
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
   * Define a function that will decide where to put nucleons.
   */
  protected dragEndedListener( nucleon: Particle, atom: ParticleAtom ): void {
    const particleCreatorNodeCenter = nucleon.type === ParticleType.PROTON.particleTypeString ?
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
      this.animateAndRemoveParticle( nucleon, this.particleTransform.viewToModelPosition( particleCreatorNodeCenter ) );
    }
  }

  protected isNucleonInCaptureArea( nucleon: Particle, atom: ParticleAtom ): boolean {
    // Please see subclass implementations
    return false;
  }

  protected addParticleView( particle: Particle ): void {
    this.particleAtomNode.addParticleView( particle );
  }

  /**
   * Given a decayType, conduct that decay on the model's ParticleAtom.
   */
  public decayAtom( decayType: DecayType | null ): void {
    switch( decayType ) {
      case DecayType.NEUTRON_EMISSION:
        this.emitNucleon( ParticleType.NEUTRON, decayType.name );
        break;
      case DecayType.PROTON_EMISSION:
        this.emitNucleon( ParticleType.PROTON, decayType.name );
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
        // No decay if there is no supported decayType
        break;
    }
  }

  /**
   * Returns a random position, in view coordinates, outside the screen view's visible bounds.
   */
  protected getRandomEscapePosition(): Vector2 {
    const visibleBounds = this.visibleBoundsProperty.value.dilated( BANConstants.PARTICLE_RADIUS * 20 ); // 10 particles wide
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
  protected emitNucleon( particleType: ParticleType, fromDecay?: string ): Particle {
    assert && assert( particleType === ParticleType.PROTON ? this.model.particleAtom.protonCountProperty.value >= 1 :
                      this.model.particleAtom.neutronCountProperty.value >= 1,
      'The particleAtom needs a ' + particleType.name + ' to emit it. The decay: ' + fromDecay + ' cannot occur.' );

    const nucleon = this.model.particleAtom.extractParticle( particleType.particleTypeString );
    this.model.outgoingParticles.add( nucleon );
    return nucleon;
  }

  /**
   * Return the model of the cluster of nucleons, which is the main model in the Decay Screen and the mini nucleus in
   * the Chart Screen.
   */
  protected abstract getParticleAtom(): ParticleAtom;

  /**
   * Return a random position, in model coordinates, that is outside the visible bounds.
   */
  protected abstract getRandomExternalModelPosition(): Vector2;

  protected emitAlphaParticle(): AlphaParticle {
    const particleAtom = this.getParticleAtom();
    assert && assert( this.model.particleAtom.protonCountProperty.value >= 2 &&
    this.model.particleAtom.neutronCountProperty.value >= 2,
      'The particleAtom needs 2 protons and 2 neutrons to emit an alpha particle.' );

    // create and add the alpha particle node
    const alphaParticle = new AlphaParticle();

    // get the protons and neutrons closest to the center of the particleAtom and remove them from the particleAtom
    const protonsToRemove = _.times( AlphaParticle.NUMBER_OF_ALLOWED_PROTONS,
      () => particleAtom.extractParticleClosestToCenter( ParticleType.PROTON.particleTypeString ) );
    const neutronsToRemove = _.times( AlphaParticle.NUMBER_OF_ALLOWED_NEUTRONS,
      () => particleAtom.extractParticleClosestToCenter( ParticleType.NEUTRON.particleTypeString ) );

    // add the obtained protons and neutrons to the alphaParticle
    [ ...protonsToRemove, ...neutronsToRemove ].forEach( nucleon => {
      alphaParticle.addParticle( nucleon );
      this.model.outgoingParticles.add( nucleon );
      this.findParticleView( nucleon ).inputEnabled = false;
    } );

    // ensure the creator nodes are visible since particles are being removed from the particleAtom
    alphaParticle.moveAllParticlesToDestination();
    this.checkIfCreatorNodesShouldBeVisible();

    // animate the particle to a random destination outside the model
    const alphaParticleEmissionAnimation = alphaParticle.animateAndRemoveParticle(
      this.getRandomExternalModelPosition(), () => this.removeParticle );
    this.model.particleAnimations.push( alphaParticleEmissionAnimation );

    return alphaParticle;
  }

  protected betaDecay( betaDecayType: DecayType ): Particle {
    const particleAtom = this.getParticleAtom();
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

    const particleTypeString = ParticleType.enumeration.getValue( particleArray.get( 0 ).type.toUpperCase() ).name;
    assert && assert( particleArray.lengthProperty.value >= 1,
      'The particleAtom needs a ' + particleTypeString + ' for a ' + betaDecayType.name );

    // the particle that will change its nucleon type will be the one closest to the center of the atom
    const closestParticle = _.sortBy( [ ...particleArray ],
      closestParticle => closestParticle.positionProperty.value.distance( particleAtom.positionProperty.value ) ).shift()!;

    // place the particleToEmit in the same position and behind the particle that is changing its nucleon type
    particleToEmit.positionProperty.value = closestParticle.positionProperty.value;
    particleToEmit.zLayerProperty.value = closestParticle.zLayerProperty.value + 1;

    const destination = this.getRandomExternalModelPosition();

    this.model.outgoingParticles.add( particleToEmit );

    // add the particle to the model to emit it, then change the nucleon type and remove the particle
    particleAtom.changeNucleonType( closestParticle, () => {
      this.animateAndRemoveParticle( particleToEmit, destination );
      this.checkIfCreatorNodesShouldBeVisibleOrInvisible();
    } );

    return particleToEmit;
  }
}

buildANucleus.register( 'BANScreenView', BANScreenView );
export default BANScreenView;

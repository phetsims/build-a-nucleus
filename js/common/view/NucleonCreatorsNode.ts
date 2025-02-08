// Copyright 2023-2025, University of Colorado Boulder

/**
 * Spinner buttons at the bottom of the screen that add and remove protons and neutrons from the atom. Buttons are
 * enabled and disabled appropriately.
 *
 * @author Luisa Vargas
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox, { VBoxOptions } from '../../../../scenery/js/layout/nodes/VBox.js';
import { PressListenerEvent } from '../../../../scenery/js/listeners/PressListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ProfileColorProperty from '../../../../scenery/js/util/ProfileColorProperty.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import ShellModelNucleus from '../../chart-intro/model/ShellModelNucleus.js';
import BANColors from '../BANColors.js';
import BANModel from '../model/BANModel.js';
import ParticleType from '../model/ParticleType.js';
import DoubleArrowButton, { ArrowButtonDirection } from './DoubleArrowButton.js';
import NucleonCreatorNode from './NucleonCreatorNode.js';

// constants
const MAX_TEXT_WIDTH = 150;
const TOUCH_AREA_Y_DILATION = 3;
const NUCLEON_LABEL_TEXT_OPTIONS = { font: new PhetFont( 20 ), maxWidth: MAX_TEXT_WIDTH };
const CREATOR_NODE_VBOX_OPTIONS = {
  excludeInvisibleChildrenFromBounds: false,
  layoutOptions: {
    minContentWidth: MAX_TEXT_WIDTH
  }
};

// The arrow buttons spacing and size options.
const ARROW_BUTTON_VBOX_SPACING = 7; // Spacing between the 'up' arrow buttons and 'down' arrow buttons.
const ARROW_BUTTON_OPTIONS = {
  arrowWidth: 14,
  arrowHeight: 14,
  fireOnHold: false,
  touchAreaYDilation: TOUCH_AREA_Y_DILATION
};


class NucleonCreatorsNode extends HBox {

  private readonly doubleArrowButtons: Node;
  private readonly protonArrowButtons: Node;
  private readonly neutronArrowButtons: Node;

  // For use in methods.
  private readonly protonNumberRange: Range;
  private readonly neutronNumberRange: Range;
  private readonly createParticleFromStack: ( particleType: ParticleType ) => Particle;
  private readonly returnParticleToStack: ( particleType: ParticleType ) => void;
  private model: BANModel<ParticleAtom | ShellModelNucleus>;
  private readonly particleTransform: ModelViewTransform2;

  // The NucleonCreatorNode for the protons and neutrons.
  public readonly protonsCreatorNode: Node;
  public readonly neutronsCreatorNode: Node;

  // Created to keep dependencies in sync for all updating of enabledProperties for nucleon creator UI
  private readonly enabledDependencies: readonly [ TReadOnlyProperty<number>, TReadOnlyProperty<number>, TReadOnlyProperty<number>, TReadOnlyProperty<number>, TReadOnlyProperty<number>, TReadOnlyProperty<number> ];

  public constructor( model: BANModel<ParticleAtom | ShellModelNucleus>,
                      addAndDragParticle: ( event: PressListenerEvent, particle: Particle ) => void,
                      particleTransform: ModelViewTransform2,
                      createParticleFromStack: ( particleType: ParticleType ) => Particle,
                      returnParticleToStack: ( particleType: ParticleType ) => void ) {
    super();

    const getLocalPoint = this.globalToParentPoint.bind( this );

    // Create and add the Protons and Neutrons label.
    const protonsLabel = new Text( BuildANucleusStrings.protonsStringProperty, NUCLEON_LABEL_TEXT_OPTIONS );
    const neutronsLabel = new Text( BuildANucleusStrings.neutronsUppercaseStringProperty, NUCLEON_LABEL_TEXT_OPTIONS );

    // Create and add the NucleonCreatorNode for the protons.
    this.protonsCreatorNode = new NucleonCreatorNode( ParticleType.PROTON, getLocalPoint, addAndDragParticle,
      particleTransform );

    // Create and add the NucleonCreatorNode for the neutrons.
    this.neutronsCreatorNode = new NucleonCreatorNode( ParticleType.NEUTRON, getLocalPoint, addAndDragParticle,
      particleTransform );

    this.model = model;
    this.protonNumberRange = model.protonNumberRange;
    this.neutronNumberRange = model.neutronNumberRange;
    this.createParticleFromStack = createParticleFromStack;
    this.returnParticleToStack = returnParticleToStack;
    this.particleTransform = particleTransform;

    this.enabledDependencies = [
      this.model.particleAtom.protonCountProperty,
      this.model.particleAtom.neutronCountProperty,
      this.model.incomingProtons.lengthProperty,
      this.model.incomingNeutrons.lengthProperty,
      this.model.userControlledProtons.lengthProperty,
      this.model.userControlledNeutrons.lengthProperty
    ] as const;

    // Create and add the double arrow buttons.
    this.doubleArrowButtons = new VBox( {
      children: [ this.createDoubleArrowButtons( 'up' ), this.createDoubleArrowButtons( 'down' ) ],
      spacing: ARROW_BUTTON_VBOX_SPACING
    } );

    // Create and add the single arrow buttons.
    this.protonArrowButtons = this.createSingleArrowButtons( ParticleType.PROTON, BANColors.protonColorProperty );
    this.neutronArrowButtons = this.createSingleArrowButtons( ParticleType.NEUTRON, BANColors.neutronColorProperty );

    // Function to toggle nucleon creator nodes enabled
    // NOTE: this linkage is very similar to that of each arrow button enabled property, version these together.
    Multilink.multilink( this.enabledDependencies,
      ( atomProtonNumber, atomNeutronNumber, incomingProtonsNumber, incomingNeutronsNumber,
        userControlledProtonNumber, userControlledNeutronNumber ) => {

        const protonNumber = atomProtonNumber + incomingProtonsNumber + userControlledProtonNumber;
        const neutronNumber = atomNeutronNumber + incomingNeutronsNumber + userControlledNeutronNumber;
        const userControlledNucleonNumber = userControlledNeutronNumber + userControlledProtonNumber;
        const doesNuclideExist = AtomIdentifier.doesExist( protonNumber, neutronNumber );
        const massNumber = atomProtonNumber + atomNeutronNumber;

        const shouldEnableCreators = this.shouldEnableCreators( doesNuclideExist, massNumber, userControlledNucleonNumber );

        // Disable all arrow buttons if the nuclide does not exist.
        NucleonCreatorsNode.toggleCreatorNodeEnabled( this.protonsCreatorNode, shouldEnableCreators );
        NucleonCreatorsNode.toggleCreatorNodeEnabled( this.neutronsCreatorNode, shouldEnableCreators );
      } );

    this.mutate( {
      align: 'bottom',
      spacing: 5,
      stretch: true,
      children: [
        this.protonArrowButtons,
        new VBox( combineOptions<VBoxOptions>( {
          children: [
            this.protonsCreatorNode,
            protonsLabel
          ]
        }, CREATOR_NODE_VBOX_OPTIONS ) ),
        this.doubleArrowButtons,
        new VBox( combineOptions<VBoxOptions>( {
          children: [
            this.neutronsCreatorNode,
            neutronsLabel
          ]
        }, CREATOR_NODE_VBOX_OPTIONS ) ),
        this.neutronArrowButtons
      ]
    } );
  }

  /**
   * Convert creator node center into the coordinate frame of whoever is using this NucleonCreatorsNode (in model coords).
   */
  private getCreatorNodeModelCenter( creatorNode: Node ): Vector2 {
    const globalCreatorNodeViewCenter = this.globalToParentPoint(
      creatorNode.parentToGlobalPoint( creatorNode.center ) );

    return this.particleTransform.viewToModelPosition( globalCreatorNodeViewCenter );
  }

  public get protonsCreatorNodeModelCenter(): Vector2 { return this.getCreatorNodeModelCenter( this.protonsCreatorNode ); }

  public get neutronsCreatorNodeModelCenter(): Vector2 { return this.getCreatorNodeModelCenter( this.neutronsCreatorNode ); }

  private createDoubleArrowButtons( direction: ArrowButtonDirection ): Node {

    const enabledProperty = direction === 'up' ?
                            this.createArrowEnabledProperty( 'up', ParticleType.PROTON, ParticleType.NEUTRON ) :
                            this.createArrowEnabledProperty( 'down', ParticleType.PROTON, ParticleType.NEUTRON );

    return new DoubleArrowButton( direction,
      direction === 'up' ?
      () => this.increaseNucleonNumberListener( ParticleType.PROTON, ParticleType.NEUTRON ) :
      () => this.decreaseNucleonNumberListener( ParticleType.PROTON, ParticleType.NEUTRON ),
      merge( {
        leftArrowFill: BANColors.protonColorProperty,
        rightArrowFill: BANColors.neutronColorProperty,
        enabledProperty: enabledProperty
      }, ARROW_BUTTON_OPTIONS )
    );
  }

  private createSingleArrowButtons( nucleonType: ParticleType, nucleonColorProperty: ProfileColorProperty ): Node {

    // Create the arrow enabled properties.
    const upArrowEnabledProperty = nucleonType === ParticleType.PROTON ?
                                   this.createArrowEnabledProperty( 'up', ParticleType.PROTON ) :
                                   this.createArrowEnabledProperty( 'up', ParticleType.NEUTRON );

    const downArrowEnabledProperty = nucleonType === ParticleType.PROTON ?
                                     this.createArrowEnabledProperty( 'down', ParticleType.PROTON ) :
                                     this.createArrowEnabledProperty( 'down', ParticleType.NEUTRON );

    const singleArrowButtonOptions = merge( { arrowFill: nucleonColorProperty }, ARROW_BUTTON_OPTIONS );

    const upArrowButton = new ArrowButton( 'up', () => this.increaseNucleonNumberListener( nucleonType ),
      merge( {
        enabledProperty: upArrowEnabledProperty
      }, singleArrowButtonOptions )
    );
    const downArrowButton = new ArrowButton( 'down', () => this.decreaseNucleonNumberListener( nucleonType ),
      merge( {
        enabledProperty: downArrowEnabledProperty
      }, singleArrowButtonOptions )
    );

    return new VBox( {
      justify: 'center',
      children: [ upArrowButton, downArrowButton ],
      spacing: ARROW_BUTTON_VBOX_SPACING
    } );
  }

  /**
   * Disable creators if the nuclide doesn't exist and one of the two cases:
   * 1. Something (any particle) is being user controlled
   * 2. The ParticleAtom is not empty.
   */
  private shouldEnableCreators( doesNuclideExist: boolean, massNumber: number, userControlledNucleonNumber: number ): boolean {
    const shouldDisableCreators = !doesNuclideExist && ( massNumber !== 0 || userControlledNucleonNumber !== 0 );
    return !shouldDisableCreators;
  }


  private createArrowEnabledProperty(
    direction: ArrowButtonDirection,
    firstParticleType: ParticleType,
    secondParticleType?: ParticleType
  ): TReadOnlyProperty<boolean> {

    // Function to create the arrow enabled properties.
    // NOTE: this linkage is very similar to that of nucleon creators enabled property, version these together.
    return new DerivedProperty( this.enabledDependencies,
      ( atomProtonNumber, atomNeutronNumber, incomingProtonsNumber, incomingNeutronsNumber,
        userControlledProtonNumber, userControlledNeutronNumber ) => {

        const protonNumber = atomProtonNumber + incomingProtonsNumber + userControlledProtonNumber;
        const neutronNumber = atomNeutronNumber + incomingNeutronsNumber + userControlledNeutronNumber;
        const userControlledNucleonNumber = userControlledNeutronNumber + userControlledProtonNumber;
        const doesNuclideExist = AtomIdentifier.doesExist( protonNumber, neutronNumber );
        const massNumber = atomProtonNumber + atomNeutronNumber;

        // Disable all buttons if the nuclide doesn't exist and one of the two cases:
        // Something is being user controlled OR Particle Atom is not empty.
        if ( !this.shouldEnableCreators( doesNuclideExist, massNumber, userControlledNucleonNumber ) ) {
          return false;
        }
        else {
          // Else handle each enabled case specifically.

          // True when the potential spot to go to does not "exist". If there is a second particle type, check by
          // changing both particle numbers.
          const nextIsoDoesNotExist = secondParticleType ?
                                      !NucleonCreatorsNode.hasNextIso( direction, 'both', protonNumber, neutronNumber ) :
                                      !NucleonCreatorsNode.hasNextIso( direction, firstParticleType, protonNumber, neutronNumber );

          // In the up direction, you can create one extra past an atom that does exist.
          const allowIncreaseToNonExistent = direction === 'up' && AtomIdentifier.doesExist( protonNumber, neutronNumber );

          // Covers cases where you can't remove a particle into a nuclide that doesn't exist, but you can add one
          // extra (for learning) before it is animated back to an existent state.
          if ( !allowIncreaseToNonExistent && nextIsoDoesNotExist ) {
            return false;
          }

          // If there are no atoms actually in the atom (only potentially animating to the atom),
          // see https://github.com/phetsims/build-a-nucleus/issues/74.
          if ( direction === 'down' && _.some( [ firstParticleType, secondParticleType ], particleType => {
            return ( particleType === ParticleType.NEUTRON && atomNeutronNumber === 0 ) ||
                   ( particleType === ParticleType.PROTON && atomProtonNumber === 0 );
          } ) ) {
            return false;
          }

          // Finally, disable any buttons that are at the range bound for that button.
          const firstTypeNotAtRangeBound = this.isNucleonNumberNotAtRangeBounds( direction, firstParticleType,
            protonNumber, neutronNumber );
          return secondParticleType ?
                 firstTypeNotAtRangeBound && this.isNucleonNumberNotAtRangeBounds( direction, secondParticleType,
                                            protonNumber, neutronNumber ) :
                 firstTypeNotAtRangeBound;
        }
      } );
  }

  /**
   * Return whether any nuclides exist above/below/left/right/diagonal (depending on direction/particle type) of a given
   * nuclide in the chart. "Next" here signifies in the provided direction for the particle type, not solely adding.
   *
   * NOTE: we also return true for the p0,n0 case, even though that doesn't technically "exist".
   */
  private static hasNextIso( direction: ArrowButtonDirection, particleType: ParticleType | 'both',
                             protonNumber: number, neutronNumber: number ): boolean {

    if ( direction === 'up' ) {

      // Proton up arrow.
      if ( particleType === ParticleType.PROTON ) {
        return AtomIdentifier.doesNextIsotoneExist( protonNumber, neutronNumber );
      }
      else if ( particleType === ParticleType.NEUTRON ) {

        // Neutron up arrow.
        return AtomIdentifier.doesNextIsotopeExist( protonNumber, neutronNumber );
      }
      else {
        assert && assert( particleType === 'both', 'all cases covered' );
        return AtomIdentifier.doesNextNuclideExist( protonNumber, neutronNumber );
      }
    }
    else {
      //  direction === 'down'

      // Proton down arrow.
      if ( particleType === ParticleType.PROTON ) {
        return AtomIdentifier.doesPreviousIsotoneExist( protonNumber, neutronNumber )
               || ( neutronNumber === 0 && protonNumber === 1 );
      }
      else if ( particleType === ParticleType.NEUTRON ) {

        // Neutron down arrow.
        return AtomIdentifier.doesPreviousIsotopeExist( protonNumber, neutronNumber )
               || ( neutronNumber === 1 && protonNumber === 0 );
      }
      else {
        assert && assert( particleType === 'both', 'all cases covered' );
        return AtomIdentifier.doesPreviousNuclideExist( protonNumber, neutronNumber )
               || ( neutronNumber === 1 && protonNumber === 1 );
      }
    }
  }

  /**
   * Function returns whether true when the protonNumber or neutronNumber is not at its min or max range (depending on
   * the direction of the button).
   */
  private isNucleonNumberNotAtRangeBounds( direction: ArrowButtonDirection, particleType: ParticleType,
                                           protonNumber: number, neutronNumber: number ): boolean {
    if ( direction === 'up' ) {

      // Proton up arrow.
      if ( particleType === ParticleType.PROTON ) {
        return protonNumber !== this.protonNumberRange.max;
      }

      // Neutron up arrow.
      return neutronNumber !== this.neutronNumberRange.max;
    }
    else {
      //  direction === 'down'

      // Proton down arrow.
      if ( particleType === ParticleType.PROTON ) {
        return protonNumber !== this.protonNumberRange.min;
      }

      // Neutron down arrow.
      return neutronNumber !== this.neutronNumberRange.min;
    }
  }

  /**
   * Enable or disable the creator node and adjust the opacity accordingly.
   */
  private static toggleCreatorNodeEnabled( creatorNode: Node, enable: boolean ): void {
    if ( creatorNode ) {
      creatorNode.inputEnabled = enable;
      creatorNode.opacity = enable ? 1 : 0.5;
    }
  }

  /**
   * Create listener to create a particle.
   */
  private increaseNucleonNumberListener( firstNucleonType: ParticleType, secondNucleonType?: ParticleType ): void {
    this.createParticleFromStack( firstNucleonType );
    secondNucleonType && this.createParticleFromStack( secondNucleonType );
  }

  /**
   * Create listener to return a particle to the stack.
   */
  private decreaseNucleonNumberListener( firstNucleonType: ParticleType, secondNucleonType?: ParticleType ): void {
    this.returnParticleToStack( firstNucleonType );
    secondNucleonType && this.returnParticleToStack( secondNucleonType );
  }
}

buildANucleus.register( 'NucleonCreatorsNode', NucleonCreatorsNode );
export default NucleonCreatorsNode;
// Copyright 2023, University of Colorado Boulder

/**
 * Spinner buttons at the bottom of the screen that add and remove protons and neutrons from the atom. Buttons are
 * enabled and disabled appropriately.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import ParticleType from '../model/ParticleType.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import { HBox, Node, PressListenerEvent, ProfileColorProperty, Text, VBox } from '../../../../scenery/js/imports.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DoubleArrowButton, { ArrowButtonDirection } from './DoubleArrowButton.js';
import merge from '../../../../phet-core/js/merge.js';
import BANColors from '../BANColors.js';
import BANModel from '../model/BANModel.js';
import ParticleNucleus from '../../chart-intro/model/ParticleNucleus.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import Particle from '../../../../shred/js/model/Particle.js';
import Range from '../../../../dot/js/Range.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import NucleonCreatorNode from './NucleonCreatorNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';

// constants
const MAX_TEXT_WIDTH = 150;
const TOUCH_AREA_Y_DILATION = 3;
const NUCLEON_LABEL_TEXT_OPTIONS = { font: new PhetFont( 20 ), maxWidth: MAX_TEXT_WIDTH };

class NucleonCreatorsNode extends HBox {

  // public for positioning only
  public readonly doubleArrowButtons: Node;
  public readonly protonArrowButtons: Node;
  public readonly neutronArrowButtons: Node;

  // for use in methods
  private readonly protonNumberRange: Range;
  private readonly neutronNumberRange: Range;
  private readonly createParticleFromStack: ( particleType: ParticleType ) => Particle;
  private readonly returnParticleToStack: ( particleType: ParticleType ) => void;
  private model: BANModel<ParticleAtom | ParticleNucleus>;

  // the NucleonCreatorNode for the protons and neutrons
  public readonly protonsCreatorNode: Node;
  public readonly neutronsCreatorNode: Node;

  private readonly particleTransform: ModelViewTransform2;

  public constructor( model: BANModel<ParticleAtom | ParticleNucleus>, getLocalPoint: ( point: Vector2 ) => Vector2,
                      addAndDragParticle: ( event: PressListenerEvent, particle: Particle ) => void,
                      particleTransform: ModelViewTransform2,
                      createParticleFromStack: ( particleType: ParticleType ) => Particle,
                      returnParticleToStack: ( particleType: ParticleType ) => void ) {
    super();

    // create and add the Protons and Neutrons label
    const protonsLabel = new Text( BuildANucleusStrings.protonsStringProperty, NUCLEON_LABEL_TEXT_OPTIONS );

    // create and add the NucleonCreatorNode for the protons
    this.protonsCreatorNode = new NucleonCreatorNode( ParticleType.PROTON, getLocalPoint, addAndDragParticle,
      particleTransform );

    // create and add the NucleonCreatorNode for the neutrons
    this.neutronsCreatorNode = new NucleonCreatorNode( ParticleType.NEUTRON, getLocalPoint, addAndDragParticle,
      particleTransform );
    const neutronsLabel = new Text( BuildANucleusStrings.neutronsUppercaseStringProperty, NUCLEON_LABEL_TEXT_OPTIONS );

    this.model = model;
    this.protonNumberRange = model.protonNumberRange;
    this.neutronNumberRange = model.neutronNumberRange;
    this.createParticleFromStack = createParticleFromStack;
    this.returnParticleToStack = returnParticleToStack;
    this.particleTransform = particleTransform;

    // create the arrow enabled properties
    const protonUpArrowEnabledProperty = this.createArrowEnabledProperty( 'up', ParticleType.PROTON );
    const neutronUpArrowEnabledProperty = this.createArrowEnabledProperty( 'up', ParticleType.NEUTRON );
    const doubleUpArrowEnabledProperty = this.createArrowEnabledProperty( 'up', ParticleType.PROTON, ParticleType.NEUTRON );
    const protonDownArrowEnabledProperty = this.createArrowEnabledProperty( 'down', ParticleType.PROTON );
    const neutronDownArrowEnabledProperty = this.createArrowEnabledProperty( 'down', ParticleType.NEUTRON );
    const doubleDownArrowEnabledProperty = this.createArrowEnabledProperty( 'down', ParticleType.PROTON, ParticleType.NEUTRON );

    // arrow buttons spacing and size options
    const arrowButtonSpacing = 7; // spacing between the 'up' arrow buttons and 'down' arrow buttons
    const arrowButtonOptions = {
      arrowWidth: 14,
      arrowHeight: 14,
      fireOnHold: false,
      touchAreaYDilation: TOUCH_AREA_Y_DILATION
    };

    // function to create the double arrow buttons
    const createDoubleArrowButtons = ( direction: ArrowButtonDirection ): Node => {
      return new DoubleArrowButton( direction,
        direction === 'up' ?
        () => this.increaseNucleonNumberListener( ParticleType.PROTON, ParticleType.NEUTRON ) :
        () => this.decreaseNucleonNumberListener( ParticleType.PROTON, ParticleType.NEUTRON ),
        merge( {
          leftArrowFill: BANColors.protonColorProperty,
          rightArrowFill: BANColors.neutronColorProperty,
          enabledProperty: direction === 'up' ? doubleUpArrowEnabledProperty : doubleDownArrowEnabledProperty
        }, arrowButtonOptions )
      );
    };

    // create and add the double arrow buttons
    this.doubleArrowButtons = new VBox( {
      children: [ createDoubleArrowButtons( 'up' ), createDoubleArrowButtons( 'down' ) ],
      spacing: arrowButtonSpacing
    } );

    // function to create the single arrow buttons
    const createSingleArrowButtons = ( nucleonType: ParticleType, nucleonColorProperty: ProfileColorProperty ): Node => {
      const singleArrowButtonOptions = merge( { arrowFill: nucleonColorProperty }, arrowButtonOptions );
      const upArrowButton = new ArrowButton( 'up', () => this.increaseNucleonNumberListener( nucleonType ),
        merge( {
            enabledProperty: nucleonType === ParticleType.PROTON ? protonUpArrowEnabledProperty : neutronUpArrowEnabledProperty
          },
          singleArrowButtonOptions )
      );
      const downArrowButton = new ArrowButton( 'down', () => this.decreaseNucleonNumberListener( nucleonType ),
        merge( {
            enabledProperty: nucleonType === ParticleType.PROTON ? protonDownArrowEnabledProperty : neutronDownArrowEnabledProperty
          },
          singleArrowButtonOptions )
      );
      return new VBox( {
        justify: 'center',
        children: [ upArrowButton, downArrowButton ],
        spacing: arrowButtonSpacing
      } );
    };

    // create and add the single arrow buttons
    this.protonArrowButtons = createSingleArrowButtons( ParticleType.PROTON, BANColors.protonColorProperty );
    this.neutronArrowButtons = createSingleArrowButtons( ParticleType.NEUTRON, BANColors.neutronColorProperty );

    this.mutate( {
      align: 'bottom',
      spacing: 5,
      stretch: true,
      children: [
        this.protonArrowButtons,
        new VBox( {
          children: [
            this.protonsCreatorNode,
            protonsLabel
          ],
          layoutOptions: {
            minContentWidth: MAX_TEXT_WIDTH
          }
        } ),
        this.doubleArrowButtons,
        new VBox( {
          children: [
            this.neutronsCreatorNode,
            neutronsLabel
          ],
          layoutOptions: {
            minContentWidth: MAX_TEXT_WIDTH
          }
        } ),
        this.neutronArrowButtons
      ]
    } );
  }

  public get protonsCreatorNodeModelCenter(): Vector2 {

    // convert creator node center into the coordinate frame of whoever is using this NucleonCreatorsNode
    const globalProtonsCreatorNodeViewCenter = this.globalToParentPoint(
      this.protonsCreatorNode.parentToGlobalPoint( this.protonsCreatorNode.center ) );

    return this.particleTransform.viewToModelPosition( globalProtonsCreatorNodeViewCenter );
  }

  public get neutronsCreatorNodeModelCenter(): Vector2 {

    // convert creator node center into the coordinate frame of whoever is using this NucleonCreatorsNode
    const globalNeutronsCreatorNodeCenter = this.globalToParentPoint(
      this.neutronsCreatorNode.parentToGlobalPoint( this.neutronsCreatorNode.center ) );

    return this.particleTransform.viewToModelPosition( globalNeutronsCreatorNodeCenter );
  }

  private createArrowEnabledProperty( direction: ArrowButtonDirection, firstParticleType: ParticleType, secondParticleType?: ParticleType ): TReadOnlyProperty<boolean> {

    // function to create the arrow enabled properties
    return new DerivedProperty( [
      this.model.particleAtom.protonCountProperty,
      this.model.particleAtom.neutronCountProperty,
      this.model.incomingProtons.lengthProperty,
      this.model.incomingNeutrons.lengthProperty,
      this.model.userControlledProtons.lengthProperty,
      this.model.userControlledNeutrons.lengthProperty
    ], ( atomProtonNumber, atomNeutronNumber, incomingProtonsNumber, incomingNeutronsNumber,
         userControlledProtonNumber, userControlledNeutronNumber ) => {

      const protonNumber = atomProtonNumber + incomingProtonsNumber + userControlledProtonNumber;
      const neutronNumber = atomNeutronNumber + incomingNeutronsNumber + userControlledNeutronNumber;
      const userControlledNucleonNumber = userControlledNeutronNumber + userControlledProtonNumber;
      const doesNuclideExist = AtomIdentifier.doesExist( protonNumber, neutronNumber );
      const massNumber = atomProtonNumber + atomNeutronNumber;

      // Disable all buttons if the nuclide doesn't exist and one of the two cases:
      // Something is being user controlled OR Particle Atom is not empty
      if ( !doesNuclideExist && ( massNumber !== 0 || userControlledNucleonNumber !== 0 ) ) {

        // disable all arrow buttons if the nuclide does not exist
        NucleonCreatorsNode.toggleCreatorNodeEnabled( this.protonsCreatorNode, false );
        NucleonCreatorsNode.toggleCreatorNodeEnabled( this.neutronsCreatorNode, false );
        return false;
      }
      else {
        // Else handle each enabled case specifically

        // Turn creator nodes back on to a default, (enabled:true) state
        NucleonCreatorsNode.toggleCreatorNodeEnabled( this.protonsCreatorNode, true );
        NucleonCreatorsNode.toggleCreatorNodeEnabled( this.neutronsCreatorNode, true );

        // true when the potential spot to go to does not "exist". If there is a second particle type, check by
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

        // If there are no atoms actually in the atom (only potentially animating to the atom), see https://github.com/phetsims/build-a-nucleus/issues/74
        if ( direction === 'down' && _.some( [ firstParticleType, secondParticleType ], particleType => {
          return ( particleType === ParticleType.NEUTRON && atomNeutronNumber === 0 ) ||
                 ( particleType === ParticleType.PROTON && atomProtonNumber === 0 );
        } ) ) {
          return false;
        }

        // Finally, disable any buttons that are at the range bound for that button.
        const firstTypeNotAtRangeBound = this.isNucleonNumberNotAtRangeBounds( direction, firstParticleType, protonNumber, neutronNumber );
        return secondParticleType ?
               firstTypeNotAtRangeBound && this.isNucleonNumberNotAtRangeBounds( direction, secondParticleType, protonNumber, neutronNumber ) :
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
  private static hasNextIso( direction: ArrowButtonDirection, particleType: ParticleType | 'both', protonNumber: number, neutronNumber: number ): boolean {

    if ( direction === 'up' ) {

      // proton up arrow
      if ( particleType === ParticleType.PROTON ) {
        return AtomIdentifier.doesNextIsotoneExist( protonNumber, neutronNumber );
      }
      else if ( particleType === ParticleType.NEUTRON ) {

        // neutron up arrow
        return AtomIdentifier.doesNextIsotopeExist( protonNumber, neutronNumber );
      }
      else {
        assert && assert( particleType === 'both', 'all cases covered' );
        return AtomIdentifier.doesNextNuclideExist( protonNumber, neutronNumber );
      }
    }
    else {
      //  direction === 'down'

      // proton down arrow
      if ( particleType === ParticleType.PROTON ) {
        return AtomIdentifier.doesPreviousIsotoneExist( protonNumber, neutronNumber ) || ( neutronNumber === 0 && protonNumber === 1 );
      }
      else if ( particleType === ParticleType.NEUTRON ) {

        // neutron down arrow
        return AtomIdentifier.doesPreviousIsotopeExist( protonNumber, neutronNumber ) || ( neutronNumber === 1 && protonNumber === 0 );
      }
      else {
        assert && assert( particleType === 'both', 'all cases covered' );
        return AtomIdentifier.doesPreviousNuclideExist( protonNumber, neutronNumber ) || ( neutronNumber === 1 && protonNumber === 1 );
      }
    }
  }

  /**
   * Function returns whether true when the protonNumber or neutronNumber is not at its min or max range (depending on
   * the direction of the button).
   */
  private isNucleonNumberNotAtRangeBounds( direction: ArrowButtonDirection, particleType: ParticleType, protonNumber: number, neutronNumber: number ): boolean {
    if ( direction === 'up' ) {

      // proton up arrow
      if ( particleType === ParticleType.PROTON ) {
        return protonNumber !== this.protonNumberRange.max;
      }

      // neutron up arrow
      return neutronNumber !== this.neutronNumberRange.max;
    }
    else {
      //  direction === 'down'

      // proton down arrow
      if ( particleType === ParticleType.PROTON ) {
        return protonNumber !== this.protonNumberRange.min;
      }

      // neutron down arrow
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
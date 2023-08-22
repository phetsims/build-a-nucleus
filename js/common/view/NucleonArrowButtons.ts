// Copyright 2022-2023, University of Colorado Boulder

/**
 * Spinner buttons at the bottom of the screen that add and remove protons and neutrons from the atom. Buttons are
 * enabled and disabled appropriately.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import ParticleType from '../model/ParticleType.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import { Node, ProfileColorProperty, VBox } from '../../../../scenery/js/imports.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DoubleArrowButton, { DoubleArrowButtonDirection } from './DoubleArrowButton.js';
import merge from '../../../../phet-core/js/merge.js';
import BANColors from '../BANColors.js';
import BANModel from '../model/BANModel.js';
import ParticleNucleus from '../../chart-intro/model/ParticleNucleus.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import Particle from '../../../../shred/js/model/Particle.js';
import Range from '../../../../dot/js/Range.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

// constants
const TOUCH_AREA_Y_DILATION = 3;

class NucleonArrowButtons extends Node {

  // public for positioning only
  public readonly doubleArrowButtons: Node;
  public readonly protonArrowButtons: Node;
  public readonly neutronArrowButtons: Node;

  // for use in methods
  private readonly protonNumberRange: Range;
  private readonly neutronNumberRange: Range;
  private readonly doubleArrowButtonClickedBooleanProperty: BooleanProperty;
  private readonly createParticleFromStack: ( particleType: ParticleType ) => Particle;
  private readonly returnParticleToStack: ( particleType: ParticleType ) => void;

  public constructor( model: BANModel<ParticleAtom | ParticleNucleus>, protonsCreatorNode: Node,
                      neutronsCreatorNode: Node,
                      createParticleFromStack: ( particleType: ParticleType ) => Particle,
                      returnParticleToStack: ( particleType: ParticleType ) => void ) {
    super();

    this.protonNumberRange = model.protonNumberRange;
    this.neutronNumberRange = model.neutronNumberRange;
    this.doubleArrowButtonClickedBooleanProperty = model.doubleArrowButtonClickedBooleanProperty;
    this.createParticleFromStack = createParticleFromStack;
    this.returnParticleToStack = returnParticleToStack;

    // function to create the arrow enabled properties
    const createArrowEnabledProperty = ( direction: string, firstParticleType: ParticleType, secondParticleType?: ParticleType ) => {
      return new DerivedProperty( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty,
          model.incomingProtons.lengthProperty, model.incomingNeutrons.lengthProperty,
          model.userControlledProtons.lengthProperty, model.userControlledNeutrons.lengthProperty ],
        ( atomProtonNumber, atomNeutronNumber, incomingProtonsNumber, incomingNeutronsNumber,
          userControlledProtonNumber, userControlledNeutronNumber ) => {

          const protonNumber = atomProtonNumber + incomingProtonsNumber + userControlledProtonNumber;
          const neutronNumber = atomNeutronNumber + incomingNeutronsNumber + userControlledNeutronNumber;
          const userControlledNucleonNumber = userControlledNeutronNumber + userControlledProtonNumber;
          const doesNuclideExist = AtomIdentifier.doesExist( protonNumber, neutronNumber );

          if ( !doesNuclideExist &&
               ( model.particleAtom.massNumberProperty.value !== 0 || userControlledNucleonNumber !== 0 ) ) {

            // disable all arrow buttons if the nuclide does not exist
            NucleonArrowButtons.toggleCreatorNodeEnabled( protonsCreatorNode, false );
            NucleonArrowButtons.toggleCreatorNodeEnabled( neutronsCreatorNode, false );
            return false;
          }
          else {
            NucleonArrowButtons.toggleCreatorNodeEnabled( protonsCreatorNode, true );
            NucleonArrowButtons.toggleCreatorNodeEnabled( neutronsCreatorNode, true );

            const nextOrPreviousIsoExists = secondParticleType ?
                                            !NucleonArrowButtons.getNextOrPreviousIso( direction, firstParticleType, protonNumber, neutronNumber ) ||
                                            !NucleonArrowButtons.getNextOrPreviousIso( direction, secondParticleType, protonNumber, neutronNumber ) :
                                            !NucleonArrowButtons.getNextOrPreviousIso( direction, firstParticleType, protonNumber, neutronNumber );

            const doesNuclideExist = AtomIdentifier.doesExist( protonNumber, neutronNumber );
            const nuclideExistsBoolean = direction === 'up' ? !doesNuclideExist : doesNuclideExist;

            const doesPreviousNuclideExist = secondParticleType && direction === 'down' ?
                                             !AtomIdentifier.doesPreviousNuclideExist( protonNumber, neutronNumber ) :
                                             nextOrPreviousIsoExists;

            if ( nuclideExistsBoolean && doesPreviousNuclideExist ) {
              return false;
            }

            // If there are no atoms actually in the atom (only potentially animating to the atom), see https://github.com/phetsims/build-a-nucleus/issues/74
            if ( direction === 'down' && _.some( [ firstParticleType, secondParticleType ], particleType => {
              return ( particleType === ParticleType.NEUTRON && atomNeutronNumber === 0 ) ||
                     ( particleType === ParticleType.PROTON && atomProtonNumber === 0 );
            } ) ) {
              return false;
            }

            return secondParticleType ? this.isNucleonNumberAtRangeBounds( direction, firstParticleType, protonNumber, neutronNumber ) &&
                                        this.isNucleonNumberAtRangeBounds( direction, secondParticleType, protonNumber, neutronNumber ) :
                   this.isNucleonNumberAtRangeBounds( direction, firstParticleType, protonNumber, neutronNumber );
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

    // arrow buttons spacing and size options
    const arrowButtonSpacing = 7; // spacing between the 'up' arrow buttons and 'down' arrow buttons
    const arrowButtonOptions = {
      arrowWidth: 14,
      arrowHeight: 14,
      fireOnHold: false,
      touchAreaYDilation: TOUCH_AREA_Y_DILATION
    };

    // function to create the double arrow buttons
    const createDoubleArrowButtons = ( direction: DoubleArrowButtonDirection ): Node => {
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
    this.addChild( this.doubleArrowButtons );

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
        children: [ upArrowButton, downArrowButton ],
        spacing: arrowButtonSpacing
      } );
    };

    // create and add the single arrow buttons
    this.protonArrowButtons = createSingleArrowButtons( ParticleType.PROTON, BANColors.protonColorProperty );
    this.addChild( this.protonArrowButtons );
    this.neutronArrowButtons = createSingleArrowButtons( ParticleType.NEUTRON, BANColors.neutronColorProperty );
    this.addChild( this.neutronArrowButtons );
  }

  /**
   * Return if any nuclides exist above, below, or to the left or right of a given nuclide.
   */
  private static getNextOrPreviousIso( direction: string, particleType: ParticleType, protonNumber: number, neutronNumber: number ): boolean {

    if ( direction === 'up' ) {

      // proton up arrow
      if ( particleType === ParticleType.PROTON ) {
        return AtomIdentifier.doesNextIsotoneExist( protonNumber, neutronNumber );
      }

      // neutron up arrow
      return AtomIdentifier.doesNextIsotopeExist( protonNumber, neutronNumber );
    }

    // proton down arrow
    if ( particleType === ParticleType.PROTON ) {
      return AtomIdentifier.doesPreviousIsotoneExist( protonNumber, neutronNumber );
    }

    // neutron down arrow
    return AtomIdentifier.doesPreviousIsotopeExist( protonNumber, neutronNumber );
  }

  /**
   * Function returns whether the protonNumber or neutronNumber is at its min or max range
   */
  private isNucleonNumberAtRangeBounds( direction: string, particleType: ParticleType, protonNumber: number, neutronNumber: number ): boolean {
    if ( direction === 'up' ) {

      // proton up arrow
      if ( particleType === ParticleType.PROTON ) {
        return protonNumber !== this.protonNumberRange.max;
      }

      // neutron up arrow
      return neutronNumber !== this.neutronNumberRange.max;
    }

    // proton down arrow
    if ( particleType === ParticleType.PROTON ) {
      return protonNumber !== this.protonNumberRange.min;
    }

    // neutron down arrow
    return neutronNumber !== this.neutronNumberRange.min;
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
    if ( secondNucleonType ) {
      this.createParticleFromStack( secondNucleonType );
    }

    // keep track of when a double arrow button was clicked
    this.doubleArrowButtonClickedBooleanProperty.value = !!secondNucleonType;
  }

  /**
   * Create listener to return a particle to the stack.
   */
  private decreaseNucleonNumberListener( firstNucleonType: ParticleType, secondNucleonType?: ParticleType ): void {
    this.returnParticleToStack( firstNucleonType );
    if ( secondNucleonType ) {
      this.returnParticleToStack( secondNucleonType );
    }

    // keep track of when a double arrow button was clicked
    this.doubleArrowButtonClickedBooleanProperty.value = !!secondNucleonType;
  }
}

buildANucleus.register( 'NucleonArrowButtons', NucleonArrowButtons );
export default NucleonArrowButtons;
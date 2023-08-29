// Copyright 2023, University of Colorado Boulder

/**
 * Text responsible for creating the logic for how the half life of any element will be displayed.
 * @author Luisa Vargas
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { Color, Text, TextOptions } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import BANConstants from '../BANConstants.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

export type ElementNameTextOptions = TextOptions;

export default class ElementNameText extends Text {

  // The contents of the formatted display string for the current Element of the atom. Including if it does not form.
  public readonly elementNameStringProperty: TReadOnlyProperty<string>;

  public constructor( protonCountProperty: TReadOnlyProperty<number>,
                      neutronCountProperty: TReadOnlyProperty<number>,
                      nuclideExistsProperty: TReadOnlyProperty<boolean>,
                      providedOptions?: ElementNameTextOptions ) {

    const options =
      optionize<ElementNameTextOptions, EmptySelfOptions, TextOptions>()( {
        font: BANConstants.REGULAR_FONT,
        fill: Color.RED,
        maxWidth: BANConstants.ELEMENT_NAME_MAX_WIDTH
      }, providedOptions );

    const elementNameStringProperty = new DerivedStringProperty( [
      protonCountProperty,
      neutronCountProperty,
      nuclideExistsProperty,

      // We need to update whenever any of these strings change, to support Dynamic Locale.
      BuildANucleusStrings.nameMassPatternStringProperty,
      BuildANucleusStrings.neutronsLowercaseStringProperty,
      BuildANucleusStrings.elementDoesNotFormPatternStringProperty,
      BuildANucleusStrings.doesNotFormStringProperty,
      BuildANucleusStrings.zeroParticlesDoesNotFormPatternStringProperty,
      BuildANucleusStrings.neutronLowercaseStringProperty,
      BuildANucleusStrings.clusterOfNeutronsPatternStringProperty
    ], ( protonNumber, neutronNumber, doesNuclideExist ) => {
      let name = AtomIdentifier.getName( protonNumber );
      const massNumber = protonNumber + neutronNumber;

      const massNumberString = massNumber.toString();

      const nameMassString = StringUtils.fillIn( BuildANucleusStrings.nameMassPatternStringProperty, {
        name: name,
        mass: massNumberString
      } );

      // Show "{name} - {massNumber} does not form" in the elementName's place when a nuclide that does not exist on Earth is built.
      if ( !doesNuclideExist && massNumber !== 0 ) {

        if ( name.length === 0 ) {
          // No protons.
          name = StringUtils.fillIn( BuildANucleusStrings.zeroParticlesDoesNotFormPatternStringProperty, {
            mass: massNumberString,
            particleType: BuildANucleusStrings.neutronsLowercaseStringProperty,
            doesNotForm: BuildANucleusStrings.doesNotFormStringProperty
          } );
        }
        else {
          name = StringUtils.fillIn( BuildANucleusStrings.elementDoesNotFormPatternStringProperty, {
            nameMass: nameMassString,
            doesNotForm: BuildANucleusStrings.doesNotFormStringProperty
          } );
        }
      }
      else if ( name.length === 0 ) {
        // No protons.

        if ( neutronNumber === 0 ) {
          // No neutrons.
          name = '';
        }
        else if ( neutronNumber === 1 ) {
          // Only one neutron.
          name = StringUtils.fillIn( BuildANucleusStrings.zeroParticlesDoesNotFormPatternStringProperty, {
            mass: neutronNumber,
            particleType: BuildANucleusStrings.neutronLowercaseStringProperty,
            doesNotForm: ''
          } );
        }
        else {
          // Multiple neutrons.
          name = StringUtils.fillIn( BuildANucleusStrings.clusterOfNeutronsPatternStringProperty, {
            neutronNumber: neutronNumber
          } );
        }
      }
      else {
        name = nameMassString;
      }
      return name;
    } );

    super( elementNameStringProperty, options );
    this.elementNameStringProperty = elementNameStringProperty;
  }
}

buildANucleus.register( 'ElementNameText', ElementNameText );
// Copyright 2022-2023, University of Colorado Boulder

/**
 * Text responsible for creating the logic for how the stability of any nuclide is displayed.
 *
 * @author Luisa Vargas
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import buildANucleus from '../../buildANucleus.js';
import { Text, TextOptions } from '../../../../scenery/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import BANConstants from '../../common/BANConstants.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';

type StabilityTextOptions = TextOptions;

class StabilityIndicatorText extends Text {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      doesNuclideExistBooleanProperty: TReadOnlyProperty<boolean>,
                      providedOptions?: StabilityTextOptions ) {

    const options = optionize<StabilityTextOptions, EmptySelfOptions, TextOptions>()( {
      font: BANConstants.REGULAR_FONT,
      fill: 'black',
      visible: true,
      maxWidth: 225
    }, providedOptions );

    const stabilityStringProperty = new DerivedStringProperty(
      [ protonCountProperty, neutronCountProperty,

        // We need to update whenever any of these strings change, to support Dynamic Locale
        BuildANucleusStrings.stableStringProperty,
        BuildANucleusStrings.unstableStringProperty
      ],
      ( protonNumber, neutronNumber ) => {
        if ( protonNumber === 0 && neutronNumber === 0 ) {
          return '';
        }
        else if ( AtomIdentifier.isStable( protonNumber, neutronNumber ) ) {
          return BuildANucleusStrings.stableStringProperty.value;
        }
        else {
          return BuildANucleusStrings.unstableStringProperty.value;
        }
      } );

    super( stabilityStringProperty, options );

    // update stability string visibility
    doesNuclideExistBooleanProperty.link( ( visible: boolean ) => {
      this.visible = visible;
    } );
  }
}

buildANucleus.register( 'StabilityIndicatorText', StabilityIndicatorText );
export default StabilityIndicatorText;
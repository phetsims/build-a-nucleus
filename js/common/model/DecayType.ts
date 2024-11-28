// Copyright 2022-2024, University of Colorado Boulder

/**
 * DecayType identifies the decay types of nuclides.
 *
 * @author Luisa Vargas
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import { ProfileColorProperty } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../BANColors.js';

class DecayType extends EnumerationValue {

  public static readonly ALPHA_DECAY = new DecayType(
    BuildANucleusStrings.alphaDecayStringProperty, BANColors.alphaColorProperty, 4, 2, 'α' );

  public static readonly BETA_MINUS_DECAY = new DecayType(
    BuildANucleusStrings.betaMinusDecayStringProperty, BANColors.betaMinusColorProperty, 0, -1, 'β' );

  public static readonly BETA_PLUS_DECAY = new DecayType(
    BuildANucleusStrings.betaPlusDecayStringProperty, BANColors.betaPlusColorProperty, 0, 1, 'β' );

  public static readonly PROTON_EMISSION = new DecayType(
    BuildANucleusStrings.protonEmissionStringProperty, BANColors.protonEmissionColorProperty, 1, 1, 'p' );

  public static readonly NEUTRON_EMISSION = new DecayType(
    BuildANucleusStrings.neutronEmissionStringProperty, BANColors.neutronEmissionColorProperty, 1, 0, 'n' );

  public static readonly enumeration = new Enumeration( DecayType );

  public constructor(
    public readonly labelStringProperty: TReadOnlyProperty<string>,
    public readonly colorProperty: ProfileColorProperty,
    public readonly massNumber: number,
    public readonly protonNumber: number,
    public readonly decaySymbol: string ) {
    super();
  }
}

buildANucleus.register( 'DecayType', DecayType );
export default DecayType;
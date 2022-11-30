// Copyright 2022, University of Colorado Boulder

/**
 * DecayType identifies the decay types of nuclides.
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import buildANucleus from '../../buildANucleus.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import { ProfileColorProperty } from '../../../../scenery/js/imports.js';
import BANColors from '../BANColors.js';

class DecayType extends EnumerationValue {

  public static ALPHA_DECAY = new DecayType( BuildANucleusStrings.alphaDecay, BANColors.alphaColorProperty );

  public static BETA_MINUS_DECAY = new DecayType( BuildANucleusStrings.betaMinusDecay, BANColors.betaMinusColorProperty );

  public static BETA_PLUS_DECAY = new DecayType( BuildANucleusStrings.betaPlusDecay, BANColors.betaPlusColorProperty );

  public static PROTON_EMISSION = new DecayType( BuildANucleusStrings.protonEmission, BANColors.protonEmissionColorProperty );

  public static NEUTRON_EMISSION = new DecayType( BuildANucleusStrings.neutronEmission, BANColors.neutronEmissionColorProperty );

  public static enumeration = new Enumeration( DecayType );

  public readonly label: string;
  public readonly colorProperty: ProfileColorProperty;

  public constructor( label: string, colorProperty: ProfileColorProperty ) {
    super();

    this.label = label;
    this.colorProperty = colorProperty;

  }
}

buildANucleus.register( 'DecayType', DecayType );
export default DecayType;
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

class DecayType extends EnumerationValue {

  public static ALPHA_DECAY = new DecayType( BuildANucleusStrings.alphaDecay );

  public static BETA_MINUS_DECAY = new DecayType( BuildANucleusStrings.betaMinusDecay );

  public static BETA_PLUS_DECAY = new DecayType( BuildANucleusStrings.betaPlusDecay );

  public static PROTON_EMISSION = new DecayType( BuildANucleusStrings.protonEmission );

  public static NEUTRON_EMISSION = new DecayType( BuildANucleusStrings.neutronEmission );

  public static enumeration = new Enumeration( DecayType );

  public readonly label: string;

  public constructor( label: string ) {
    super();

    this.label = label;

  }
}

buildANucleus.register( 'DecayType', DecayType );
export default DecayType;
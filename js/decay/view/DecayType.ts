// Copyright 2022, University of Colorado Boulder

/**
 * DecayType identifies the decay types of nuclides.
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import buildANucleus from '../../buildANucleus.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';

class DecayType extends EnumerationValue {

  static ALPHA_DECAY = new DecayType( buildANucleusStrings.alphaDecay );

  static BETA_MINUS_DECAY = new DecayType( buildANucleusStrings.betaMinusDecay );

  static BETA_PLUS_DECAY = new DecayType( buildANucleusStrings.betaPlusDecay );

  static PROTON_EMISSION = new DecayType( buildANucleusStrings.protonEmission );

  static NEUTRON_EMISSION = new DecayType( buildANucleusStrings.neutronEmission );

  static enumeration = new Enumeration( DecayType );

  public readonly label: string;

  constructor( label: string ) {
    super();

    this.label = label;

  }
}

buildANucleus.register( 'DecayType', DecayType );
export default DecayType;
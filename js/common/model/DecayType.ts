// Copyright 2022-2023, University of Colorado Boulder

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

  public static readonly ALPHA_DECAY = new DecayType( BuildANucleusStrings.alphaDecay, BANColors.alphaColorProperty, 4, 2, 'α' );

  public static readonly BETA_MINUS_DECAY = new DecayType( BuildANucleusStrings.betaMinusDecay, BANColors.betaMinusColorProperty, 0, -1, 'β' );

  public static readonly BETA_PLUS_DECAY = new DecayType( BuildANucleusStrings.betaPlusDecay, BANColors.betaPlusColorProperty, 0, 1, 'β' );

  public static readonly PROTON_EMISSION = new DecayType( BuildANucleusStrings.protonEmission, BANColors.protonEmissionColorProperty, 1, 1, 'p' );

  public static readonly NEUTRON_EMISSION = new DecayType( BuildANucleusStrings.neutronEmission, BANColors.neutronEmissionColorProperty, 1, 0, 'n' );

  public static readonly enumeration = new Enumeration( DecayType );

  public readonly label: string;
  public readonly colorProperty: ProfileColorProperty;
  public readonly massNumber: number;
  public readonly protonCount: number;
  public readonly decaySymbol: string;

  public constructor( label: string, colorProperty: ProfileColorProperty, massNumber: number, protonCount: number, decaySymbol: string ) {
    super();

    this.label = label;
    this.colorProperty = colorProperty;
    this.massNumber = massNumber;
    this.protonCount = protonCount;
    this.decaySymbol = decaySymbol;

  }
}

buildANucleus.register( 'DecayType', DecayType );
export default DecayType;
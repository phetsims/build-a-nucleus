// Copyright 2022-2026, University of Colorado Boulder

/**
 * DecayType identifies the decay types of nuclides.
 *
 * @author Luisa Vargas
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import ProfileColorProperty from '../../../../scenery/js/util/ProfileColorProperty.js';
import type { DecayType } from '../../../../shred/js/AtomInfoUtils.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../BANColors.js';

class BANDecayType extends EnumerationValue {

  public static readonly ALPHA_DECAY = new BANDecayType(
    BuildANucleusStrings.alphaDecayStringProperty, BANColors.alphaColorProperty, 4, 2, 'α' );

  public static readonly BETA_MINUS_DECAY = new BANDecayType(
    BuildANucleusStrings.betaMinusDecayStringProperty, BANColors.betaMinusColorProperty, 0, -1, 'β' );

  public static readonly BETA_PLUS_DECAY = new BANDecayType(
    BuildANucleusStrings.betaPlusDecayStringProperty, BANColors.betaPlusColorProperty, 0, 1, 'β' );

  public static readonly PROTON_EMISSION = new BANDecayType(
    BuildANucleusStrings.protonEmissionStringProperty, BANColors.protonEmissionColorProperty, 1, 1, 'p' );

  public static readonly NEUTRON_EMISSION = new BANDecayType(
    BuildANucleusStrings.neutronEmissionStringProperty, BANColors.neutronEmissionColorProperty, 1, 0, 'n' );

  public static readonly enumeration = new Enumeration( BANDecayType );

  /**
   * Maps decay types from shred to the corresponding BANDecayType entry.
   */
  public static fromDecayType( decayType: DecayType ): BANDecayType {
    let banDecayType: BANDecayType;
    switch( decayType ) {
      case 'alphaDecay':
        banDecayType = BANDecayType.ALPHA_DECAY;
        break;
      case 'betaMinusDecay':
        banDecayType = BANDecayType.BETA_MINUS_DECAY;
        break;
      case 'betaPlusDecay':
        banDecayType = BANDecayType.BETA_PLUS_DECAY;
        break;
      case 'protonEmission':
        banDecayType = BANDecayType.PROTON_EMISSION;
        break;
      case 'neutronEmission':
        banDecayType = BANDecayType.NEUTRON_EMISSION;
        break;
      default:
        affirm( false, `Unsupported decay type: ${decayType}` );
    }
    return banDecayType;
  }

  public constructor(
    public readonly labelStringProperty: TReadOnlyProperty<string>,
    public readonly colorProperty: ProfileColorProperty,
    public readonly massNumber: number,
    public readonly protonNumber: number,
    public readonly decaySymbol: string ) {
    super();
  }
}

export default BANDecayType;

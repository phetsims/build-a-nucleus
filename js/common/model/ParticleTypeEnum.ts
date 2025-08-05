// Copyright 2022-2025, University of Colorado Boulder

/**
 * ParticleTypeEnum is an enumeration type that identifies the particle types and associates these names with other
 * information such as the strings to use for them and colors to use when rendering them.
 *
 * @author Luisa Vargas
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import ProfileColorProperty from '../../../../scenery/js/util/ProfileColorProperty.js';
import { ParticleTypeString } from '../../../../shred/js/model/Particle.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../BANColors.js';

class ParticleTypeEnum extends EnumerationValue {

  public static readonly PROTON = new ParticleTypeEnum(
    'proton', BuildANucleusStrings.protonStringProperty, BANColors.protonColorProperty );

  public static readonly NEUTRON = new ParticleTypeEnum(
    'neutron', BuildANucleusStrings.neutronUppercaseStringProperty, BANColors.neutronColorProperty );

  public static readonly ELECTRON = new ParticleTypeEnum(
    'electron', BuildANucleusStrings.electronStringProperty, BANColors.electronColorProperty );

  public static readonly POSITRON = new ParticleTypeEnum(
    'positron', BuildANucleusStrings.positronStringProperty, BANColors.positronColorProperty );

  public static readonly enumeration = new Enumeration( ParticleTypeEnum );

  public constructor( public readonly particleTypeString: ParticleTypeString,
                      public readonly labelStringProperty: TReadOnlyProperty<string>,
                      public readonly colorProperty: ProfileColorProperty ) {
    super();
  }

  /**
   * Convert string particle type to a ParticleType.
   */
  public static getParticleTypeFromStringType( particleTypeString: ParticleTypeString ): ParticleTypeEnum {
    const particleType = particleTypeString === ParticleTypeEnum.PROTON.particleTypeString ? ParticleTypeEnum.PROTON :
                         particleTypeString === ParticleTypeEnum.NEUTRON.particleTypeString ? ParticleTypeEnum.NEUTRON :
                         particleTypeString === ParticleTypeEnum.ELECTRON.particleTypeString ? ParticleTypeEnum.ELECTRON :
                         particleTypeString === ParticleTypeEnum.POSITRON.particleTypeString ? ParticleTypeEnum.POSITRON :
                         null;
    assert && assert( particleType !== null, `Particle type ${particleTypeString} is not a valid particle type.` );
    return particleType!;
  }
}

buildANucleus.register( 'ParticleTypeEnum', ParticleTypeEnum );
export default ParticleTypeEnum;
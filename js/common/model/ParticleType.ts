// Copyright 2022-2024, University of Colorado Boulder

/**
 * ParticleType identifies the particle types and their colors.
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

class ParticleType extends EnumerationValue {

  public static readonly PROTON = new ParticleType(
    'proton', BuildANucleusStrings.protonStringProperty, BANColors.protonColorProperty );

  public static readonly NEUTRON = new ParticleType(
    'neutron', BuildANucleusStrings.neutronUppercaseStringProperty, BANColors.neutronColorProperty );

  public static readonly ELECTRON = new ParticleType(
    'electron', BuildANucleusStrings.electronStringProperty, BANColors.electronColorProperty );

  public static readonly POSITRON = new ParticleType(
    'positron', BuildANucleusStrings.positronStringProperty, BANColors.positronColorProperty );

  public static readonly enumeration = new Enumeration( ParticleType );

  public constructor( public readonly particleTypeString: ParticleTypeString,
                      public readonly labelStringProperty: TReadOnlyProperty<string>,
                      public readonly colorProperty: ProfileColorProperty ) {
    super();
  }

  /**
   * Convert string particle type to a ParticleType.
   */
  public static getParticleTypeFromStringType( particleTypeString: ParticleTypeString ): ParticleType {
    const particleType = particleTypeString === ParticleType.PROTON.particleTypeString ? ParticleType.PROTON :
                         particleTypeString === ParticleType.NEUTRON.particleTypeString ? ParticleType.NEUTRON :
                         particleTypeString === ParticleType.ELECTRON.particleTypeString ? ParticleType.ELECTRON :
                         particleTypeString === ParticleType.POSITRON.particleTypeString ? ParticleType.POSITRON :
                         null;
    assert && assert( particleType !== null, `Particle type ${particleTypeString} is not a valid particle type.` );
    return particleType!;
  }
}

buildANucleus.register( 'ParticleType', ParticleType );
export default ParticleType;
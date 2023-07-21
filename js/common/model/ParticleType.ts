// Copyright 2022-2023, University of Colorado Boulder

/**
 * ParticleType identifies the particle types and their colors.
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import buildANucleus from '../../buildANucleus.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import { ProfileColorProperty } from '../../../../scenery/js/imports.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../BANColors.js';
import { ParticleTypeString } from '../../../../shred/js/model/ParticleAtom.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

class ParticleType extends EnumerationValue {

  public static readonly PROTON = new ParticleType( 'proton', BuildANucleusStrings.protonStringProperty, BANColors.protonColorProperty );

  public static readonly NEUTRON = new ParticleType( 'neutron', BuildANucleusStrings.neutronUppercaseStringProperty, BANColors.neutronColorProperty );

  public static readonly ELECTRON = new ParticleType( 'electron', BuildANucleusStrings.electronStringProperty, BANColors.electronColorProperty );

  public static readonly POSITRON = new ParticleType( 'positron', BuildANucleusStrings.positronStringProperty, BANColors.positronColorProperty );

  public static readonly enumeration = new Enumeration( ParticleType );

  public constructor( public readonly particleTypeString: ParticleTypeString,
                      public readonly labelStringProperty: TReadOnlyProperty<string>,
                      public readonly colorProperty: ProfileColorProperty ) {
    super();

  }
}

buildANucleus.register( 'ParticleType', ParticleType );
export default ParticleType;
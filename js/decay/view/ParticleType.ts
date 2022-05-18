// Copyright 2022, University of Colorado Boulder

/**
 * ParticleType identifies the particle types and their colors.
 * 
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import buildANucleus from '../../buildANucleus.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import { ProfileColorProperty } from '../../../../scenery/js/imports.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';

class ParticleType extends EnumerationValue {

  static PROTON = new ParticleType( buildANucleusStrings.proton, BANColors.protonColorProperty );

  static NEUTRON = new ParticleType( buildANucleusStrings.neutronUppercase, BANColors.neutronColorProperty );

  static ELECTRON = new ParticleType( buildANucleusStrings.electron, BANColors.electronColorProperty );

  static POSITRON = new ParticleType( buildANucleusStrings.positron, BANColors.positronColorProperty );

  static enumeration = new Enumeration( ParticleType );

  public readonly label: string;
  public readonly color: ProfileColorProperty;

   constructor( label: string, color: ProfileColorProperty ) {
     super();

     this.label = label;
     this.color = color;

   }
}

buildANucleus.register( 'ParticleType', ParticleType );
export default ParticleType;
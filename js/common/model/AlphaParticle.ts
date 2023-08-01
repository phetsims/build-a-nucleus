// Copyright 2023, University of Colorado Boulder

/**
 * A model element that represents an alpha particle, which is made up of 2 protons and 2 neutrons.
 *
 * @author Luisa Vargas
 */

import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import buildANucleus from '../../buildANucleus.js';

class AlphaParticle extends ParticleAtom {
  public velocity: number;
  public readonly numberOfAllowedProtons: number;
  public readonly numberOfAllowedNeutrons: number;

  public constructor() {
    super();

    this.velocity = 0;
    this.numberOfAllowedProtons = 2;
    this.numberOfAllowedNeutrons = 2;
  }
}

buildANucleus.register( 'AlphaParticle', AlphaParticle );
export default AlphaParticle;
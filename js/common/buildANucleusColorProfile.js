// Copyright 2021, University of Colorado Boulder

/**
 * buildANucleusColorProfile defines the color profile for this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ProfileColorProperty from '../../../scenery/js/util/ProfileColorProperty.js';
import buildANucleus from '../buildANucleus.js';

class BuildANucleusColorProfile {
  constructor() {
    // Background color that for screens in this sim
    this.screenBackgroundColorProperty = new ProfileColorProperty( 'screenBackground', {
      default: 'white'
    } );
  }
}

const buildANucleusColorProfile = new BuildANucleusColorProfile();

buildANucleus.register( 'buildANucleusColorProfile', buildANucleusColorProfile );

export default buildANucleusColorProfile;
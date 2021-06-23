// Copyright 2021, University of Colorado Boulder

/**
 * BuildANucleusColorProfile defines the color profile for this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ColorProfile from '../../../scenery-phet/js/ColorProfile.js';
import buildANucleus from '../buildANucleus.js';

const BuildANucleusColorProfile = new ColorProfile( [ 'default' ], {

  // Background color that for screens in this sim
  screenBackgroundColor: {
    default: 'white'
  }
} );

buildANucleus.register( 'BuildANucleusColorProfile', BuildANucleusColorProfile );
export default BuildANucleusColorProfile;
// Copyright 2021, University of Colorado Boulder

/**
 * BuildANucleusColors defines the color profile for this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { ProfileColorProperty } from '../../../scenery/js/imports.js';
import buildANucleus from '../buildANucleus.js';

const BuildANucleusColors = {

  // Background color that for screens in this sim
  screenBackgroundColorProperty: new ProfileColorProperty( buildANucleus, 'screenBackground', {
    default: 'white'
  } )
};

buildANucleus.register( 'BuildANucleusColors', BuildANucleusColors );

export default BuildANucleusColors;
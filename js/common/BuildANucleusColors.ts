// Copyright 2021-2022, University of Colorado Boulder

/**
 * BuildANucleusColors defines the color profile for this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Color, ProfileColorProperty } from '../../../scenery/js/imports.js';
import buildANucleus from '../buildANucleus.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';

const BuildANucleusColors = {

  // Background color that for screens in this sim
  screenBackgroundColorProperty: new ProfileColorProperty( buildANucleus, 'screenBackground', {
    default: 'white'
  } ),

  // particle colors
  protonColorProperty: new ProfileColorProperty( buildANucleus, 'protonColor', {
    default: PhetColorScheme.RED_COLORBLIND
  } ),
  neutronColorProperty: new ProfileColorProperty( buildANucleus, 'neutronColor', {
    default: Color.GRAY
  } )
};

buildANucleus.register( 'BuildANucleusColors', BuildANucleusColors );

export default BuildANucleusColors;
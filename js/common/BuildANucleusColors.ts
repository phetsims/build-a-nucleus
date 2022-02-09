// Copyright 2021, University of Colorado Boulder

/**
 * BuildANucleusColors defines the color profile for this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Color, ProfileColorProperty } from '../../../scenery/js/imports.js';
import buildANucleus from '../buildANucleus.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';

const BuildANucleusColors = {

  // background color that for screens in this sim
  screenBackgroundColorProperty: new ProfileColorProperty( buildANucleus, 'screenBackground', {
    default: Color.WHITE
  } ),

  // particle colors
  protonColorProperty: new ProfileColorProperty( buildANucleus, 'protonColor', {
    default: PhetColorScheme.RED_COLORBLIND
  } ),
  neutronColorProperty: new ProfileColorProperty( buildANucleus, 'neutronColor', {
    default: Color.GRAY
  } ),

  // background color for panels in this sim
  panelBackgroundColorProperty: new ProfileColorProperty( buildANucleus, 'panelBackground', {
    default: new Color( 241, 250, 254 )
  } )
};

buildANucleus.register( 'BuildANucleusColors', BuildANucleusColors );

export default BuildANucleusColors;
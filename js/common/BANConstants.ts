// Copyright 2021-2022, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../buildANucleus.js';
import { Color } from '../../../scenery/js/imports.js';

const BANConstants = {

  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 15,

  // radius of the particle node used on the NucleonCountPanel and AvailableDecaysPanel
  PARTICLE_RADIUS: 7,

  // font size of the content labels in the NucleonCountPanel and AvailableDecaysPanel
  BUTTONS_AND_LEGEND_FONT_SIZE: 18,

  // half-life number line starting exponent
  HALF_LIFE_NUMBER_LINE_START_EXPONENT: -24,

  // half-life number line ending exponent
  HALF_LIFE_NUMBER_LINE_END_EXPONENT: 24,

  // the maximum number of protons
  MAX_NUMBER_OF_PROTONS: 92,

  // the maximum number of neutrons,
  MAX_NUMBER_OF_NEUTRONS: 146,

  PANEL_STROKE: Color.GRAY
};

buildANucleus.register( 'BANConstants', BANConstants );
export default BANConstants;
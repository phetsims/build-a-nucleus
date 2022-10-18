// Copyright 2021-2022, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../buildANucleus.js';
import { Color } from '../../../scenery/js/imports.js';
import ShredConstants from '../../../shred/js/ShredConstants.js';

const BANConstants = {

  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 15,

  // radius of the particle node used on the NucleonCountPanel and AvailableDecaysPanel
  PARTICLE_RADIUS: ShredConstants.NUCLEON_RADIUS,

  // CSS pixels per second
  PARTICLE_ANIMATION_SPEED: 300,

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

  // time to 'pause' the simulation to show the nuclide that does not exist, in seconds
  TIME_TO_SHOW_DOES_NOT_EXIST: 1,

  PANEL_STROKE: Color.GRAY,
  PANEL_CORNER_RADIUS: 6,

  ELEMENT_NAME_MAX_WIDTH: 300,
  INFO_BUTTON_INDENT_DISTANCE: 124,
  INFO_BUTTON_MAX_HEIGHT: 30,

  // font size throughout the first screen (stability strings, legend strings, accordion box titles, etc.)
  REGULAR_FONT_SIZE: 20,

  DEFAULT_INITIAL_PROTON_COUNT: 0,
  DEFAULT_INITIAL_NEUTRON_COUNT: 0
};

buildANucleus.register( 'BANConstants', BANConstants );
export default BANConstants;
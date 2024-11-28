// Copyright 2021-2024, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Luisa Vargas
 */

import ScreenView from '../../../joist/js/ScreenView.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Color, RadialGradient } from '../../../scenery/js/imports.js';
import ShredConstants from '../../../shred/js/ShredConstants.js';
import buildANucleus from '../buildANucleus.js';
import BANColors from './BANColors.js';

// constants
const PARTICLE_RADIUS = ShredConstants.NUCLEON_RADIUS;
const PARTICLE_DIAMETER = PARTICLE_RADIUS * 2;

const PANEL_CORNER_RADIUS = 6;

const LAYOUT_BOUNDS = ScreenView.DEFAULT_LAYOUT_BOUNDS;

const BANConstants = {
  LAYOUT_BOUNDS: LAYOUT_BOUNDS,

  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 15,

  // Radius of the particle node used on the NucleonNumberPanel and AvailableDecaysPanel.
  PARTICLE_RADIUS: PARTICLE_RADIUS,

  PARTICLE_DIAMETER: PARTICLE_DIAMETER,

  // In CSS pixels per second.
  PARTICLE_ANIMATION_SPEED: 300,

  // Font size of the content labels in the NucleonNumberPanel and AvailableDecaysPanel.
  BUTTONS_AND_LEGEND_FONT_SIZE: 18,

  // This is based on max number of decay particles, may need adjustment if that changes.
  NUMBER_OF_NUCLEON_LAYERS: 22,

  // Half-life number line starting exponent.
  HALF_LIFE_NUMBER_LINE_START_EXPONENT: -24,

  // Half-life number line ending exponent. Some half-life's are greater than 10^24.
  HALF_LIFE_NUMBER_LINE_END_EXPONENT: 24,

  // The maximum number of protons and neutrons for each screen.
  DECAY_MAX_NUMBER_OF_PROTONS: 94,
  DECAY_MAX_NUMBER_OF_NEUTRONS: 146,
  CHART_MAX_NUMBER_OF_PROTONS: 10,
  CHART_MAX_NUMBER_OF_NEUTRONS: 12,

  // The side length of the number of cells the zoom-in chart node and focused chart node should highlight.
  ZOOM_IN_CHART_SQUARE_LENGTH: 5,

  // Time to 'pause' the simulation to show the nuclide that does not exist, in seconds.
  TIME_TO_SHOW_DOES_NOT_EXIST: 1,

  PANEL_CORNER_RADIUS: PANEL_CORNER_RADIUS,

  ELEMENT_NAME_MAX_WIDTH: 300,
  INFO_BUTTON_INDENT_DISTANCE: 124,
  INFO_BUTTON_MAX_HEIGHT: 30,

  // Font size throughout the first screen (stability strings, legend strings, accordion box titles, etc.).
  REGULAR_FONT: new PhetFont( 20 ),

  // Font size of the legend text in the accordion box and the 'most likely decay' string.
  LEGEND_FONT: new PhetFont( 12 ),

  // Font size of the info dialog title's.
  TITLE_FONT: new PhetFont( 32 ),

  DEFAULT_INITIAL_PROTON_NUMBER: 0,
  DEFAULT_INITIAL_NEUTRON_NUMBER: 0,

  // Center of the atom in view coordinates.
  SCREEN_VIEW_ATOM_CENTER_X: LAYOUT_BOUNDS.width / 3,
  SCREEN_VIEW_ATOM_CENTER_Y: LAYOUT_BOUNDS.height * 0.55,

  // The x distance between the left side of the nucleon energy levels.
  X_DISTANCE_BETWEEN_ENERGY_LEVELS: LAYOUT_BOUNDS.width / 4,

  // Shift highlight rectangle to be aligned on the chart.
  X_SHIFT_HIGHLIGHT_RECTANGLE: 0.5,
  Y_SHIFT_HIGHLIGHT_RECTANGLE: -0.5,

  NUCLIDE_CHART_CELL_LINE_WIDTH: 0.05,

  INFO_DIALOG_TEXT_OPTIONS: {
    font: new PhetFont( 19 ),
    lineWrap: 600,
    maxWidth: 600
  },
  INFO_DIALOG_OPTIONS: {
    topMargin: 40
  },

  DECAY_ARROW_OPTIONS: {
    tailWidth: 3,
    fill: Color.WHITE,
    stroke: Color.BLACK,
    lineWidth: 0.5
  },

  // The minimum number where the nuclide chart always begins.
  CHART_MIN: 0,

  // Function to create a gradient fill based on a given radius.
  ELECTRON_CLOUD_FILL_GRADIENT: function( radius: number ): RadialGradient {
    return new RadialGradient( 0, 0, 0, 0, 0, radius )
      .addColorStop( 0, BANColors.electronColorProperty.value.withAlpha( 1 ) )
      .addColorStop( 0.9, BANColors.electronColorProperty.value.withAlpha( 0 ) );
  },

  // Options for the panel.
  PANEL_OPTIONS: {
    fill: BANColors.panelBackgroundColorProperty,
    xMargin: 10,
    stroke: BANColors.panelStrokeColorProperty,
    cornerRadius: PANEL_CORNER_RADIUS
  }
};

buildANucleus.register( 'BANConstants', BANConstants );
export default BANConstants;
// Copyright 2021-2023, University of Colorado Boulder

/**
 * BANColors defines the color profile for this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Color, ProfileColorProperty } from '../../../scenery/js/imports.js';
import buildANucleus from '../buildANucleus.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';

const BANColors = {

  // background color for screens in this sim
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
  electronColorProperty: new ProfileColorProperty( buildANucleus, 'electronColor', {
    default: Color.BLUE
  } ),
  positronColorProperty: new ProfileColorProperty( buildANucleus, 'positronColor', {
    default: new Color( 53, 182, 74 )
  } ),

  // decay colors
  protonEmissionColorProperty: new ProfileColorProperty( buildANucleus, 'protonEmissionColor', {
    default: new Color( 212, 20, 90 )
  } ),
  neutronEmissionColorProperty: new ProfileColorProperty( buildANucleus, 'neutronEmissionColor', {
    default: Color.MAGENTA
  } ),
  betaPlusColorProperty: new ProfileColorProperty( buildANucleus, 'betaPlusColor', {
    default: Color.BLUE
  } ),
  betaMinusColorProperty: new ProfileColorProperty( buildANucleus, 'betaMinusColor', {
    default: Color.CYAN
  } ),
  alphaColorProperty: new ProfileColorProperty( buildANucleus, 'alphaColor', {
    default: Color.GREEN
  } ),
  stableColorProperty: new ProfileColorProperty( buildANucleus, 'stableColor', {
    default: new Color( 27, 20, 100 )
  } ),
  unknownColorProperty: new ProfileColorProperty( buildANucleus, 'unknownColor', {
    default: new Color( 255, 255, 255 )
  } ),

  // background color for panels in this sim
  panelBackgroundColorProperty: new ProfileColorProperty( buildANucleus, 'panelBackground', {
    default: new Color( 241, 250, 254 )
  } ),

  // half-life color
  halfLifeColorProperty: new ProfileColorProperty( buildANucleus, 'halfLifeColor', {
    default: new Color( 255, 0, 255 )
  } ),

  // info button color on Decay screen
  infoButtonColorProperty: new ProfileColorProperty( buildANucleus, 'infoButtonColor', {
    default: new Color( 255, 153, 255 )
  } ),

  // color of the legend arrows in the Half-life Timescale
  legendArrowColorProperty: new ProfileColorProperty( buildANucleus, 'legendArrowColor', {
    default: new Color( 4, 4, 255 )
  } ),

  // half-life info dialog background
  infoDialogBackgroundColorProperty: new ProfileColorProperty( buildANucleus, 'infoDialogBackground', {
    default: new Color( 255, 254, 244 )
  } ),

  // color of the decay buttons
  decayButtonColorProperty: new ProfileColorProperty( buildANucleus, 'decayButtonColor', {
    default: new Color( 251, 178, 64 )
  } ),

  // color of the lines, arrows, and 'plus' symbols in the Available Decays panel
  blueDecayIconSymbolsColorProperty: new ProfileColorProperty( buildANucleus, 'blueDecayIconSymbolsColor', {
    default: Color.BLUE
  } ),

  // stroke color of the dashed lines below that mini-nucleus
  zoomInDashedLineStrokeColorProperty: new ProfileColorProperty( buildANucleus, 'zoomInDashedLineStrokeColor', {
    default: Color.BLACK
  } ),

  panelStrokeColorProperty: new ProfileColorProperty( buildANucleus, 'panelStrokeColor', {
    default: Color.GRAY
  } ),

  availableDecaysPanelBackgroundColorProperty: new ProfileColorProperty( buildANucleus, 'availableDecaysPanelBackground', {
    default: '#F2F2F2'
  } ),

  chartAccordionBoxBackgroundColorProperty: new ProfileColorProperty( buildANucleus, 'chartAccordionBoxBackgroundColor', {
    default: Color.WHITE
  } ),

  shellModelTextHighlightColorProperty: new ProfileColorProperty( buildANucleus, 'shellModelTextHighlightColor', {
    default: new Color( 189, 255, 255 )
  } ),

  nuclideChartBorderColorProperty: new ProfileColorProperty( buildANucleus, 'nuclideChartBorderColor', {
    default: new Color( 143, 143, 143 )
  } ),

  chartRadioButtonsBackgroundColorProperty: new ProfileColorProperty( buildANucleus, 'chartRadioButtonsBackgroundColor', {
    default: new Color( 241, 250, 254 )
  } ),

  nucleonNumberLineAndTextFontColorProperty: new ProfileColorProperty( buildANucleus, 'nucleonNumberLineAndTextFontColor', {
    default: Color.BLACK
  } ),

  // color of a highlighted tick label on the nucleon number line
  highLightedTickLabelColorProperty: new ProfileColorProperty( buildANucleus, 'highLightedTickLabelColor', {
    default: Color.WHITE
  } ),

  // colors of the energy level bars
  zeroNucleonsEnergyLevelColorProperty: new ProfileColorProperty( buildANucleus, 'zeroNucleonsEnergyLevelColor', {
    default: Color.BLACK
  } ),

  decayEquationArrowAndPlusNodeColorProperty: new ProfileColorProperty( buildANucleus, 'decayEquationArrowAndPlusNodeColor', {
    default: Color.BLACK
  } ),

  selectedPeriodicTableCellFillAndStrokeColorProperty: new ProfileColorProperty( buildANucleus, 'selectedPeriodicTableCellFillAndStrokeColor', {
    default: Color.BLACK
  } ),

  disabledPeriodicTableCellColorProperty: new ProfileColorProperty( buildANucleus, 'disabledPeriodicTableCellColor', {
    default: Color.WHITE
  } ),

  selectedPeriodicTableCellLabelTextColorProperty: new ProfileColorProperty( buildANucleus, 'selectedPeriodicTableCellLabelTextColor', {
    default: Color.WHITE
  } )
};

buildANucleus.register( 'BANColors', BANColors );

export default BANColors;
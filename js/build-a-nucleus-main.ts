// Copyright 2021-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Luisa Vargas
 */

import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import buildANucleusStrings from './buildANucleusStrings.js';
import DecayScreen from './decay/DecayScreen.js';
import ChartIntroScreen from './chart-intro/ChartIntroScreen.js';

const buildANucleusTitleStringProperty = buildANucleusStrings[ 'build-a-nucleus' ].titleStringProperty;

const simOptions: SimOptions = {

  credits: {
    leadDesign: 'Luisa Vargas, Ariel Paul',
    softwareDevelopment: 'Luisa Vargas, Chris Klusendorf',
    team: 'Jason Donev (University of Calgary), Kathy Perkins, Amy Rouinfar',
    qualityAssurance: 'Clifford Hardin, Emily Miller, Nancy Salpepi, Kathryn Woessner',
    graphicArts: '',
    soundDesign: '',
    thanks: ''
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const sim = new Sim( buildANucleusTitleStringProperty, [
    new DecayScreen(),
    new ChartIntroScreen()
  ], simOptions );
  sim.start();
} );
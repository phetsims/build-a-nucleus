// Copyright 2021-2023, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Luisa Vargas
 */

import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import BuildANucleusStrings from './BuildANucleusStrings.js';
import DecayScreen from './decay/DecayScreen.js';
import ChartIntroScreen from './chart-intro/ChartIntroScreen.js';

const buildANucleusTitleStringProperty = BuildANucleusStrings[ 'build-a-nucleus' ].titleStringProperty;

const simOptions: SimOptions = {

  credits: {
    leadDesign: 'Luisa Vargas, Ariel Paul',
    softwareDevelopment: 'Michael Kauzmann, Chris Klusendorf, Marla Schulz, Luisa Vargas',
    team: 'Jason Donev (University of Calgary), Kathy Perkins, Amy Rouinfar',
    qualityAssurance: 'Jaron Droder, Clifford Hardin, Emily Miller, Nancy Salpepi, Kathryn Woessner',
    graphicArts: '',
    soundDesign: '',
    thanks: 'We gratefully acknowledge the support of ECO Canada and the Canadian Nuclear Society for helping to fund' +
            ' this sim.'
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
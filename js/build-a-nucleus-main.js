// Copyright 2021, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Luisa Vargas
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BuildANucleusScreen from './build-a-nucleus/BuildANucleusScreen.js';
import buildANucleusStrings from './buildANucleusStrings.js';

const buildANucleusTitleString = buildANucleusStrings[ 'build-a-nucleus' ].title;

const simOptions = {

  //TODO fill in credits, all of these fields are optional, see joist.CreditsNode
  credits: {
    leadDesign: '',
    softwareDevelopment: '',
    team: '',
    qualityAssurance: '',
    graphicArts: '',
    soundDesign: '',
    thanks: ''
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const sim = new Sim( buildANucleusTitleString, [
    new BuildANucleusScreen( Tandem.ROOT.createTandem( 'buildANucleusScreen' ) )
  ], simOptions );
  sim.start();
} );
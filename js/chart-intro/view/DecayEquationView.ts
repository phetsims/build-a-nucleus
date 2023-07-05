// Copyright 2023, University of Colorado Boulder

import buildANucleus from '../../buildANucleus.js';
import DecayEquationModel from '../model/DecayEquationModel.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import { Text } from '../../../../scenery/js/imports.js';

/**
 * Node that represents the view of a decay equation.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

class DecayEquationView {

  public constructor( decayEquationModel: DecayEquationModel ) {

    const mostLikelyDecayString = new Text( StringUtils.fillIn( BuildANucleusStrings.mostLikelyDecayPattern, {
      decayLikelihoodPercent: AtomIdentifier.getAvailableDecaysAndPercents()
    } ) );
    console.log( mostLikelyDecayString );

  }
}

buildANucleus.register( 'DecayEquationView', DecayEquationView );
export default DecayEquationView;
// Copyright 2021-2022, University of Colorado Boulder

/**
 * BANQueryParameters defines query parameters that are specific to this simulation.
 *
 * @author Luisa Vargas
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */


import buildANucleus from '../buildANucleus.js';
import BANConstants from './BANConstants.js';

const BANQueryParameters = QueryStringMachine.getAll( {

  // the number of neutrons in the atom that the sim starts up with
  neutrons: {
    public: true,
    type: 'number',
    defaultValue: 0,
    isValidValue: ( number: number ) => Number.isInteger( number ) && number >= 0 && number <= BANConstants.MAX_NUMBER_OF_NEUTRONS
  },

  // the number of protons in the atom that the sim starts up with
  protons: {
    public: true,
    type: 'number',
    defaultValue: 0,
    isValidValue: ( number: number ) => Number.isInteger( number ) && number >= 0 && number <= BANConstants.MAX_NUMBER_OF_PROTONS
  }

} );

buildANucleus.register( 'BANQueryParameters', BANQueryParameters );
export default BANQueryParameters;
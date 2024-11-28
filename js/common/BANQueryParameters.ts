// Copyright 2022-2024, University of Colorado Boulder

/**
 * BANQueryParameters defines query parameters that are specific to this simulation.
 *
 * @author Luisa Vargas
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */


import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import AtomIdentifier from '../../../shred/js/AtomIdentifier.js';
import buildANucleus from '../buildANucleus.js';
import BANConstants from './BANConstants.js';

// Acceptable nucleon counts should be an integer greater than zero, and less than the available max per screen.
const getValidationFunctionForMaximum = ( max: number ) => {
  return ( value: number ) => Number.isInteger( value ) && value >= 0 && value <= max;
};

const BANQueryParameters = QueryStringMachine.getAll( {

  // The number of neutrons in the atom on the Decay Screen that the sim starts up with.
  decayScreenNeutrons: {
    public: true,
    type: 'number',
    defaultValue: BANConstants.DEFAULT_INITIAL_NEUTRON_NUMBER,
    isValidValue: getValidationFunctionForMaximum( BANConstants.DECAY_MAX_NUMBER_OF_NEUTRONS )
  },

  // The number of protons in the atom on the Decay Screen that the sim starts up with.
  decayScreenProtons: {
    public: true,
    type: 'number',
    defaultValue: BANConstants.DEFAULT_INITIAL_PROTON_NUMBER,
    isValidValue: getValidationFunctionForMaximum( BANConstants.DECAY_MAX_NUMBER_OF_PROTONS )
  },

  // The number of neutrons in the atom on the Chart Intro Screen that the sim starts up with.
  chartIntroScreenNeutrons: {
    public: true,
    type: 'number',
    defaultValue: BANConstants.DEFAULT_INITIAL_NEUTRON_NUMBER,
    isValidValue: getValidationFunctionForMaximum( BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS )
  },

  // The number of protons in the atom on the Chart Intro Screen that the sim starts up with.
  chartIntroScreenProtons: {
    public: true,
    type: 'number',
    defaultValue: BANConstants.DEFAULT_INITIAL_PROTON_NUMBER,
    isValidValue: getValidationFunctionForMaximum( BANConstants.CHART_MAX_NUMBER_OF_PROTONS )
  }
} );

type QueryParamsWeCareAbout = keyof StrictOmit<typeof BANQueryParameters, 'SCHEMA_MAP'>;

// Use QSM's warning logic for these public parameters if trying to create an Atom that doesn't exist.
function warnForNonExistentAtom( protonsKeyString: QueryParamsWeCareAbout, neutronsKeyString: QueryParamsWeCareAbout ): void {

  // Check if a nuclide with the given query parameters exists and reset to default values if not.
  const numberOfNeutrons = BANQueryParameters[ neutronsKeyString ];
  const numberOfProtons = BANQueryParameters[ protonsKeyString ];

  if ( !AtomIdentifier.doesExist( numberOfProtons, numberOfNeutrons ) ) {
    const errorMessage = `A nuclide with ${numberOfProtons} protons and ${numberOfNeutrons} neutrons does not exist`;

    // Add a warning if the protons or neutrons query parameter was part of an invalid combo (atom doesn't exist)
    // There may have already been a warning added if the query parameter value is outside the valid range, so check first.
    if ( QueryStringMachine.containsKey( protonsKeyString ) &&
         !_.some( QueryStringMachine.warnings, warning => warning.key === protonsKeyString ) ) {
      QueryStringMachine.addWarning( protonsKeyString, numberOfProtons, errorMessage );
    }
    if ( QueryStringMachine.containsKey( neutronsKeyString ) &&
         !_.some( QueryStringMachine.warnings, warning => warning.key === neutronsKeyString ) ) {
      QueryStringMachine.addWarning( neutronsKeyString, numberOfNeutrons, errorMessage );
    }
    BANQueryParameters[ protonsKeyString ] = BANConstants.DEFAULT_INITIAL_PROTON_NUMBER;
    BANQueryParameters[ neutronsKeyString ] = BANConstants.DEFAULT_INITIAL_NEUTRON_NUMBER;
  }
}

warnForNonExistentAtom( 'decayScreenProtons', 'decayScreenNeutrons' );
warnForNonExistentAtom( 'chartIntroScreenProtons', 'chartIntroScreenNeutrons' );

buildANucleus.register( 'BANQueryParameters', BANQueryParameters );
export default BANQueryParameters;
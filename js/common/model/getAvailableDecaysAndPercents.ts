// Copyright 2026, University of Colorado Boulder

/**
 * Utility to return available decays and percentages mapped to BANDecayType.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { DecayAmount } from '../../../../shred/js/AtomData.js';
import AtomInfoUtils from '../../../../shred/js/AtomInfoUtils.js';
import BANDecayType from './BANDecayType.js';

type BANDecayPercentageTuple = readonly [ BANDecayType, DecayAmount ];

/**
 * A function to get tuples that represent the available decays and percentages using the rich enum type instead of the
 * basic type.  The tuples will be sorted by highest percentage to lowest.  An empty array is returned if no decays are
 * available.
 */
function getAvailableDecaysAndPercents( numProtons: number, numNeutrons: number ) : BANDecayPercentageTuple[] {

  // Get the raw decay types mapped to percentage decays from the utility function.
  const unmappedDecaysAndPercentTuples = AtomInfoUtils.getAvailableDecaysAndPercents( numProtons, numNeutrons );

  // Bail out if there were no decays found.
  if ( unmappedDecaysAndPercentTuples.length === 0 ) {
    return [];
  }

  // Map the basic decay types to the rich enum types.
  const decaysAndPercentTuples = unmappedDecaysAndPercentTuples.map( tuple => {
    const decayType = BANDecayType.fromDecayType( tuple[ 0 ] );
    const decayPercent = tuple[ 1 ];
    return [ decayType, decayPercent ] as const;
  } );

  // Sort so the first entry is the best candidate: highest known percentage first, null percentages last.
  return [ ...decaysAndPercentTuples ].sort( ( a, b ) => {
    const aPercent = a[ 1 ];
    const bPercent = b[ 1 ];

    if ( aPercent === null && bPercent === null ) {
      return 0;
    }
    if ( aPercent === null ) {
      return 1;
    }
    if ( bPercent === null ) {
      return -1;
    }
    return bPercent - aPercent;
  } );
}

export default getAvailableDecaysAndPercents;

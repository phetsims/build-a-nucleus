// Copyright 2023, University of Colorado Boulder

/**
 * Model of a cell in the Nuclide Chart. Tracks proton number, neutron number, and decay type of cell.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import buildANucleus from '../../buildANucleus.js';
import DecayType from '../../common/model/DecayType.js';
import AtomIdentifier, { DecayAmount } from '../../../../shred/js/AtomIdentifier.js';
import BANColors from '../../common/BANColors.js';
import { ColorProperty } from '../../../../scenery/js/imports.js';

class NuclideChartCellModel {

  public readonly protonNumber: number;
  public readonly neutronNumber: number;

  // Null could be that it is stable or has an unknown decay type, see NuclideChartCellModel.isStable to differentiate.
  public readonly decayType: DecayType | null;
  public readonly decayTypeLikelihoodPercent: DecayAmount;

  public readonly colorProperty: ColorProperty;
  public readonly isStable: boolean;

  public constructor( protonNumber: number, neutronNumber: number ) {

    this.protonNumber = protonNumber;
    this.neutronNumber = neutronNumber;
    this.isStable = AtomIdentifier.isStable( protonNumber, neutronNumber );

    // Get the first decay in available decays to color the cell according to that decay type.
    const decayTypeAndPercent = this.getDecayTypeAndPercent( protonNumber, neutronNumber );
    this.decayType = decayTypeAndPercent[ 0 ];
    this.decayTypeLikelihoodPercent = decayTypeAndPercent[ 1 ];

    this.colorProperty = this.isStable ? BANColors.stableColorProperty :
                         this.decayType === null ? BANColors.unknownColorProperty : // No available decays, unknown decay type.
                         this.decayType.colorProperty;
  }

  private getDecayTypeAndPercent( protonNumber: number, neutronNumber: number ): readonly [ DecayType | null, DecayAmount ] {

    const decaysAndPercentTuples = AtomIdentifier.getAvailableDecaysAndPercents( protonNumber, neutronNumber );

    if ( decaysAndPercentTuples.length === 0 ) {
      return [ null, null ];
    }

    let desiredEntry = decaysAndPercentTuples[ 0 ];
    for ( let i = 1; i < decaysAndPercentTuples.length; i++ ) {
      const decayAndPercent = decaysAndPercentTuples[ i ];

      // We want the actual highest percent over the null if given the opportunity
      if ( desiredEntry[ 1 ] === null ) {
        desiredEntry = decayAndPercent;
      }
      else if ( decayAndPercent[ 1 ] !== null && desiredEntry[ 1 ] < decayAndPercent[ 1 ] ) {
        desiredEntry = decayAndPercent;
      }
    }

    return [ DecayType.enumeration.getValue( desiredEntry[ 0 ] ), desiredEntry[ 1 ] ];
  }
}

buildANucleus.register( 'NuclideChartCellModel', NuclideChartCellModel );
export default NuclideChartCellModel;
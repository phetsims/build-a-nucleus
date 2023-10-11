// Copyright 2023, University of Colorado Boulder

/**
 * Model of a cell in the Nuclide Chart. Tracks proton number, neutron number, and decay type of cell.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import buildANucleus from '../../buildANucleus.js';
import DecayType from '../../common/model/DecayType.js';
import AtomIdentifier, { DecayPercentageTuple } from '../../../../shred/js/AtomIdentifier.js';
import BANColors from '../../common/BANColors.js';
import { ColorProperty } from '../../../../scenery/js/imports.js';

class NuclideChartCellModel {

  public readonly protonNumber: number;
  public readonly neutronNumber: number;

  // Null could be that it is stable or has an unknown decay type, see NuclideChartCellModel.isStable to differentiate.
  public readonly decayType: DecayType | null;
  public readonly decayTypeLikelihoodPercent: number | null;

  public readonly colorProperty: ColorProperty;
  public readonly isStable: boolean;

  public constructor( protonNumber: number, neutronNumber: number ) {

    // Get the first decay in available decays to color the cell according to that decay type.
    const decayTypeStringAndPercent = this.getDecayTypeAndPercent( protonNumber, neutronNumber );

    this.protonNumber = protonNumber;
    this.neutronNumber = neutronNumber;
    this.isStable = AtomIdentifier.isStable( protonNumber, neutronNumber );
    this.decayType = decayTypeStringAndPercent ?
                     DecayType.enumeration.getValue( decayTypeStringAndPercent[ 0 ] ) :
                     null;
    this.decayTypeLikelihoodPercent = decayTypeStringAndPercent ?
                                      decayTypeStringAndPercent[ 1 ] :
                                      null;
    this.colorProperty = this.isStable ? BANColors.stableColorProperty :
                         this.decayType === null ? BANColors.unknownColorProperty : // No available decays, unknown decay type.
                         this.decayType.colorProperty;
  }

  private getDecayTypeAndPercent( protonNumber: number, neutronNumber: number ): DecayPercentageTuple | null {

    const decaysAndPercentTuples = AtomIdentifier.getAvailableDecaysAndPercents( protonNumber, neutronNumber );

    if ( decaysAndPercentTuples.length === 0 ) {
      return null;
    }

    const percents = _.sortBy( decaysAndPercentTuples, x => x[ 1 ] );

    // We want the actual highest percent over the null if given the opportunity
    if ( percents[ percents.length - 1 ][ 0 ] === null && percents.length > 1 ) {
      percents[ percents.length - 2 ];
    }

    return percents[ percents.length - 1 ];
  }
}

buildANucleus.register( 'NuclideChartCellModel', NuclideChartCellModel );
export default NuclideChartCellModel;

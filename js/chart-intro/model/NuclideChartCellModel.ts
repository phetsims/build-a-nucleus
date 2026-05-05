// Copyright 2023-2026, University of Colorado Boulder

/**
 * Model of a cell in the Nuclide Chart. Tracks proton number, neutron number, and decay type of cell.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import ColorProperty from '../../../../scenery/js/util/ColorProperty.js';
import { DecayAmount } from '../../../../shred/js/AtomData.js';
import AtomInfoUtils from '../../../../shred/js/AtomInfoUtils.js';
import BANColors from '../../common/BANColors.js';
import BANDecayType from '../../common/model/BANDecayType.js';
import getAvailableDecaysAndPercents from '../../common/model/getAvailableDecaysAndPercents.js';

class NuclideChartCellModel {

  public readonly protonNumber: number;
  public readonly neutronNumber: number;

  // Null could be that it is stable or has an unknown decay type, see NuclideChartCellModel.isStable to differentiate.
  public readonly decayType: BANDecayType | null;
  public readonly decayTypeLikelihoodPercent: DecayAmount;

  public readonly colorProperty: ColorProperty;
  public readonly isStable: boolean;

  public constructor( protonNumber: number, neutronNumber: number ) {

    this.protonNumber = protonNumber;
    this.neutronNumber = neutronNumber;
    this.isStable = AtomInfoUtils.isStable( protonNumber, neutronNumber );

    // Get the first decay in available decays to color the cell according to that decay type.
    const decayTypeAndPercent = this.getDecayTypeAndPercent( protonNumber, neutronNumber );
    this.decayType = decayTypeAndPercent[ 0 ];
    this.decayTypeLikelihoodPercent = decayTypeAndPercent[ 1 ];

    this.colorProperty = this.isStable ? BANColors.stableColorProperty :
                         this.decayType === null ? BANColors.unknownColorProperty : // No available decays, unknown decay type.
                         this.decayType.colorProperty;
  }

  private getDecayTypeAndPercent( protonNumber: number, neutronNumber: number ): readonly [ BANDecayType | null, DecayAmount ] {

    // Get the decay types mapped to percentage decays from the utility function.
    const decayAndPercentTuples = getAvailableDecaysAndPercents( protonNumber, neutronNumber );

    // Bail out if there were no decays found.
    if ( decayAndPercentTuples.length === 0 ) {
      return [ null, null ];
    }

    // Return the first tuple, which should represent the most common decay.
    return decayAndPercentTuples[ 0 ];
  }
}

export default NuclideChartCellModel;

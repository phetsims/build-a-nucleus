// Copyright 2023, University of Colorado Boulder

/**
 * Model of a cell in the Nuclide Chart. Tracks proton number, neutron number, and decay type of cell.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import buildANucleus from '../../buildANucleus.js';
import DecayType from '../../common/model/DecayType.js';
import AtomIdentifier, { DecayTypeStrings } from '../../../../shred/js/AtomIdentifier.js';
import BANColors from '../../common/BANColors.js';
import { ColorProperty } from '../../../../scenery/js/imports.js';

class NuclideChartCellModel {

  public readonly protonCount: number;
  public readonly neutronCount: number;

  // Null could be that it is stable or has an unknown decay type, see NuclideChartCellModel.isStable to differentiate.
  public readonly decayType: DecayType | null;
  public readonly colorProperty: ColorProperty;
  public readonly decayTypeLikelihoodPercent: number | null;
  public readonly isStable: boolean;

  public constructor( protonCount: number, neutronCount: number ) {

    // get first decay in available decays to color the cell according to that decay type
    const decayTypeAndPercent = AtomIdentifier.getAvailableDecaysAndPercents( protonCount, neutronCount )[ 0 ];

    this.protonCount = protonCount;
    this.neutronCount = neutronCount;
    this.isStable = AtomIdentifier.isStable( protonCount, neutronCount );
    this.decayType = decayTypeAndPercent ? DecayType.enumeration.getValue( Object.keys( decayTypeAndPercent )[ 0 ] ) : null;
    this.decayTypeLikelihoodPercent = this.decayType === null ? null : decayTypeAndPercent[ this.decayType.name as DecayTypeStrings ]!;
    this.colorProperty = this.isStable ? BANColors.stableColorProperty :
                         this.decayType === null ? BANColors.unknownColorProperty : // no available decays, unknown decay type
                         this.decayType.colorProperty;
  }
}

buildANucleus.register( 'NuclideChartCellModel', NuclideChartCellModel );
export default NuclideChartCellModel;

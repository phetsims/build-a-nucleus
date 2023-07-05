// Copyright 2023, University of Colorado Boulder

/**
 * Model of a cell in the Nuclide Chart. Tracks proton number, neutron number, and decay type of cell.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import buildANucleus from '../../buildANucleus.js';
import DecayType from '../../common/view/DecayType.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import BANColors from '../../common/BANColors.js';
import { ColorProperty } from '../../../../scenery/js/imports.js';

class NuclideChartCellModel {

  public readonly protonNumber: number;
  public readonly neutronNumber: number;
  public readonly decayType: DecayType | undefined;
  public readonly colorProperty: ColorProperty;
  public readonly decayTypeLikelihoodPercent: number | null;

  public constructor( protonNumber: number, neutronNumber: number ) {

    // get first decay in available decays to color the cell according to that decay type
    // @ts-expect-error webstorm doesn't know that this is an object of { string: number }, it thinks it's { string: undefined }
    const decayTypeAndPercent: { string: number } = AtomIdentifier.getAvailableDecaysAndPercents( protonNumber, neutronNumber )[ 0 ];

    this.protonNumber = protonNumber;
    this.neutronNumber = neutronNumber;
    this.decayType = decayTypeAndPercent !== undefined ? DecayType.enumeration.getValue( Object.keys( decayTypeAndPercent )[ 0 ] ) : undefined;
    // @ts-expect-error webstorm doesn't know that decayTypeAndPercent[ this.decayType.name ] is a number and not 'any'
    this.decayTypeLikelihoodPercent = this.decayType === undefined ? null : decayTypeAndPercent[ this.decayType.name ];
    this.colorProperty = AtomIdentifier.isStable( protonNumber, neutronNumber ) ? BANColors.stableColorProperty :
                  this.decayType === undefined ? BANColors.unknownColorProperty : // no available decays, unknown decay type
                  this.decayType.colorProperty;
  }
}

buildANucleus.register( 'NuclideChartCellModel', NuclideChartCellModel );
export default NuclideChartCellModel;

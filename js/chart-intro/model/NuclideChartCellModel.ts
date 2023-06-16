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
  public readonly decayType: DecayType | null;
  public readonly colorProperty: ColorProperty;

  public constructor( protonNumber: number, neutronNumber: number ) {

    // get first decay in available decays to color the cell according to that decay type
    const decayType = AtomIdentifier.getAvailableDecays( protonNumber, neutronNumber )[ 0 ];

    this.protonNumber = protonNumber;
    this.neutronNumber = neutronNumber;
    this.decayType = DecayType.enumeration.getValue( decayType );
    this.colorProperty = AtomIdentifier.isStable( protonNumber, neutronNumber ) ? BANColors.stableColorProperty :
                  decayType === undefined ? BANColors.unknownColorProperty : // no available decays, unknown decay type
                  this.decayType.colorProperty;
  }
}

buildANucleus.register( 'NuclideChartCellModel', NuclideChartCellModel );
export default NuclideChartCellModel;

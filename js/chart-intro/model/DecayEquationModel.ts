// Copyright 2023, University of Colorado Boulder

/**
 * Node that represents the model of a decay equation.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import buildANucleus from '../../buildANucleus.js';
import NuclideChartCellModel from './NuclideChartCellModel.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import BANConstants from '../../common/BANConstants.js';
import Utils from '../../../../dot/js/Utils.js';

class DecayEquationModel {

  public readonly finalProtonNumberProperty: Property<number>;
  public readonly finalMassNumberProperty: Property<number>;

  // This cell (if available) holds all info about the initial mass and decay type.
  public readonly currentCellModelProperty: Property<NuclideChartCellModel | null>;

  public constructor( cellModelArray: NuclideChartCellModel[][], protonCountProperty: TReadOnlyProperty<number>, massNumberProperty: TReadOnlyProperty<number> ) {

    this.currentCellModelProperty = new Property( this.getCurrentCellModel( cellModelArray, protonCountProperty.value, massNumberProperty.value ) );

    // initialize to 0
    this.finalProtonNumberProperty = new NumberProperty( 0,
      { validValues: Utils.rangeInclusive( 0, BANConstants.CHART_MAX_NUMBER_OF_PROTONS ) } );
    this.finalMassNumberProperty = new NumberProperty( 0,
      { validValues: Utils.rangeInclusive( 0, BANConstants.CHART_MAX_NUMBER_OF_PROTONS + BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS ) } );

    massNumberProperty.link( () => {
      const currentCell = this.getCurrentCellModel( cellModelArray, protonCountProperty.value, massNumberProperty.value );

      // if there's no cell or decay type, just take the current proton and mass number values
      if ( !currentCell || !currentCell.decayType ) {
        this.finalProtonNumberProperty.value = protonCountProperty.value;
        this.finalMassNumberProperty.value = massNumberProperty.value;
      }
      else {
        this.finalProtonNumberProperty.value = currentCell.protonNumber - currentCell.decayType.protonNumber;
        this.finalMassNumberProperty.value = currentCell.protonNumber + currentCell.neutronNumber - currentCell.decayType.massNumber;
      }

      // this must be last so the listener on it in the view (DecayEquationNode) updates with the correct final values
      this.currentCellModelProperty.value = currentCell;
    } );
  }

  /**
   * Return the current NuclideChartCellModel for the current proton number and mass number, if there exists one.
   */
  private getCurrentCellModel( cellModelArray: NuclideChartCellModel[][], protonNumber: number, massNumber: number ): NuclideChartCellModel | null {
    return _.find( cellModelArray[ protonNumber ], cellModel => cellModel.neutronNumber === massNumber - protonNumber ) || null;
  }
}

buildANucleus.register( 'DecayEquationModel', DecayEquationModel );
export default DecayEquationModel;
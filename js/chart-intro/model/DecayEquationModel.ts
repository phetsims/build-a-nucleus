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

class DecayEquationModel {

  public readonly finalProtonCountProperty: Property<number>;
  public readonly finalMassNumberProperty: Property<number>;

  // This cell (if available) holds all info about the initial mass and decay type.
  public readonly currentCellModelProperty: Property<NuclideChartCellModel | null>;

  public constructor( cellModelArray: NuclideChartCellModel[][], protonCountProperty: TReadOnlyProperty<number>, massNumberProperty: TReadOnlyProperty<number> ) {

    this.currentCellModelProperty = new Property( this.getCurrentCellModel( cellModelArray, protonCountProperty.value, massNumberProperty.value ) );

    this.finalProtonCountProperty = new NumberProperty( -1 );
    this.finalMassNumberProperty = new NumberProperty( -1 );

    massNumberProperty.link( () => {
      const currentCell = this.getCurrentCellModel( cellModelArray, protonCountProperty.value, massNumberProperty.value );

      // if there's no cell or decay type, just take the current proton and mass number values
      if ( !currentCell || !currentCell.decayType ) {
        this.finalProtonCountProperty.value = protonCountProperty.value;
        this.finalMassNumberProperty.value = massNumberProperty.value;
      }
      else {
        this.finalProtonCountProperty.value = currentCell.protonCount - currentCell.decayType.protonCount;
        this.finalMassNumberProperty.value = currentCell.protonCount + currentCell.neutronCount - currentCell.decayType.massNumber;
      }

      // this must be last so the listener on it in the view (DecayEquationNode) updates with the correct final values
      this.currentCellModelProperty.value = currentCell;
    } );
  }

  /**
   * Return the current NuclideChartCellModel for the current proton number and mass number, if there exists one.
   */
  private getCurrentCellModel( cellModelArray: NuclideChartCellModel[][], protonCount: number, massNumber: number ): NuclideChartCellModel | null {
    return _.find( cellModelArray[ protonCount ], cellModel => cellModel.neutronCount === massNumber - protonCount ) || null;
  }
}

buildANucleus.register( 'DecayEquationModel', DecayEquationModel );
export default DecayEquationModel;
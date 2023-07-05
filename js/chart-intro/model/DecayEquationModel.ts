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
import DecayType from '../../common/view/DecayType.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';

class DecayEquationModel {

  public readonly finalProtonNumberProperty: Property<number>;
  public readonly finalMassNumberProperty: Property<number>;

  // This cell (if available) holds all info about the initial mass and decay type.
  public readonly currentCellModelProperty: Property<NuclideChartCellModel | null>;

  public constructor( cellModelArray: NuclideChartCellModel[][], protonCountProperty: TReadOnlyProperty<number>, massNumberProperty: TReadOnlyProperty<number> ) {

    this.currentCellModelProperty = new Property( this.getCurrentCellModel( cellModelArray, protonCountProperty.value, massNumberProperty.value ) );

    this.finalProtonNumberProperty = new NumberProperty( -1 );
    this.finalMassNumberProperty = new NumberProperty( -1 );

    massNumberProperty.link( () => {
      this.currentCellModelProperty.value = this.getCurrentCellModel( cellModelArray, protonCountProperty.value, massNumberProperty.value );
      const currentCell = this.currentCellModelProperty.value;
      if ( !currentCell || !currentCell.decayType ) {
        this.finalProtonNumberProperty.value = protonCountProperty.value;
        this.finalMassNumberProperty.value = massNumberProperty.value;
        return;
      }
      switch( currentCell.decayType ) {
        case DecayType.NEUTRON_EMISSION:
          this.finalProtonNumberProperty.value = currentCell.protonNumber - DecayType.NEUTRON_EMISSION.protonNumber;
          this.finalMassNumberProperty.value = currentCell.protonNumber + currentCell.neutronNumber - DecayType.NEUTRON_EMISSION.massNumber;
          break;
        case DecayType.PROTON_EMISSION:
          this.finalProtonNumberProperty.value = currentCell.protonNumber - DecayType.PROTON_EMISSION.protonNumber;
          this.finalMassNumberProperty.value = currentCell.protonNumber + currentCell.neutronNumber - DecayType.PROTON_EMISSION.massNumber;
          break;
        case DecayType.BETA_PLUS_DECAY:
          this.finalProtonNumberProperty.value = currentCell.protonNumber - DecayType.BETA_PLUS_DECAY.protonNumber;
          this.finalMassNumberProperty.value = currentCell.protonNumber + currentCell.neutronNumber - DecayType.BETA_PLUS_DECAY.massNumber;
          break;
        case DecayType.BETA_MINUS_DECAY:
          this.finalProtonNumberProperty.value = currentCell.protonNumber - DecayType.BETA_MINUS_DECAY.protonNumber;
          this.finalMassNumberProperty.value = currentCell.protonNumber + currentCell.neutronNumber - DecayType.BETA_MINUS_DECAY.massNumber;
          break;
        case DecayType.ALPHA_DECAY:
          this.finalProtonNumberProperty.value = currentCell.protonNumber - DecayType.ALPHA_DECAY.protonNumber;
          this.finalMassNumberProperty.value = currentCell.protonNumber + currentCell.neutronNumber - DecayType.ALPHA_DECAY.massNumber;
          break;
        default:
          assert && assert( false, 'No valid decay type found: ' + currentCell.decayType );
      }
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
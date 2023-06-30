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
  private readonly initialProtonNumberProperty: TReadOnlyProperty<number>;
  private readonly initialMassNumberProperty: TReadOnlyProperty<number>;
  private readonly finalProtonNumberProperty: Property<number>;
  private readonly finalMassNumberProperty: Property<number>;

  public constructor( cellModelArray: NuclideChartCellModel[][], protonCountProperty: TReadOnlyProperty<number>, massNumberProperty: TReadOnlyProperty<number> ) {

    this.initialProtonNumberProperty = protonCountProperty;
    this.initialMassNumberProperty = massNumberProperty;

    // TODO: if at 0 protons and 0 neutrons, or if decay type is unknown, don't show the decay equation
    this.finalProtonNumberProperty = new NumberProperty( -1 );
    this.finalMassNumberProperty = new NumberProperty( -1 );

    this.initialMassNumberProperty.link( () => {
      const currentCell = this.getCurrentCellModel( cellModelArray, protonCountProperty.value, massNumberProperty.value );
      console.log( cellModelArray );
      if ( !currentCell || !currentCell.decayType ) {
        // TODO: for stable decay types set this, is it alright?
        this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value;
        this.finalMassNumberProperty.value = this.initialMassNumberProperty.value;
        return;
      }
      console.log( currentCell.decayType );
      switch( currentCell.decayType ) {
        case DecayType.NEUTRON_EMISSION:
          this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value;
          this.finalMassNumberProperty.value = this.initialMassNumberProperty.value - 1;
          break;
        case DecayType.PROTON_EMISSION:
          this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value - 1;
          this.finalMassNumberProperty.value = this.initialMassNumberProperty.value - 1;
          break;
        case DecayType.BETA_PLUS_DECAY:
          this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value - 1;
          this.finalMassNumberProperty.value = this.initialMassNumberProperty.value;
          break;
        case DecayType.BETA_MINUS_DECAY:
          this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value + 1;
          this.finalMassNumberProperty.value = this.initialMassNumberProperty.value;
          break;
        case DecayType.ALPHA_DECAY:
          this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value - 2;
          this.finalMassNumberProperty.value = this.initialMassNumberProperty.value - 4;
          break;
        default:
          assert && assert( false, 'No valid decay type found: ' + currentCell.decayType );
      }

    } );

    this.initialMassNumberProperty.link( initialMassNumber => {
      console.log( 'initialMassNumber = ' + initialMassNumber );
      console.log( 'initialProtonNumber = ' + this.initialProtonNumberProperty.value );
      console.log( 'finalMassNumber = ' + this.finalMassNumberProperty.value );
      console.log( 'finalProtonNumber = ' + this.finalProtonNumberProperty.value );
    } );

  }

  /**
   * Return the current NuclideChartCellModel for the current proton number and mass number, if there exists one.
   */
  private getCurrentCellModel( cellModelArray: NuclideChartCellModel[][], protonNumber: number, massNumber: number ): NuclideChartCellModel | undefined {
    return _.find( cellModelArray[ protonNumber ], cellModel => cellModel.neutronNumber === massNumber - protonNumber );
  }
}

buildANucleus.register( 'DecayEquationModel', DecayEquationModel );
export default DecayEquationModel;
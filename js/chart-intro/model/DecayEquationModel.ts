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
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';

class DecayEquationModel {
  private readonly initialProtonNumberProperty: TReadOnlyProperty<number>;
  private readonly initialMassNumberProperty: TReadOnlyProperty<number>;
  private readonly finalProtonNumberProperty: Property<number>;
  private readonly finalMassNumberProperty: Property<number>;
  private readonly decayTypeEnumerationProperty: Property<EnumerationValue | null>;

  public constructor( cellModelArray: NuclideChartCellModel[][], protonCountProperty: TReadOnlyProperty<number>, massNumberProperty: TReadOnlyProperty<number> ) {

    this.initialProtonNumberProperty = protonCountProperty;
    this.initialMassNumberProperty = massNumberProperty;

    this.finalProtonNumberProperty = new NumberProperty( -1 );
    this.finalMassNumberProperty = new NumberProperty( -1 );

    this.decayTypeEnumerationProperty = new Property<EnumerationValue | null>( null );

    this.initialMassNumberProperty.link( () => {
      const currentCell = this.getCurrentCellModel( cellModelArray, protonCountProperty.value, massNumberProperty.value );
      if ( !currentCell || !currentCell.decayType ) {
        this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value;
        this.finalMassNumberProperty.value = this.initialMassNumberProperty.value;
        this.decayTypeEnumerationProperty.value = null;
        return;
      }
      switch( currentCell.decayType ) {
        case DecayType.NEUTRON_EMISSION:
          this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value - DecayType.NEUTRON_EMISSION.protonNumber;
          this.finalMassNumberProperty.value = this.initialMassNumberProperty.value - DecayType.NEUTRON_EMISSION.massNumber;
          this.decayTypeEnumerationProperty.value = DecayType.NEUTRON_EMISSION;
          break;
        case DecayType.PROTON_EMISSION:
          this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value - DecayType.PROTON_EMISSION.protonNumber;
          this.finalMassNumberProperty.value = this.initialMassNumberProperty.value - DecayType.PROTON_EMISSION.massNumber;
          this.decayTypeEnumerationProperty.value = DecayType.PROTON_EMISSION;
          break;
        case DecayType.BETA_PLUS_DECAY:
          this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value - DecayType.BETA_PLUS_DECAY.protonNumber;
          this.finalMassNumberProperty.value = this.initialMassNumberProperty.value - DecayType.BETA_PLUS_DECAY.massNumber;
          this.decayTypeEnumerationProperty.value = DecayType.BETA_PLUS_DECAY;
          break;
        case DecayType.BETA_MINUS_DECAY:
          this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value - DecayType.BETA_MINUS_DECAY.protonNumber;
          this.finalMassNumberProperty.value = this.initialMassNumberProperty.value - DecayType.BETA_MINUS_DECAY.massNumber;
          this.decayTypeEnumerationProperty.value = DecayType.BETA_MINUS_DECAY;
          break;
        case DecayType.ALPHA_DECAY:
          this.finalProtonNumberProperty.value = this.initialProtonNumberProperty.value - DecayType.ALPHA_DECAY.protonNumber;
          this.finalMassNumberProperty.value = this.initialMassNumberProperty.value - DecayType.ALPHA_DECAY.massNumber;
          this.decayTypeEnumerationProperty.value = DecayType.ALPHA_DECAY;
          break;
        default:
          assert && assert( false, 'No valid decay type found: ' + currentCell.decayType );
      }
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
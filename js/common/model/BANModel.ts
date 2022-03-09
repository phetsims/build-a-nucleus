// Copyright 2022, University of Colorado Boulder

/**
 * Model class which the 'Decay' and 'Nuclide Chart' screen will extend.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import optionize from '../../../../phet-core/js/optionize.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';

// types
export type BANModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

class BANModel {

  public readonly protonCountProperty: NumberProperty;
  public readonly neutronCountProperty: NumberProperty;
  public isStableBooleanProperty: BooleanProperty;
  public readonly massNumberProperty: DerivedProperty<number, [ protonCount: number, neutronCount: number ]>;

  constructor( maximumProtonNumber: number, maximumNeutronNumber: number, providedOptions?: BANModelOptions ) {

    const options = optionize<BANModelOptions, {}>( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    console.log( options.tandem );

    // the number of protons
    this.protonCountProperty = new NumberProperty( 0, {
      numberType: 'Integer',
      range: new Range( 0, maximumProtonNumber )
    } );

    // the number of neutrons
    this.neutronCountProperty = new NumberProperty( 0, {
      numberType: 'Integer',
      range: new Range( 0, maximumNeutronNumber )
    } );

    // the number of protons and neutrons
    this.massNumberProperty = new DerivedProperty( [ this.protonCountProperty, this.neutronCountProperty ],
      ( ( protonCount, neutronCount ) => protonCount + neutronCount )
    );

    // the stability of the nuclide with a given number of protons and neutrons
    this.isStableBooleanProperty = new BooleanProperty( true );
  }

  public reset(): void {
    this.protonCountProperty.reset();
    this.neutronCountProperty.reset();
    this.isStableBooleanProperty.reset();
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public step( dt: number ): void {
    //TODO
  }
}

buildANucleus.register( 'BANModel', BANModel );
export default BANModel;
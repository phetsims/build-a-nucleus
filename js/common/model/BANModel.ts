// Copyright 2022, University of Colorado Boulder

/**
 * Model class which the 'Decay' and 'Nuclide Chart' screen will extend.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import { PhetioObjectOptions, RequiredTandem } from '../../../../tandem/js/PhetioObject.js';
import optionize from '../../../../phet-core/js/optionize.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

// types
type BuildANucleusModelSelfOptions = {};
export type BuildANucleusModelOptions =
  BuildANucleusModelSelfOptions
  & PhetioObjectOptions
  & RequiredTandem;

class BANModel {

  public readonly protonCountProperty: NumberProperty;
  public readonly neutronCountProperty: NumberProperty;
  public isStableBooleanProperty: BooleanProperty;
  public readonly massNumberProperty: DerivedProperty<number, [ protonCount: number, neutronCount: number ]>;

  constructor( maximumProtonNumber: number, maximumNeutronNumber: number, providedOptions?: BuildANucleusModelOptions ) {

    const options = optionize<BuildANucleusModelOptions, BuildANucleusModelSelfOptions, PhetioObjectOptions>( {

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

    // TODO: add numberType but won't allow it b/c IReadOnlyProperty?
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
    this.massNumberProperty.reset();
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
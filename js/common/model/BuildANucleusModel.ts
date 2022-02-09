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

// types
type BuildANucleusModelSelfOptions = {};
export type BuildANucleusModelOptions =
  BuildANucleusModelSelfOptions
  & PhetioObjectOptions
  & Required<Pick<PhetioObjectOptions, 'tandem'>>;

class BuildANucleusModel {

  public readonly protonCountProperty: NumberProperty;
  public readonly neutronCountProperty: NumberProperty;

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
  }

  public reset(): void {
    this.protonCountProperty.reset();
    this.neutronCountProperty.reset();
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public step( dt: number ): void {
    //TODO
  }
}

buildANucleus.register( 'BuildANucleusModel', BuildANucleusModel );
export default BuildANucleusModel;
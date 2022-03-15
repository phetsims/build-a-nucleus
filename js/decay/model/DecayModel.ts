// Copyright 2022, University of Colorado Boulder

/**
 * Model class for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANModel, { BANModelOptions } from '../../common/model/BANModel.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import BANConstants from '../../common/BANConstants.js';

// types
export type DecayModelOptions = BANModelOptions;

class DecayModel extends BANModel {

  public halfLifeNumberProperty: NumberProperty;

  constructor( providedOptions?: DecayModelOptions ) {

    const options = optionize<DecayModelOptions, {}, BANModelOptions>( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // empirically determined, the last nuclide the Decay screen goes up to is Uranium-238 (92 protons and 146 neutrons)
    super( 92, 146, options );

    // the half-life number
    this.halfLifeNumberProperty = new NumberProperty( 0 );

    // TODO: Should be a derived property
    // update the half-life
    Property.multilink( [ this.protonCountProperty, this.neutronCountProperty ], ( protonCount, neutronCount ) => {

      // the nuclide exists
      if ( this.doesNuclideExistBooleanProperty.value ) {

        // the nuclide is stable, set the indicator to the maximum half-life number on the half-life number line
        if ( this.isStableBooleanProperty.value ) {
          this.halfLifeNumberProperty.value = Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT );
        }

        // the nuclide is unstable and its half-life data is missing, set -1 as the half-life as a placeholder
        else if ( AtomIdentifier.getNuclideHalfLife( protonCount, neutronCount ) === null ) {
          this.halfLifeNumberProperty.value = -1;
        }

        // the nuclide is unstable and its half-life data is not missing, update its half-life
        else {
          this.halfLifeNumberProperty.value = AtomIdentifier.getNuclideHalfLife( protonCount, neutronCount )!;
        }
      }

      // the nuclide does not exist
      else {
        this.halfLifeNumberProperty.reset();
      }
    } );
  }

  public reset(): void {
    this.halfLifeNumberProperty.reset();
    super.reset();
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public step( dt: number ): void {
    //TODO
  }
}

buildANucleus.register( 'DecayModel', DecayModel );
export default DecayModel;
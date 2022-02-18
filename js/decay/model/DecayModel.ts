// Copyright 2022, University of Colorado Boulder

/**
 * Model class for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANModel from '../../common/model/BANModel.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import NuclideIdentifier from '../../common/NuclideIdentifier.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

// types
type DecayModelSelfOptions = {};
export type DecayModelOptions =
  DecayModelSelfOptions
  & PhetioObjectOptions
  & Required<Pick<PhetioObjectOptions, 'tandem'>>;

class DecayModel extends BANModel {

  public halfLifeNumberProperty: NumberProperty;
  public isStableBooleanProperty: BooleanProperty;

  constructor( providedOptions?: DecayModelOptions ) {

    const options = optionize<DecayModelOptions, DecayModelSelfOptions, PhetioObjectOptions>( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // empirically determined, the last nuclide the Decay screen goes up to is Uranium-238 (92 protons and 146 neutrons)
    super( 92, 146, options );

    // keep track of the half-life number
    this.halfLifeNumberProperty = new NumberProperty( 0 );

    // keep track of the stability
    this.isStableBooleanProperty = new BooleanProperty( true );

    // update the half-life and stability
    Property.multilink( [ this.protonCountProperty, this.neutronCountProperty ], ( protonCount, neutronCount ) => {

      // the nuclide exists
      if ( NuclideIdentifier.doesExist( protonCount, neutronCount ) ) {
        this.isStableBooleanProperty.value = NuclideIdentifier.isStable( protonCount, neutronCount );

        if ( this.isStableBooleanProperty.value ) {
          this.halfLifeNumberProperty.value = 0;
        }
        // if the nuclide is unstable and its half-life data is not missing, update its half-life
        else if ( NuclideIdentifier.getNuclideHalfLife( protonCount, neutronCount ) !== null ) {
          this.halfLifeNumberProperty.value = NuclideIdentifier.getNuclideHalfLife( protonCount, neutronCount )!;
        }
      }
      else {
        this.halfLifeNumberProperty.reset();
        this.isStableBooleanProperty.reset();
      }
    } );
  }

  public reset(): void {
    this.halfLifeNumberProperty.reset();
    this.isStableBooleanProperty.reset();
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
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

// types
type DecayModelSelfOptions = {};
export type DecayModelOptions =
  DecayModelSelfOptions
  & PhetioObjectOptions
  & Required<Pick<PhetioObjectOptions, 'tandem'>>;

class DecayModel extends BANModel {

  constructor( providedOptions?: DecayModelOptions ) {

    const options = optionize<DecayModelOptions, DecayModelSelfOptions, PhetioObjectOptions>( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // empirically determined, the last nuclide the Decay screen goes up to is Uranium-238 (92 protons and 146 neutrons)
    super( 92, 146, options );
  }

  public reset(): void {
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
// Copyright 2022, University of Colorado Boulder

/**
 * Model class for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';

class DecayModel {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, options );

    //TODO
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    //TODO
  }

  /**
   * Steps the model.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step( dt ) {
    //TODO
  }
}

buildANucleus.register( 'DecayModel', DecayModel );
export default DecayModel;
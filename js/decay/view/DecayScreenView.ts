// Copyright 2022, University of Colorado Boulder

/**
 * ScreenView for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusConstants from '../../common/BuildANucleusConstants.js';
import DecayModel from '../model/DecayModel.js';

class DecayScreenView extends ScreenView {

  /**
   * @param {SimulaRasaModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {
    assert && assert( model instanceof DecayModel, 'invalid model' );

    options = merge( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - BuildANucleusConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - BuildANucleusConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }

  /**
   * Resets the view.
   * @public
   */
  reset() {
    //TODO
  }

  /**
   * Steps the view.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step( dt ) {
    //TODO
  }
}

buildANucleus.register( 'DecayScreenView', DecayScreenView );
export default DecayScreenView;
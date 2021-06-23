// Copyright 2021, University of Colorado Boulder

/**
 * @author Luisa Vargas
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BuildANucleusConstants from '../../common/BuildANucleusConstants.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusModel from '../model/BuildANucleusModel.js';

class BuildANucleusScreenView extends ScreenView {

  /**
   * @param {BuildANucleusModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {
    assert && assert( model instanceof BuildANucleusModel, 'invalid model' );
    assert && assert( tandem instanceof Tandem, 'invalid tandem' );

    super( {
      tandem: tandem
    } );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - BuildANucleusConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - BuildANucleusConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem( 'resetAllButton' )
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

buildANucleus.register( 'BuildANucleusScreenView', BuildANucleusScreenView );
export default BuildANucleusScreenView;
// Copyright 2022, University of Colorado Boulder

/**
 * ScreenView class that the 'Decay' and 'Nuclide Chart' will extend.
 *
 * @author Luisa Vargas
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusConstants from '../../common/BuildANucleusConstants.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BuildANucleusModel from '../model/BuildANucleusModel.js';

// types
type BuildANucleusScreenViewSelfOptions = {};
export type BuildANucleusScreenViewOptions =
  BuildANucleusScreenViewSelfOptions
  & PhetioObjectOptions
  & Required<Pick<PhetioObjectOptions, 'tandem'>>;

class BuildANucleusScreenView extends ScreenView {

  constructor( model: BuildANucleusModel, providedOptions?: BuildANucleusScreenViewOptions ) {

    const options = optionize<BuildANucleusScreenViewOptions, BuildANucleusScreenViewSelfOptions, PhetioObjectOptions>( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

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

  public reset(): void {
    //TODO
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public step( dt: number ): void {
    //TODO
  }
}

buildANucleus.register( 'BuildANucleusScreenView', BuildANucleusScreenView );
export default BuildANucleusScreenView;
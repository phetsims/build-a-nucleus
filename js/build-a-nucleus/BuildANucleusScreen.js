// Copyright 2021, University of Colorado Boulder

/**
 * @author Luisa Vargas
 */

import Screen from '../../../joist/js/Screen.js';
import BuildANucleusColorProfile from '../common/BuildANucleusColorProfile.js';
import buildANucleus from '../buildANucleus.js';
import BuildANucleusModel from './model/BuildANucleusModel.js';
import BuildANucleusScreenView from './view/BuildANucleusScreenView.js';

class BuildANucleusScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      //TODO if you include homeScreenIcon or navigationBarIcon, use JOIST/ScreenIcon
      backgroundColorProperty: BuildANucleusColorProfile.screenBackgroundColorProperty,
      tandem: tandem
    };

    super(
      () => new BuildANucleusModel( tandem.createTandem( 'model' ) ),
      model => new BuildANucleusScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

buildANucleus.register( 'BuildANucleusScreen', BuildANucleusScreen );
export default BuildANucleusScreen;
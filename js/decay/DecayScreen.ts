// Copyright 2022, University of Colorado Boulder

/**
 * The 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Screen from '../../../joist/js/Screen.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import buildANucleus from '../buildANucleus.js';
import BuildANucleusColors from '../common/BuildANucleusColors.js';
import DecayModel from '../decay/model/DecayModel.js';
import DecayScreenView from '../decay/view/DecayScreenView.js';
import { ProfileColorProperty } from '../../../scenery/js/imports.js';

// types
type DecayScreenOptions = {
  backgroundColorProperty: ProfileColorProperty,
  tandem: Tandem
};

class DecayScreen extends Screen {

  constructor( providedOptions?: Partial<DecayScreenOptions> ) {

    const options = merge( {
      //TODO if you include homeScreenIcon or navigationBarIcon, use JOIST/ScreenIcon
      backgroundColorProperty: BuildANucleusColors.screenBackgroundColorProperty,

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions ) as DecayScreenOptions;

    super(
      () => new DecayModel( { tandem: options.tandem.createTandem( 'model' ) } ),
        ( model: DecayModel ) => new DecayScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}

buildANucleus.register( 'DecayScreen', DecayScreen );
export default DecayScreen;
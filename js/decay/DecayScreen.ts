// Copyright 2022, University of Colorado Boulder

/**
 * The 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import buildANucleus from '../buildANucleus.js';
import BANColors from '../common/BANColors.js';
import DecayModel from '../decay/model/DecayModel.js';
import DecayScreenView from '../decay/view/DecayScreenView.js';
import buildANucleusStrings from '../buildANucleusStrings.js';

class DecayScreen extends Screen<DecayModel, DecayScreenView> {

  public constructor() {

    const options: ScreenOptions = {
      //TODO if you include homeScreenIcon or navigationBarIcon, use JOIST/ScreenIcon
      name: buildANucleusStrings.decay,

      backgroundColorProperty: BANColors.screenBackgroundColorProperty,
      tandem: Tandem.OPT_OUT
    };

    super(
      () => new DecayModel(),
      model => new DecayScreenView( model, { preventFit: true, tandem: Tandem.OPT_OUT } ),
      options
    );
  }
}

buildANucleus.register( 'DecayScreen', DecayScreen );
export default DecayScreen;
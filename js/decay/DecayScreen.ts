// Copyright 2022, University of Colorado Boulder

/**
 * The 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import buildANucleus from '../buildANucleus.js';
import BANColors from '../common/BANColors.js';
import DecayModel from '../decay/model/DecayModel.js';
import DecayScreenView from '../decay/view/DecayScreenView.js';
import optionize from '../../../phet-core/js/optionize.js';
import { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';

// types
type DecayScreenSelfOptions = {};
export type DecayScreenOptions = DecayScreenSelfOptions & PhetioObjectOptions & Required<Pick<PhetioObjectOptions, 'tandem'>>;

class DecayScreen extends Screen<DecayModel, DecayScreenView> {

  constructor( providedOptions?: DecayScreenOptions ) {

    const options = optionize<DecayScreenOptions, DecayScreenSelfOptions, PhetioObjectOptions>( {
      //TODO if you include homeScreenIcon or navigationBarIcon, use JOIST/ScreenIcon

      // @ts-ignore TODO: get screenBackgroundColorProperty from screen options when that exists
      backgroundColorProperty: BANColors.screenBackgroundColorProperty,

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super(
      () => new DecayModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new DecayScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}

buildANucleus.register( 'DecayScreen', DecayScreen );
export default DecayScreen;
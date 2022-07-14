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
import optionize from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import EmptyObjectType from '../../../phet-core/js/types/EmptyObjectType.js';

// types
export type DecayScreenOptions = ScreenOptions & PickRequired<ScreenOptions, 'tandem'>;

class DecayScreen extends Screen<DecayModel, DecayScreenView> {

  public constructor( providedOptions?: DecayScreenOptions ) {

    const options = optionize<DecayScreenOptions, EmptyObjectType, ScreenOptions>()( {
      //TODO if you include homeScreenIcon or navigationBarIcon, use JOIST/ScreenIcon

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
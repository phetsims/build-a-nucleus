// Copyright 2022, University of Colorado Boulder

/**
 * The 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import buildANucleus from '../buildANucleus.js';
import BANColors from '../common/BANColors.js';
import DecayModel from '../decay/model/DecayModel.js';
import DecayScreenView from '../decay/view/DecayScreenView.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import BuildANucleusStrings from '../BuildANucleusStrings.js';

// types
export type DecayScreenOptions = ScreenOptions & PickRequired<ScreenOptions, 'tandem'>;

class DecayScreen extends Screen<DecayModel, DecayScreenView> {

  public constructor( providedOptions?: DecayScreenOptions ) {

    const options = optionize<DecayScreenOptions, EmptySelfOptions, ScreenOptions>()( {
      //TODO if you include homeScreenIcon or navigationBarIcon, use JOIST/ScreenIcon
      name: BuildANucleusStrings.decayStringProperty,

      backgroundColorProperty: BANColors.screenBackgroundColorProperty
    }, providedOptions );

    super(
      () => new DecayModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new DecayScreenView( model, { tandem: options.tandem.createTandem( 'view' ), preventFit: true } ),
      options
    );
  }
}

buildANucleus.register( 'DecayScreen', DecayScreen );
export default DecayScreen;
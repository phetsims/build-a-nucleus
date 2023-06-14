// Copyright 2022-2023, University of Colorado Boulder

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
import BuildANucleusStrings from '../BuildANucleusStrings.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import IconFactory from './view/IconFactory.js';
import DecayType from '../common/view/DecayType.js';
import { FlowBox } from '../../../scenery/js/imports.js';

// types
export type DecayScreenOptions = ScreenOptions;

class DecayScreen extends Screen<DecayModel, DecayScreenView> {

  public constructor( providedOptions?: DecayScreenOptions ) {

    const options = optionize<DecayScreenOptions, EmptySelfOptions, ScreenOptions>()( {
      //TODO if you include homeScreenIcon or navigationBarIcon, use JOIST/ScreenIcon
      name: BuildANucleusStrings.decayStringProperty,

      backgroundColorProperty: BANColors.screenBackgroundColorProperty,
      homeScreenIcon: createScreenIcon()
    }, providedOptions );

    super(
      () => new DecayModel(),
      model => new DecayScreenView( model, { preventFit: true, tandem: Tandem.OPT_OUT } ),
      options
    );
  }
}

/**
 * Creates the icon for this screen.
 */
function createScreenIcon(): ScreenIcon {
  const iconNode = new FlowBox( { children: [ IconFactory.createDecayIcon( DecayType.ALPHA_DECAY )! ], margin: 3 } );
  return new ScreenIcon( iconNode, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1
  } );
}

buildANucleus.register( 'DecayScreen', DecayScreen );
export default DecayScreen;
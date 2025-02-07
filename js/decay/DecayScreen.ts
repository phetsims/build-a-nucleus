// Copyright 2022-2024, University of Colorado Boulder

/**
 * The 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import BasicActionsKeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import FlowBox from '../../../scenery/js/layout/nodes/FlowBox.js';
import Tandem from '../../../tandem/js/Tandem.js';
import buildANucleus from '../buildANucleus.js';
import BuildANucleusStrings from '../BuildANucleusStrings.js';
import BANColors from '../common/BANColors.js';
import DecayType from '../common/model/DecayType.js';
import IconFactory from '../common/view/IconFactory.js';
import DecayModel from '../decay/model/DecayModel.js';
import DecayScreenView from '../decay/view/DecayScreenView.js';

// types
export type DecayScreenOptions = ScreenOptions;

class DecayScreen extends Screen<DecayModel, DecayScreenView> {

  public constructor( providedOptions?: DecayScreenOptions ) {

    const options =
      optionize<DecayScreenOptions, EmptySelfOptions, ScreenOptions>()( {
        name: BuildANucleusStrings.screen.decayStringProperty,
        backgroundColorProperty: BANColors.screenBackgroundColorProperty,
        homeScreenIcon: createScreenIcon(),
        createKeyboardHelpNode: () => new BasicActionsKeyboardHelpSection( {
          withCheckboxContent: true
        } )
      }, providedOptions );

    super(
      () => new DecayModel(),
      model => new DecayScreenView( model, { tandem: Tandem.OPT_OUT } ),
      options
    );
  }
}

/**
 * Creates the icon for this screen.
 */
function createScreenIcon(): ScreenIcon {

  // We know the ALPHA_DECAY type is a valid decay so null won't be returned
  const iconNode = new FlowBox( { children: [ IconFactory.createDecayIcon( DecayType.ALPHA_DECAY )! ], margin: 3 } );
  return new ScreenIcon( iconNode, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1
  } );
}

buildANucleus.register( 'DecayScreen', DecayScreen );
export default DecayScreen;
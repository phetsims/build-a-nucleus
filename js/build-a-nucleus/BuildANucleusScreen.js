// Copyright 2021, University of Colorado Boulder

/**
 * @author Luisa Vargas
 */

import AtomScreenView from '../../../build-an-atom/js/atom/view/AtomScreenView.js';
import BuildAnAtomModel from '../../../build-an-atom/js/common/model/BuildAnAtomModel.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import nucleusIcon from '../../images/nucleus_icon_png.js';
import nucleusIconSmall from '../../images/nucleus_icon_small_png.js';
import buildANucleus from '../buildANucleus.js';
import buildANucleusStrings from '../buildANucleusStrings.js';

class BuildANucleusScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super(
      () => new BuildAnAtomModel( tandem.createTandem( 'model' ) ),
      model => new AtomScreenView( model, tandem.createTandem( 'view' ) ), {
        name: buildANucleusStrings[ 'build-a-nucleus' ].title,
        homeScreenIcon: new ScreenIcon( new Image( nucleusIcon ), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } ),
        navigationBarIcon: new ScreenIcon( new Image( nucleusIconSmall ), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } ),
        tandem: tandem
      }
    );
  }
}

buildANucleus.register( 'BuildANucleusScreen', BuildANucleusScreen );
export default BuildANucleusScreen;
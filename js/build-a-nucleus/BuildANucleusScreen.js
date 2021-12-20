// Copyright 2021, University of Colorado Boulder

/**
 * @author Luisa Vargas
 */

import BuildAnAtomModel from '../../../build-an-atom/js/common/model/BuildAnAtomModel.js';
import BAAScreenView from '../../../build-an-atom/js/common/view/BAAScreenView.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import nucleusIcon_png from '../../images/nucleusIcon_png.js';
import nucleusIconSmall_png from '../../images/nucleusIconSmall_png.js';
import buildANucleus from '../buildANucleus.js';
import buildANucleusStrings from '../buildANucleusStrings.js';

class BuildANucleusScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super(
      () => new BuildAnAtomModel( tandem.createTandem( 'model' ), {
        includeChargeAndElectrons: false
      } ),
      model => new BAAScreenView( model, tandem.createTandem( 'view' ), {
        buildANucleusSim: true
      } ), {
        name: buildANucleusStrings[ 'build-a-nucleus' ].title,
        homeScreenIcon: new ScreenIcon( new Image( nucleusIcon_png ), {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } ),
        navigationBarIcon: new ScreenIcon( new Image( nucleusIconSmall_png ), {
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
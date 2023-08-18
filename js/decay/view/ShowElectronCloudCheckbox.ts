// Copyright 2022-2023, University of Colorado Boulder

/**
 * The Checkbox used to show the particle atom's electron cloud
 *
 * @author Luisa Vargas
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import buildANucleus from '../../buildANucleus.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import { Circle, HBox, Node, Text } from '../../../../scenery/js/imports.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANConstants from '../../common/BANConstants.js';
import Property from '../../../../axon/js/Property.js';


const ELECTRON_CLOUD_RADIUS = 18; // empirically determined to be close in size to the 'Electron Cloud' text height

class ShowElectronCloudCheckbox extends Checkbox {

  private readonly showElectronCloudBooleanProperty: Property<boolean>;

  public constructor( electronCloud: Node ) {


    // show the electron cloud by default
    const showElectronCloudBooleanProperty = new BooleanProperty( true );

    // create and add the electronCloud checkbox
    const content = new HBox( {
      children: [
        new Text( BuildANucleusStrings.electronCloudStringProperty, {
          font: BANConstants.REGULAR_FONT, maxWidth: 210
        } ),

        // electron cloud icon
        new Circle( {
          radius: ELECTRON_CLOUD_RADIUS,
          fill: BANConstants.ELECTRON_CLOUD_FILL_GRADIENT( ELECTRON_CLOUD_RADIUS )
        } )
      ],
      spacing: 5
    } );

    super( showElectronCloudBooleanProperty, content );

    this.showElectronCloudBooleanProperty = showElectronCloudBooleanProperty;
    this.showElectronCloudBooleanProperty.link( showElectronCloud => { electronCloud.visible = showElectronCloud; } );
  }

  public reset(): void {
    this.showElectronCloudBooleanProperty.reset();
  }
}

buildANucleus.register( 'ShowElectronCloudCheckbox', ShowElectronCloudCheckbox );
export default ShowElectronCloudCheckbox;
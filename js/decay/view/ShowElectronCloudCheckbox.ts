// Copyright 2023, University of Colorado Boulder

/**
 * The Checkbox used to show the particle atom's electron cloud.
 *
 * @author Luisa Vargas
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import { Circle, HBox, Node, Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANConstants from '../../common/BANConstants.js';

class ShowElectronCloudCheckbox extends Checkbox {

  private readonly showElectronCloudBooleanProperty: Property<boolean>;

  public constructor( electronCloud: Node ) {

    // Show the electron cloud by default.
    const showElectronCloudBooleanProperty = new BooleanProperty( true );

    // Create and add the electronCloud checkbox.
    const electronCloudText = new Text( BuildANucleusStrings.electronCloudStringProperty, {
      font: BANConstants.REGULAR_FONT,
      maxWidth: 197 // empirically determined so it doesn't overlap with 'Reset All' button
    } );

    // Empirically determined ratio based on the text, to give the electron cloud a bit of "umph" as an icon.
    const electronCloudIconRadius = electronCloudText.height * 0.82;

    const content = new HBox( {
      children: [
        electronCloudText,

        // Electron cloud icon.
        new Circle( {
          radius: electronCloudIconRadius,
          fill: BANConstants.ELECTRON_CLOUD_FILL_GRADIENT( electronCloudIconRadius )
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
// Copyright 2022, University of Colorado Boulder

/**
 * A node that presents a readout of the number of protons and neutrons.
 *
 * @author Luisa Vargas
 */

import Panel from '../../../../sun/js/Panel.js';
import buildANucleus from '../../buildANucleus.js';
import BANColors from '../BANColors.js';
import { Text, HBox, Rectangle } from '../../../../scenery/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import ParticleType from '../../decay/view/ParticleType.js';
import BANConstants from '../BANConstants.js';

// types
type NucleonLabel = {
  title: Text,
  numberDisplay: NumberDisplay,
  contents: HBox
};

// constants, empirically determined
const LABEL_FONT = new PhetFont( BANConstants.BUTTONS_AND_LEGEND_FONT_SIZE );
const MAX_TITLE_WIDTH = 115;
const MIN_VERTICAL_SPACING = 16;
const PARTICLE_RADIUS = BANConstants.PARTICLE_RADIUS;

class NucleonCountPanel extends Panel {

  constructor( protonCountProperty: NumberProperty, neutronCountProperty: NumberProperty ) {

    const options = {
      fill: BANColors.panelBackgroundColorProperty,
      xMargin: 10
    };

    const panelContents = new Rectangle( 0, 0, 140, 40 ); // empirically determined

    // function to create the nucleon labels and add them to panelContents
    const nucleonLabel = ( nucleonString: string, nucleonType: ParticleType, nucleonCountProperty: NumberProperty ): NucleonLabel => {

      const nucleonTitle = new Text( nucleonString, {
        font: LABEL_FONT
      } );
      nucleonTitle.maxWidth = MAX_TITLE_WIDTH;
      const nucleonParticleNode = new ParticleNode( nucleonType.name.toLowerCase(), PARTICLE_RADIUS );
      const nucleonContents = new HBox( { spacing: 5, children: [ nucleonParticleNode, nucleonTitle ] } );
      nucleonTitle.left = nucleonParticleNode.right + nucleonParticleNode.width / 2;
      nucleonTitle.top = nucleonContents.top;
      nucleonParticleNode.centerY = nucleonTitle.centerY;
      panelContents.addChild( nucleonContents );

      const nucleonNumberDisplay = new NumberDisplay( nucleonCountProperty, nucleonCountProperty.range, {
        align: 'right',
        textOptions: {
          font: LABEL_FONT
        },
        backgroundFill: null,
        backgroundStroke: null
      } );
      nucleonNumberDisplay.right = panelContents.right;
      panelContents.addChild( nucleonNumberDisplay );

      return {
        title: nucleonTitle,
        numberDisplay: nucleonNumberDisplay,
        contents: nucleonContents
      };
    };

    // create the nucleon labels
    const protonLabel = nucleonLabel( buildANucleusStrings.protonsColon, ParticleType.PROTON, protonCountProperty );
    const neutronLabel = nucleonLabel( buildANucleusStrings.neutronsColon, ParticleType.NEUTRON, neutronCountProperty );

    // position the protonLabel at the top and the neutronLabel at the bottom, and align their respective numberDisplay's
    protonLabel.contents.top = 0;
    protonLabel.numberDisplay.centerY = protonLabel.contents.centerY;
    neutronLabel.contents.bottom = protonLabel.title.bottom + Math.max( neutronLabel.title.height, MIN_VERTICAL_SPACING );
    neutronLabel.numberDisplay.centerY = neutronLabel.contents.centerY;

    super( panelContents, options );
  }
}

buildANucleus.register( 'NucleonCountPanel', NucleonCountPanel );
export default NucleonCountPanel;
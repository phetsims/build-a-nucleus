// Copyright 2022, University of Colorado Boulder

/**
 * A node that presents a readout of the number of protons and neutrons.
 *
 * @author Luisa Vargas
 */

import Panel from '../../../../sun/js/Panel.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusColors from '../BuildANucleusColors.js';
import { Text, HBox, Rectangle } from '../../../../scenery/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';

//types
type nucleonLabel = {
  nucleonTitle: Text,
  nucleonParticleNode: ParticleNode,
  nucleonNumberDisplay: NumberDisplay,
  nucleonContents: HBox
};

// constants, empirically determined
const LABEL_FONT = new PhetFont( 17 );
const MAX_TITLE_WIDTH = 115;
const MIN_VERTICAL_SPACING = 16;
const PARTICLE_RADIUS = 6;

class NucleonCountPanel extends Panel {

  constructor( protonCountProperty: NumberProperty, neutronCountProperty: NumberProperty ) {

    const options = {
      fill: BuildANucleusColors.panelBackgroundColorProperty
    };

    const panelContents = new Rectangle( 0, 0, 140, 40 );

    const nucleonLabel = ( nucleonString: string, nucleonType: string, nucleonCountProperty: NumberProperty ): nucleonLabel => {

      const nucleonTitle = new Text( nucleonString, {
        font: LABEL_FONT
      } );
      nucleonTitle.maxWidth = MAX_TITLE_WIDTH;
      const nucleonParticleNode = new ParticleNode( nucleonType, PARTICLE_RADIUS );
      const nucleonContents = new HBox( { spacing: 5, children: [ nucleonParticleNode, nucleonTitle ] } );
      panelContents.addChild( nucleonContents );

      const nucleonNumberDisplay = new NumberDisplay( nucleonCountProperty, nucleonCountProperty.range, {
        align: 'right',
        textOptions: {
          font: LABEL_FONT
        },
        backgroundFill: null,
        backgroundStroke: null
      } );
      panelContents.addChild( nucleonNumberDisplay );

      return {
        nucleonTitle: nucleonTitle,
        nucleonParticleNode: nucleonParticleNode,
        nucleonNumberDisplay: nucleonNumberDisplay,
        nucleonContents: nucleonContents
      };
    };
    const protonLabel = nucleonLabel( buildANucleusStrings.protonsColon, 'proton', protonCountProperty );
    const neutronLabel = nucleonLabel( buildANucleusStrings.neutronsColon, 'neutron', neutronCountProperty );
    protonLabel.nucleonContents.top = 0;
    protonLabel.nucleonTitle.left = protonLabel.nucleonParticleNode.right + protonLabel.nucleonParticleNode.width / 2;
    protonLabel.nucleonTitle.top = protonLabel.nucleonContents.top;
    protonLabel.nucleonParticleNode.centerY = protonLabel.nucleonTitle.centerY;
    protonLabel.nucleonNumberDisplay.right = panelContents.right;
    protonLabel.nucleonNumberDisplay.centerY = protonLabel.nucleonContents.centerY;

    neutronLabel.nucleonContents.bottom = protonLabel.nucleonTitle.bottom + Math.max( neutronLabel.nucleonTitle.height, MIN_VERTICAL_SPACING );
    neutronLabel.nucleonTitle.left = neutronLabel.nucleonParticleNode.right + neutronLabel.nucleonParticleNode.width / 2;
    neutronLabel.nucleonParticleNode.centerY = neutronLabel.nucleonTitle.centerY;
    neutronLabel.nucleonNumberDisplay.right = panelContents.right;
    neutronLabel.nucleonNumberDisplay.centerY = neutronLabel.nucleonContents.centerY;

    super( panelContents, options );
  }
}

buildANucleus.register( 'NucleonCountPanel', NucleonCountPanel );
export default NucleonCountPanel;
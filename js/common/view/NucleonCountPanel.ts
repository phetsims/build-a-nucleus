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

    const protonTitle = new Text( buildANucleusStrings.protonsColon, {
      font: LABEL_FONT
    } );
    protonTitle.maxWidth = MAX_TITLE_WIDTH;
    const protonParticleNode = new ParticleNode( 'proton', PARTICLE_RADIUS );
    const protonNumberDisplay = new NumberDisplay( protonCountProperty, protonCountProperty.range, {
      align: 'right',
      textOptions: {
        font: LABEL_FONT
      },
      backgroundFill: null,
      backgroundStroke: null
    } );
    panelContents.addChild( protonNumberDisplay );
    const protonContents = new HBox( { spacing: 5, children: [ protonParticleNode, protonTitle ] } );
    panelContents.addChild( protonContents );

    const neutronTitle = new Text( buildANucleusStrings.neutronsColon, {
      font: LABEL_FONT
    } );
    neutronTitle.maxWidth = MAX_TITLE_WIDTH;
    const neutronParticleNode = new ParticleNode( 'neutron', PARTICLE_RADIUS );
    const neutronNumberDisplay = new NumberDisplay( neutronCountProperty, neutronCountProperty.range, {
      align: 'right',
      textOptions: {
        font: LABEL_FONT
      },
      backgroundFill: null,
      backgroundStroke: null
    } );
    panelContents.addChild( neutronNumberDisplay );
    const neutronContents = new HBox( { spacing: 5, children: [ neutronParticleNode, neutronTitle ] } );
    panelContents.addChild( neutronContents );

    protonContents.top = 0;
    protonTitle.left = protonParticleNode.right + protonParticleNode.width / 2;
    protonTitle.top = protonContents.top;
    protonParticleNode.centerY = protonTitle.centerY;
    protonNumberDisplay.right = panelContents.right;
    protonNumberDisplay.centerY = protonContents.centerY;

    neutronContents.bottom = protonTitle.bottom + Math.max( neutronTitle.height, MIN_VERTICAL_SPACING );
    neutronTitle.left = neutronParticleNode.right + neutronParticleNode.width / 2;
    neutronParticleNode.centerY = neutronTitle.centerY;
    neutronNumberDisplay.right = panelContents.right;
    neutronNumberDisplay.centerY = neutronContents.centerY;

    super( panelContents, options );
  }
}

buildANucleus.register( 'NucleonCountPanel', NucleonCountPanel );
export default NucleonCountPanel;
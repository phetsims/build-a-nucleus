// Copyright 2022, University of Colorado Boulder

/**
 * @author Luisa Vargas
 */

import Panel from '../../../../sun/js/Panel.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusColors from '../BuildANucleusColors.js';
import { Node, Text, HBox } from '../../../../scenery/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';

// strings
const protonsColonString = buildANucleusStrings.protonsColon;
const neutronsColonString = buildANucleusStrings.neutronsColon;

// constants, empirically determined
const LABEL_FONT = new PhetFont( 12 );
const MAX_TITLE_WIDTH = 84;
const MIN_VERTICAL_SPACING = 16;
const PARTICLE_RADIUS = 4.5;

class NucleonCountPanel extends Panel {

  constructor( protonCountProperty: NumberProperty, neutronCountProperty: NumberProperty ) {

    const options = {
      fill: BuildANucleusColors.panelBackgroundColorProperty
    };

    const panelContents = new Node();

    const protonLabel = new Node();
    const protonTitle = new Text( protonsColonString, {
      font: LABEL_FONT
    } );
    protonTitle.maxWidth = MAX_TITLE_WIDTH;
    protonLabel.addChild( protonTitle );
    const protonParticleNode = new ParticleNode( 'proton', PARTICLE_RADIUS );
    protonLabel.addChild( protonParticleNode );
    const protonCountLabel = new Text( protonCountProperty.value, {
      font: LABEL_FONT
    } );
    const protonContents = new HBox( { spacing: 15, children: [ protonLabel, protonCountLabel ] } );
    panelContents.addChild( protonContents );

    const neutronLabel = new Node();
    const neutronTitle = new Text( neutronsColonString, {
      font: LABEL_FONT
    } );
    neutronTitle.maxWidth = MAX_TITLE_WIDTH;
    neutronLabel.addChild( neutronTitle );
    const neutronParticleNode = new ParticleNode( 'neutron', PARTICLE_RADIUS );
    neutronLabel.addChild( neutronParticleNode );
    const neutronCountLabel = new Text( neutronCountProperty.value, {
      font: LABEL_FONT
    } );
    const neutronContents = new HBox( { spacing: 15, children: [ neutronLabel, neutronCountLabel ] } );
    panelContents.addChild( neutronContents );

    const maxLabelWidth = Math.max( protonTitle.width + protonParticleNode.width * ( 3 / 2 ),
      neutronTitle.width + neutronParticleNode.width * ( 3 / 2 ) );

    protonContents.top = 0;
    protonParticleNode.left = maxLabelWidth;
    protonTitle.left = protonParticleNode.right + protonParticleNode.width / 2;
    protonTitle.top = protonContents.top;
    protonParticleNode.centerY = protonTitle.centerY;

    neutronContents.bottom = protonTitle.bottom + Math.max( neutronTitle.height, MIN_VERTICAL_SPACING );
    neutronParticleNode.left = maxLabelWidth;
    neutronTitle.left = neutronParticleNode.right + neutronParticleNode.width / 2;
    neutronParticleNode.centerY = neutronTitle.centerY;

    // update the protonCount and neutronCount labels
    protonCountProperty.link( ( protonCount: number ) => {
      protonCountLabel.text = protonCount;
    } );
    neutronCountProperty.link( ( neutronCount: number ) => {
      neutronCountLabel.text = neutronCount;
    } );

    super( panelContents, options );
  }
}

buildANucleus.register( 'NucleonCountPanel', NucleonCountPanel );
export default NucleonCountPanel;
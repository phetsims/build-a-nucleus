// Copyright 2022-2024, University of Colorado Boulder

/**
 * A node that presents a readout of the number of protons and neutrons.
 *
 * @author Luisa Vargas
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Rectangle, Text } from '../../../../scenery/js/imports.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import Panel from '../../../../sun/js/Panel.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANConstants from '../BANConstants.js';
import ParticleType from '../model/ParticleType.js';

// types
type NucleonLabel = {
  particleNode: ParticleNode;
  numberDisplays: NumberDisplay[];
  contents: HBox;
};

// constants, empirically determined
const LABEL_FONT = new PhetFont( BANConstants.BUTTONS_AND_LEGEND_FONT_SIZE );
const MAX_TITLE_WIDTH = 90;
const MIN_VERTICAL_SPACING = 25;
const NUCLEON_PARTICLE_RADIUS = BANConstants.PARTICLE_RADIUS * 0.7;

class NucleonNumberPanel extends Panel {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, protonNumberRange: Range,
                      neutronCountProperty: TReadOnlyProperty<number>, neutronNumberRange: Range ) {

    const panelContents = new Rectangle( 0, 0, 140, 40 ); // Empirically determined.

    // Function to create the nucleon labels and add them to panelContents.
    const nucleonLabel = ( nucleonStringProperty: TReadOnlyProperty<string>, nucleonType: ParticleType,
                           nucleonCountProperty: TReadOnlyProperty<number>, nucleonNumberRange: Range ): NucleonLabel => {

      // The nucleon title and icon pair.
      const nucleonTitle = new Text( nucleonStringProperty, { font: LABEL_FONT, maxWidth: MAX_TITLE_WIDTH } );
      const nucleonParticleNode = new ParticleNode( nucleonType.particleTypeString, NUCLEON_PARTICLE_RADIUS );
      const nucleonContents = new HBox( { spacing: 5, children: [ nucleonParticleNode, nucleonTitle ] } );
      nucleonTitle.left = nucleonParticleNode.right + nucleonParticleNode.width / 2;
      nucleonTitle.top = nucleonContents.top;
      nucleonParticleNode.centerY = nucleonTitle.centerY;
      panelContents.addChild( nucleonContents );

      // Shows the new value of nucleonCountProperty.
      const newNucleonNumberDisplay = new NumberDisplay( nucleonCountProperty, nucleonNumberRange, {
        align: 'right',
        textOptions: {
          font: LABEL_FONT
        },
        backgroundFill: null,
        backgroundStroke: null
      } );
      newNucleonNumberDisplay.right = panelContents.right;
      panelContents.addChild( newNucleonNumberDisplay );

      const oldNucleonNumberProperty = new NumberProperty( nucleonCountProperty.value, {
        validValues: Utils.rangeInclusive( nucleonNumberRange.min, nucleonNumberRange.max )
      } );

      // Shows the old value of nucleonCountProperty.
      const oldNucleonNumberDisplay = new NumberDisplay( oldNucleonNumberProperty, nucleonNumberRange, {
        align: 'right',
        textOptions: {
          font: LABEL_FONT
        },
        backgroundFill: null,
        backgroundStroke: null
      } );
      oldNucleonNumberDisplay.right = panelContents.right;
      panelContents.addChild( oldNucleonNumberDisplay );

      // Start removing oldNucleonNumberDisplay by making it more opaque.
      const startRemovingNucleonNumberDisplay = new Animation( {
        to: 0.33,
        property: oldNucleonNumberDisplay.opacityProperty,
        duration: 0.1, // seconds
        easing: Easing.LINEAR
      } );

      // 'Replace' the oldNucleonNumberDisplay with the newNucleonNumberDisplay.
      const addNucleonNumberDisplay = new Animation( {
        targets: [ {
          to: 1,
          property: newNucleonNumberDisplay.opacityProperty
        }, {
          to: 0,
          property: oldNucleonNumberDisplay.opacityProperty
        }
        ],
        duration: 0.1,
        easing: Easing.LINEAR
      } );

      // Start showing the newNucleonNumberDisplay when the oldNucleonNumberDisplay has started becoming opaque.
      startRemovingNucleonNumberDisplay.then( addNucleonNumberDisplay );

      // At the end of both animations, reset the values and opacities of oldNucleonNumberDisplay and newNucleonNumberDisplay.
      addNucleonNumberDisplay.finishEmitter.addListener( () => {
        oldNucleonNumberProperty.value = nucleonCountProperty.value;
        oldNucleonNumberDisplay.opacity = 1;
        newNucleonNumberDisplay.opacity = 0;
      } );

      nucleonCountProperty.link( () => {
        startRemovingNucleonNumberDisplay.start();
      } );

      return {
        particleNode: nucleonParticleNode,
        numberDisplays: [ oldNucleonNumberDisplay, newNucleonNumberDisplay ],
        contents: nucleonContents
      };
    };

    // Create the nucleon labels.
    const protonLabel = nucleonLabel( BuildANucleusStrings.protonsColonStringProperty,
      ParticleType.PROTON, protonCountProperty, protonNumberRange );
    const neutronLabel = nucleonLabel( BuildANucleusStrings.neutronsColonStringProperty,
      ParticleType.NEUTRON, neutronCountProperty, neutronNumberRange );

    // Position the protonLabel at the top and the neutronLabel at the bottom, and align their respective numberDisplay's.
    protonLabel.contents.top = 0;
    protonLabel.numberDisplays.forEach( numberDisplay => {
      numberDisplay.centerY = protonLabel.contents.centerY;
    } );
    neutronLabel.contents.bottom = protonLabel.particleNode.bottom
                                   + Math.max( neutronLabel.particleNode.height, MIN_VERTICAL_SPACING );
    neutronLabel.numberDisplays.forEach( numberDisplay => {
      numberDisplay.centerY = neutronLabel.contents.centerY;
    } );

    super( panelContents, BANConstants.PANEL_OPTIONS );
  }
}

buildANucleus.register( 'NucleonNumberPanel', NucleonNumberPanel );
export default NucleonNumberPanel;
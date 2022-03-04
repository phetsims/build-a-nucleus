// Copyright 2022, University of Colorado Boulder

/**
 * A node that represents the available decays a given nuclide can undergo.
 *
 * @author Luisa Vargas
 */

import Panel from '../../../../sun/js/Panel.js';
import buildANucleus from '../../buildANucleus.js';
import { HBox, RichText, Text, VBox, Line, Rectangle } from '../../../../scenery/js/imports.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import ParticleType from './ParticleType.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import DecayType from './DecayType.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';

// constants
const LABEL_FONT = new PhetFont( BANConstants.BUTTONS_AND_LEGEND_FONT_SIZE );
const TITLE_FONT = new PhetFont( 24 );
const SPACING = 10;
const NUCLEON_PARTICLE_RADIUS = BANConstants.PARTICLE_RADIUS;
const ALPHA_PARTICLE_SPACING = -5;
const BUTTON_TEXT_BOTTOM_MARGIN = 8;
const BUTTON_HEIGHT = 35;
const BUTTON_CONTENT_WIDTH = 175;

class AvailableDecaysPanel extends Panel {

  constructor() {

    const options = {
      xMargin: 15,
      yMargin: 15,
      fill: '#F2F2F2',
      stroke: '#E4E4E4'
    };

    // TODO: investigate why a rectangle is needed, why isn't the contentNode centered correctly with just a node?
    const contentNode = new Rectangle( 0, 0, 0, 0 );

    // create and add the title
    const titleNode = new Text( buildANucleusStrings.availableDecays, { font: TITLE_FONT } );
    titleNode.centerX = contentNode.centerX;
    contentNode.addChild( titleNode );

    // create the decay buttons
    const decayButtons: RectangularPushButton[] = [];

    // manually layout the button text due to the superscripts causing the normal layout to look out of place
    const createDecayButton = ( decayType: DecayType ): void => {
      const buttonBackgroundRectangle = new Rectangle( 0, 0, BUTTON_CONTENT_WIDTH, BUTTON_HEIGHT );
      const buttonText = new RichText( decayType.label, { font: LABEL_FONT, maxWidth: BUTTON_CONTENT_WIDTH } );

      assert && assert( BUTTON_TEXT_BOTTOM_MARGIN + buttonText.height < BUTTON_HEIGHT, 'The button text is changing the size of the button.' );
      buttonText.centerBottom = buttonBackgroundRectangle.centerBottom.minusXY( 0, BUTTON_TEXT_BOTTOM_MARGIN );
      buttonBackgroundRectangle.addChild( buttonText );

      decayButtons.push( new RectangularPushButton( {
        content: buttonBackgroundRectangle,
        yMargin: 0,
        baseColor: BANColors.decayButtonColorProperty,
        enabled: false
      } ) );
    };
    DecayType.enumeration.values.forEach( decayType => createDecayButton( decayType ) );
    const arrangedDecayButtons = new VBox( {
      children: decayButtons,
      spacing: SPACING
    } );

    // create the decay icons

    // function to create a particle node ( a circle with a specific color ), make it bigger if the particle is a nucleon
    const createParticleNode = ( particleType: ParticleType ): ParticleNode => {
      return new ParticleNode( particleType.name.toLowerCase(),
        particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ? NUCLEON_PARTICLE_RADIUS : NUCLEON_PARTICLE_RADIUS * 0.8
      );
    };

    // function to create the right-aligned horizontal motion lines used in the decay icons ( the top and bottom lines are
    // shorter than the middle line )
    const createMotionLines = ( spacingBetweenLines: number ): VBox => {
      const motionLines: Line[] = [];
      for ( let i = 0; i < 3; i++ ) {
        motionLines.push( new Line( 0, 0, i % 2 === 0 ? 25 : 40, 0, { stroke: BANColors.blueDecayIconSymbolsColorProperty } ) );
      }
      return new VBox( {
        children: motionLines,
        spacing: spacingBetweenLines,
        align: 'right'
      } );
    };

    // function to create the icon for a nucleon emission ( a nucleon particle node with motion lines to its left )
    const createNucleonEmissionIcon = ( particleType: ParticleType ) => {
      return new HBox( {
        children: [
          createMotionLines( 3 ),
          new ParticleNode( particleType.name.toLowerCase(), NUCLEON_PARTICLE_RADIUS )
        ],
        spacing: SPACING / 4
      } );
    };

    // function to create the icon for a beta decay ( left to right contents: a nucleon particle node, a right-pointing arrow,
    // a different nucleon particle node than the first one, a mathematical 'plus' symbol, and an electron or positron )
    const createBetaDecayIcon = ( isBetaMinusDecay: boolean ) => {
      return new HBox( {
        children: [
          isBetaMinusDecay ? createParticleNode( ParticleType.NEUTRON ) : createParticleNode( ParticleType.PROTON ),
          new ArrowNode( 0, 0, 25, 0, {
            fill: BANColors.blueDecayIconSymbolsColorProperty,
            stroke: null,
            tailWidth: 1,
            headWidth: 7.5
          } ),
          isBetaMinusDecay ? createParticleNode( ParticleType.PROTON ) : createParticleNode( ParticleType.NEUTRON ),
          new PlusNode( { fill: BANColors.blueDecayIconSymbolsColorProperty, size: new Dimension2( 10, 2.5 ) } ),
          isBetaMinusDecay ? createParticleNode( ParticleType.ELECTRON ) : createParticleNode( ParticleType.POSITRON )
        ],
        spacing: SPACING / 3
      } );
    };

    // function to create half of an alpha particle ( two particle nodes beside each other, slightly overlapping )
    const createHalfAlphaParticle = ( particleNodes: ParticleNode[] ): HBox => {
      return new HBox( {
        children: particleNodes,
        spacing: ALPHA_PARTICLE_SPACING
      } );
    };

    // create the decay icons
    const decayIcons = new VBox( {
      children: [
        // alpha decay icon ( four slightly overlapping particle nodes, two on top and two on the bottom, with motion lines to their left )
        new HBox( {
          children: [
            createMotionLines( 5 ),
            new VBox( {
              children: [
                createHalfAlphaParticle( [ createParticleNode( ParticleType.PROTON ), createParticleNode( ParticleType.NEUTRON ) ] ),
                createHalfAlphaParticle( [ createParticleNode( ParticleType.NEUTRON ), createParticleNode( ParticleType.PROTON ) ] )
              ],
              spacing: ALPHA_PARTICLE_SPACING
            } )
          ],
          spacing: SPACING / 4
        } ),
        createBetaDecayIcon( true ), // beta minus decay icon
        createBetaDecayIcon( false ), // beta plus decay icon
        createNucleonEmissionIcon( ParticleType.PROTON ), // proton emission icon
        createNucleonEmissionIcon( ParticleType.NEUTRON ) // neutron emission icon
      ],
      spacing: SPACING * 3.25,
      align: 'left'
    } );

    // add the decay buttons and icons
    const decaySection = new HBox( {
      children: [ arrangedDecayButtons, decayIcons ],
      spacing: SPACING * 2,
      align: 'center'
    } );
    decaySection.top = titleNode.bottom + SPACING;
    decaySection.centerX = contentNode.centerX;
    contentNode.addChild( decaySection );

    // create and add the separator
    const separator = new HSeparator( 280, { stroke: '#CACACA' } );
    separator.centerY = decaySection.bottom + SPACING;
    separator.centerX = contentNode.centerX;
    contentNode.addChild( separator );

    // create and add the particle labels
    // a particle label is a particle node on the left with its corresponding particle name on the right
    const createParticleLabel = ( particleType: ParticleType ): HBox => {
      return new HBox( {
        children: [
          new ParticleNode( particleType.name.toLowerCase(), NUCLEON_PARTICLE_RADIUS ),
          new Text( particleType.label, { font: LABEL_FONT } )
        ],
        spacing: SPACING
      } );
    };
    const particleLabels = ParticleType.enumeration.values.map( particleType => createParticleLabel( particleType ) );
    const createParticleLabelsVBox = ( particleLabels: HBox[] ) => {
      return new VBox( {
        children: particleLabels,
        spacing: SPACING,
        align: 'left'
      } );
    };
    const particleLabelsLegend = new HBox( {
      children: [
        createParticleLabelsVBox( [ particleLabels[ 0 ], particleLabels[ 2 ] ] ),
        createParticleLabelsVBox( [ particleLabels[ 1 ], particleLabels[ 3 ] ] )
      ],
      spacing: SPACING * 5
    } );
    particleLabelsLegend.top = separator.bottom + SPACING;
    particleLabelsLegend.centerX = contentNode.centerX;
    contentNode.addChild( particleLabelsLegend );

    super( contentNode, options );
  }
}

buildANucleus.register( 'AvailableDecaysPanel', AvailableDecaysPanel );
export default AvailableDecaysPanel;
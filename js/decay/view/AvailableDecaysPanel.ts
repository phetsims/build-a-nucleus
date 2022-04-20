// Copyright 2022, University of Colorado Boulder

/**
 * A node that represents the available decays a given nuclide can undergo.
 *
 * @author Luisa Vargas
 */

import Panel from '../../../../sun/js/Panel.js';
import buildANucleus from '../../buildANucleus.js';
import { HBox, Line, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
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
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DecayModel from '../model/DecayModel.js';

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

  constructor( model: DecayModel ) {

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

    // function to return the correct enabled derived property for each type of decay
    const returnEnabledDecayButtonProperty = ( decayType: DecayType ): DerivedProperty<boolean, [ protonCount: number, neutronCount: number ]> => {
      switch( decayType ) {
        case DecayType.PROTON_EMISSION:
          return model.protonEmissionEnabledProperty;
        case DecayType.NEUTRON_EMISSION:
          return model.neutronEmissionEnabledProperty;
        case DecayType.BETA_MINUS_DECAY:
          return model.betaMinusDecayEnabledProperty;
        case DecayType.BETA_PLUS_DECAY:
          return model.betaPlusDecayEnabledProperty;
        case DecayType.ALPHA_DECAY:
          return model.alphaDecayEnabledProperty;
        default:
          assert && assert( false, 'No valid decay type found: ' + decayType );
          return model.protonEmissionEnabledProperty;
      }
    };

    // function that creates the listeners for the decay buttons. Changes the protonCountProperty and neutronCountProperty
    // values depending on the decay type
    const createDecayButtonListener = ( decayType: DecayType ) => {
      switch( decayType ) {
        case DecayType.PROTON_EMISSION:
          model.protonCountProperty.value--;
          break;
        case DecayType.NEUTRON_EMISSION:
          model.neutronCountProperty.value--;
          break;
        case DecayType.BETA_MINUS_DECAY:
          model.neutronCountProperty.value--;
          model.protonCountProperty.value++;
          break;
        case DecayType.BETA_PLUS_DECAY:
          model.neutronCountProperty.value++;
          model.protonCountProperty.value--;
          break;
        case DecayType.ALPHA_DECAY:
          model.neutronCountProperty.value -= 2;
          model.protonCountProperty.value -= 2;
          break;
        default:
          break;
      }
    };

    // function to create the decay buttons
    // manually layout the button text due to the superscripts causing the normal layout to look out of place
    const createDecayButton = ( decayType: DecayType ): RectangularPushButton => {
      const buttonBackgroundRectangle = new Rectangle( 0, 0, BUTTON_CONTENT_WIDTH, BUTTON_HEIGHT );
      const buttonText = new RichText( decayType.label, { font: LABEL_FONT, maxWidth: BUTTON_CONTENT_WIDTH } );

      assert && assert( BUTTON_TEXT_BOTTOM_MARGIN + buttonText.height < BUTTON_HEIGHT, 'The button text is changing the size of the button.' );
      buttonText.centerBottom = buttonBackgroundRectangle.centerBottom.minusXY( 0, BUTTON_TEXT_BOTTOM_MARGIN );
      buttonBackgroundRectangle.addChild( buttonText );

      return new RectangularPushButton( {
        content: buttonBackgroundRectangle,
        yMargin: 0,
        baseColor: BANColors.decayButtonColorProperty,
        enabledProperty: returnEnabledDecayButtonProperty( decayType ),
        listener: () => { createDecayButtonListener( decayType ); }
      } );
    };

    // functions to create the decay icons

    // function to create a particle node ( a circle with a specific color ), make it bigger if the particle is a nucleon
    const createParticleNode = ( particleType: ParticleType ): ParticleNode => {
      return new ParticleNode( particleType.name.toLowerCase(),
        particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ? NUCLEON_PARTICLE_RADIUS : NUCLEON_PARTICLE_RADIUS * 0.7
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
    const createNucleonEmissionIcon = ( particleType: ParticleType ): HBox => {
      return new HBox( {
        children: [
          createMotionLines( 4 ),
          new ParticleNode( particleType.name.toLowerCase(), NUCLEON_PARTICLE_RADIUS )
        ],
        spacing: SPACING / 4
      } );
    };

    // function to create the icon for a beta decay ( left to right contents: a nucleon particle node, a right-pointing arrow,
    // a different nucleon particle node than the first one, a mathematical 'plus' symbol, and an electron or positron )
    const createBetaDecayIcon = ( isBetaMinusDecay: boolean ): HBox => {
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
          new PlusNode( { fill: BANColors.blueDecayIconSymbolsColorProperty, size: new Dimension2( 9, 2 ) } ),
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

    // function to create an alpha decay icon ( four slightly overlapping particle nodes, two on top and two on the bottom,
    // with motion lines to their left )
    const createAlphaDecayIcon = (): HBox => {
      return new HBox( {
        children: [
          createMotionLines( 6 ),
          new VBox( {
            children: [
              createHalfAlphaParticle( [ createParticleNode( ParticleType.PROTON ), createParticleNode( ParticleType.NEUTRON ) ] ),
              createHalfAlphaParticle( [ createParticleNode( ParticleType.NEUTRON ), createParticleNode( ParticleType.PROTON ) ] )
            ],
            spacing: ALPHA_PARTICLE_SPACING
          } )
        ],
        spacing: SPACING / 4
      } );
    };

    // function to create the decay icons corresponding to a specific DecayType
    const createDecayIcon = ( decayType: DecayType ): HBox | null => {
      switch( decayType ) {
        case DecayType.ALPHA_DECAY:
          return createAlphaDecayIcon(); // alpha decay icon
        case DecayType.BETA_MINUS_DECAY:
          return createBetaDecayIcon( true ); // beta minus decay icon
        case DecayType.BETA_PLUS_DECAY:
          return createBetaDecayIcon( false ); // beta plus decay icon
        case DecayType.PROTON_EMISSION:
          return createNucleonEmissionIcon( ParticleType.PROTON ); // proton emission icon
        case DecayType.NEUTRON_EMISSION:
          return createNucleonEmissionIcon( ParticleType.NEUTRON ); // neutron emission icon
        default:
          return null;
      }
    };

    // function to create the decay button and corresponding decay icon pair
    const createDecayButtonAndIcon = ( decayType: DecayType ): HBox => {
      return new HBox( {
        children: [
          createDecayButton( decayType ),
          createDecayIcon( decayType )!
        ],
        spacing: SPACING * 2,
        align: 'center'
      } );
    };

    // create the decay button and icon pair in a VBox
    const decayButtonsAndIcons: HBox[] = [];
    DecayType.enumeration.values.forEach( decayType => decayButtonsAndIcons.push( createDecayButtonAndIcon( decayType ) ) );
    const arrangedDecayButtonsAndIcons = new VBox( {
      children: decayButtonsAndIcons,
      spacing: SPACING,
      align: 'left'
    } );

    // add the decay buttons and icons
    arrangedDecayButtonsAndIcons.top = titleNode.bottom + SPACING;
    arrangedDecayButtonsAndIcons.centerX = contentNode.centerX;
    contentNode.addChild( arrangedDecayButtonsAndIcons );

    // create and add the separator
    const separator = new HSeparator( 280, { stroke: '#CACACA' } );
    separator.centerY = arrangedDecayButtonsAndIcons.bottom + SPACING;
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
// Copyright 2022-2023, University of Colorado Boulder

/**
 * A node that represents the available decays a given nuclide can undergo.
 *
 * @author Luisa Vargas
 */

import Panel from '../../../../sun/js/Panel.js';
import buildANucleus from '../../buildANucleus.js';
import { HBox, HSeparator, Node, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import ParticleType from '../../common/model/ParticleType.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import DecayType from '../../common/model/DecayType.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';
import DecayModel from '../model/DecayModel.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import Dialog from '../../../../sun/js/Dialog.js';
import IconFactory from './IconFactory.js';

// constants
const LABEL_FONT = new PhetFont( BANConstants.BUTTONS_AND_LEGEND_FONT_SIZE );
const TITLE_FONT = new PhetFont( 24 );
const SPACING = 10;
const NUCLEON_PARTICLE_RADIUS = BANConstants.PARTICLE_RADIUS * 0.7;
const ELECTRON_PARTICLE_RADIUS = NUCLEON_PARTICLE_RADIUS * 0.8;
const BUTTON_TEXT_BOTTOM_MARGIN = 8;
const BUTTON_HEIGHT = 35;
const BUTTON_CONTENT_WIDTH = 145;

type decayTypeButtonIndexType = Record<string, number>;
type SelfOptions = {

  decayAtom: ( decayType: DecayType ) => void;

  // function to store current nucleon counts
  storeNucleonCounts: () => void;

  // function to show and reposition the undo decay button
  showAndRepositionUndoDecayButton: ( decayType: string ) => void;
};
export type AvailableDecaysPanelOptions = SelfOptions;

class AvailableDecaysPanel extends Panel {

  // decay button and icon pair
  public readonly arrangedDecayButtonsAndIcons: Node;

  // map of decayType => {arrayIndex}
  public decayTypeButtonIndexMap: decayTypeButtonIndexType;

  public constructor( model: DecayModel, options: AvailableDecaysPanelOptions ) {

    // create and add the title
    const titleNode = new Text( BuildANucleusStrings.availableDecaysStringProperty, {
      font: TITLE_FONT, maxWidth: 250
    } );

    // create and add the decays info dialog and button
    const decaysInfoDialog = new Dialog(
      new RichText( BuildANucleusStrings.availableDecaysInfoPanelTextStringProperty, {
        font: BANConstants.REGULAR_FONT,
        lineWrap: 400,
        maxWidth: 400
      } ),
      {
        topMargin: 40,
        bottomMargin: 30
      }
    );
    const decaysInfoButton = new InfoButton( {
      listener: () => decaysInfoDialog.show(),
      maxHeight: BANConstants.INFO_BUTTON_MAX_HEIGHT,
      baseColor: 'rgb( 400, 400, 400 )'
    } );

    // function to return the correct enabled derived property for each type of decay
    const returnEnabledDecayButtonProperty = ( decayType: DecayType ): TReadOnlyProperty<boolean> => {
      switch( decayType ) {
        case DecayType.NEUTRON_EMISSION:
          return model.neutronEmissionEnabledProperty;
        case DecayType.PROTON_EMISSION:
          return model.protonEmissionEnabledProperty;
        case DecayType.BETA_PLUS_DECAY:
          return model.betaPlusDecayEnabledProperty;
        case DecayType.BETA_MINUS_DECAY:
          return model.betaMinusDecayEnabledProperty;
        case DecayType.ALPHA_DECAY:
          return model.alphaDecayEnabledProperty;
        default:
          assert && assert( false, 'No valid decay type found: ' + decayType );
          return model.protonEmissionEnabledProperty;
      }
    };

    // function that creates the listeners for the decay buttons. Emits the specified particle depending on the decay type
    const createDecayButtonListener = ( decayType: DecayType ) => {
      options.storeNucleonCounts();
      options.decayAtom( decayType );
      options.showAndRepositionUndoDecayButton( decayType.name.toString() );
    };

    // function to create the decay buttons
    // manually layout the button text due to the superscripts causing the normal layout to look out of place
    const createDecayButton = ( decayType: DecayType ): Node => {
      const buttonBackgroundRectangle = new Rectangle( 0, 0, BUTTON_CONTENT_WIDTH, BUTTON_HEIGHT );
      const buttonText = new RichText( decayType.labelStringProperty, { font: LABEL_FONT, maxWidth: BUTTON_CONTENT_WIDTH } );

      buttonText.boundsProperty.link( () => {
        assert && assert( BUTTON_TEXT_BOTTOM_MARGIN + buttonText.height < BUTTON_HEIGHT, 'The button text is changing the size of the button.' );
        buttonText.centerBottom = buttonBackgroundRectangle.centerBottom.minusXY( 0, BUTTON_TEXT_BOTTOM_MARGIN );
      } );
      buttonBackgroundRectangle.addChild( buttonText );

      return new RectangularPushButton( {
        content: buttonBackgroundRectangle,
        yMargin: 0,
        baseColor: BANColors.decayButtonColorProperty,
        enabledProperty: returnEnabledDecayButtonProperty( decayType ),
        listener: () => { createDecayButtonListener( decayType ); }
      } );
    };

    // function to create the decay button and corresponding decay icon pair
    const createDecayButtonAndIcon = ( decayType: DecayType ): Node => {
      return new HBox( {
        children: [
          createDecayButton( decayType ),
          IconFactory.createDecayIcon( decayType )!
        ],
        spacing: SPACING * 1.5,
        align: 'center'
      } );
    };

    // see this.decayTypeButtonIndexMap for detail
    const decayTypeButtonIndexMap: decayTypeButtonIndexType = {};

    // create the decay button and icon pair in a VBox
    const decayButtonsAndIcons: Node[] = [];
    DecayType.enumeration.values.forEach( decayType => {
      decayTypeButtonIndexMap[ decayType.name.toString() ] = decayButtonsAndIcons.push( createDecayButtonAndIcon( decayType ) ) - 1;
    } );
    const arrangedDecayButtonsAndIcons = new VBox( {
      children: decayButtonsAndIcons,
      spacing: SPACING,
      align: 'left'
    } );

    // add the decay buttons and icons
    arrangedDecayButtonsAndIcons.top = titleNode.bottom + SPACING;

    // create and add the separator
    const separator = new HSeparator( { stroke: '#CACACA' } );

    separator.top = arrangedDecayButtonsAndIcons.bottom + SPACING;

    // create and add the particle labels
    // a particle label is a particle node on the left with its corresponding particle name on the right
    const createParticleLabel = ( particleType: ParticleType ): Node => {
      return new HBox( {
        children: [
          new ParticleNode( particleType.particleTypeString, particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ? NUCLEON_PARTICLE_RADIUS : ELECTRON_PARTICLE_RADIUS ),
          new Text( particleType.labelStringProperty, { font: LABEL_FONT, maxWidth: 110 } )
        ],
        spacing: SPACING
      } );
    };
    const particleLabels = ParticleType.enumeration.values.map( particleType => createParticleLabel( particleType ) );
    const createParticleLabelsVBox = ( particleLabels: Node[] ) => {
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
      spacing: SPACING,
      minContentWidth: 100
    } );
    particleLabelsLegend.top = separator.bottom + SPACING;

    const contentNode = new VBox( {
      children: [
        new HBox( { children: [ titleNode, decaysInfoButton ], spacing: 15 } ),
        arrangedDecayButtonsAndIcons,
        separator,
        particleLabelsLegend
      ],
      spacing: SPACING
    } );

    super( contentNode, {
      xMargin: 15,
      yMargin: 15,
      fill: BANColors.availableDecaysPanelBackgroundColorProperty,
      stroke: BANColors.panelStrokeColorProperty,
      minWidth: 322,
      cornerRadius: BANConstants.PANEL_CORNER_RADIUS
    } );

    // used when positioning the undo decay buttons
    this.arrangedDecayButtonsAndIcons = arrangedDecayButtonsAndIcons;
    this.decayTypeButtonIndexMap = decayTypeButtonIndexMap;
  }
}

buildANucleus.register( 'AvailableDecaysPanel', AvailableDecaysPanel );
export default AvailableDecaysPanel;
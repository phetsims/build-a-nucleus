// Copyright 2022-2024, University of Colorado Boulder

/**
 * A node that represents the available decays a given nuclide can undergo.
 *
 * @author Luisa Vargas
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, HSeparator, Node, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Dialog, { DialogOptions } from '../../../../sun/js/Dialog.js';
import Panel from '../../../../sun/js/Panel.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';
import DecayType from '../../common/model/DecayType.js';
import ParticleType from '../../common/model/ParticleType.js';
import IconFactory from '../../common/view/IconFactory.js';

// constants
const LABEL_FONT = new PhetFont( BANConstants.BUTTONS_AND_LEGEND_FONT_SIZE );
const TITLE_FONT = new PhetFont( 24 );
const SPACING = 10;
const BUTTON_TEXT_BOTTOM_MARGIN = 8;
const BUTTON_HEIGHT = 35;
const BUTTON_CONTENT_WIDTH = 145;

// types
type decayTypeButtonIndexType = Record<string, number>;
type SelfOptions = {
  decayEnabledPropertyMap: Map<DecayType, TReadOnlyProperty<boolean>>;

  // Upon any decay button firing, this listener fires with the given decay type.
  handleDecayListener: ( decayType: DecayType ) => void;
};
export type AvailableDecaysPanelOptions = SelfOptions;

class AvailableDecaysPanel extends Panel {

  // Decay button and icon pair.
  public readonly arrangedDecayButtonsAndIcons: Node;

  // Map of decayType => {arrayIndex}.
  public decayTypeButtonIndexMap: decayTypeButtonIndexType;

  public constructor( options: AvailableDecaysPanelOptions ) {

    // Create and add the title.
    const titleNode = new Text( BuildANucleusStrings.availableDecaysStringProperty, {
      font: TITLE_FONT, maxWidth: 250
    } );

    // Create and add the decays info dialog and button.
    const decaysInfoDialog = new Dialog(
      new RichText( BuildANucleusStrings.availableDecaysInfoPanelTextStringProperty, BANConstants.INFO_DIALOG_TEXT_OPTIONS ),
      combineOptions<DialogOptions>( {
        bottomMargin: 40
      }, BANConstants.INFO_DIALOG_OPTIONS )
    );
    const decaysInfoButton = new InfoButton( {
      listener: () => decaysInfoDialog.show(),
      maxHeight: BANConstants.INFO_BUTTON_MAX_HEIGHT,
      baseColor: BANColors.availableDecaysInfoButtonColorProperty
    } );

    // Function to create the decay button and corresponding decay icon pair.
    const createDecayButtonAndIcon = ( decayType: DecayType ): Node => {

      const buttonBackgroundRectangle = new Rectangle( 0, 0, BUTTON_CONTENT_WIDTH, BUTTON_HEIGHT );
      const buttonText = new RichText( decayType.labelStringProperty, {
        font: LABEL_FONT,
        maxWidth: BUTTON_CONTENT_WIDTH
      } );
      buttonText.boundsProperty.link( () => {
        assert && assert( BUTTON_TEXT_BOTTOM_MARGIN + buttonText.height < BUTTON_HEIGHT,
          'The button text is changing the size of the button.' );

        // Manually layout the button text due to the superscripts causing the normal layout to look out of place.
        buttonText.centerBottom = buttonBackgroundRectangle.centerBottom.minusXY( 0, BUTTON_TEXT_BOTTOM_MARGIN );
      } );

      const enabledProperty = options.decayEnabledPropertyMap.get( decayType )!;
      assert && assert( enabledProperty, 'No enabledProperty found, is your decay type valid? ' + decayType );
      const decayButton = new RectangularPushButton( {

        // Add buttonText and buttonBackgroundRectangle in the same layer, so they have the same coordinate frame when
        // the bounds change.
        content: new Node( { children: [ buttonText, buttonBackgroundRectangle ] } ),
        yMargin: 0,
        baseColor: BANColors.decayButtonColorProperty,
        enabledProperty: enabledProperty,
        listener: () => options.handleDecayListener( decayType )
      } );

      return new HBox( {
        children: [
          decayButton,

          // createDecayButtonAndIcon is called when looping through the DecayType enumeration values so null won't be returned.
          IconFactory.createDecayIcon( decayType )!
        ],
        spacing: SPACING * 1.5, // Empirically determined.
        align: 'center'
      } );
    };

    // See this.decayTypeButtonIndexMap for detail.
    const decayTypeButtonIndexMap: decayTypeButtonIndexType = {};

    // Create the decay button and icon pair in a VBox.
    const decayButtonsAndIcons: Node[] = [];
    DecayType.enumeration.values.forEach( decayType => {
      decayTypeButtonIndexMap[ decayType.name.toString() ] = decayButtonsAndIcons.push( createDecayButtonAndIcon( decayType ) ) - 1;
    } );
    const arrangedDecayButtonsAndIcons = new VBox( {
      children: decayButtonsAndIcons,
      spacing: SPACING,
      align: 'left'
    } );
    arrangedDecayButtonsAndIcons.top = titleNode.bottom + SPACING;

    // Create the separator.
    const separator = new HSeparator( { stroke: '#CACACA' } );
    separator.top = arrangedDecayButtonsAndIcons.bottom + SPACING;

    // Create and add the particle labels.
    // A particle label is a particle node on the left with its corresponding particle name on the right.
    const particleLabels = ParticleType.enumeration.values.map( particleType => {
      return new HBox( {
        children: [
          IconFactory.createParticleNode( particleType ),
          new Text( particleType.labelStringProperty, { font: LABEL_FONT, maxWidth: 110 } )
        ],
        spacing: SPACING
      } );
    } );

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

    // Used when positioning the undo decay buttons.
    this.arrangedDecayButtonsAndIcons = arrangedDecayButtonsAndIcons;
    this.decayTypeButtonIndexMap = decayTypeButtonIndexMap;
  }
}

buildANucleus.register( 'AvailableDecaysPanel', AvailableDecaysPanel );
export default AvailableDecaysPanel;
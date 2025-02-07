// Copyright 2023-2024, University of Colorado Boulder

/**
 * Node that contains the information Dialog on the full chart and a link to the full chart.
 * @author Luisa Vargas
 */

import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText, { RichTextOptions } from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import allowLinksProperty from '../../../../scenery/js/util/allowLinksProperty.js';
import Color from '../../../../scenery/js/util/Color.js';
import TextPushButton, { TextPushButtonOptions } from '../../../../sun/js/buttons/TextPushButton.js';
import Dialog, { DialogOptions } from '../../../../sun/js/Dialog.js';
import fullNuclideChart_png from '../../../images/fullNuclideChart_png.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';

assert && assert( typeof BANConstants.INFO_DIALOG_TEXT_OPTIONS.maxWidth === 'number', 'maxWidth needed for text' );

const LINK_TEXT = 'https://energyeducation.ca/simulations/nuclear/nuclidechart.html';

type FullChartTextButtonOptions = TextPushButtonOptions;

class FullChartTextButton extends TextPushButton {
  public constructor( providedOptions?: FullChartTextButtonOptions ) {

    // If links are allowed, use hyperlinks. Otherwise, just output the URL. This doesn't need to be internationalized.
    // Create the chart information text.
    const stringProperty = new DerivedStringProperty( [
      allowLinksProperty,
      BuildANucleusStrings.fullChartInfoPanelTextPatternStringProperty,
      BuildANucleusStrings.fullChartLowercaseStringProperty
    ], ( allowLinks, fullChartInfoText, fullChartLowercaseText ) => {
      return allowLinks ?
             StringUtils.fillIn( fullChartInfoText, { link: `<a href="{{url}}">${fullChartLowercaseText}</a>` } ) :
             StringUtils.fillIn( fullChartInfoText, { link: LINK_TEXT } );
    } );
    const fullChartInfoText = new RichText( stringProperty, combineOptions<RichTextOptions>( {
      links: { url: LINK_TEXT } // RichText must fill in URL for link.
    }, BANConstants.INFO_DIALOG_TEXT_OPTIONS ) );

    // Create the chart image.
    const fullChartImage = new Image( fullNuclideChart_png );
    fullChartImage.setMaxWidth( 481.5 ); // determined empirically
    const fullChartImageBorderRectangle = Rectangle.bounds( fullChartImage.bounds.dilated( 5 ),
      { stroke: Color.BLACK } );

    // Create and add the fullChartDialog and 'Full Chart' button.
    const dialogContent = new VBox( {
      children: [
        fullChartInfoText,
        new Node( { children: [ fullChartImage, fullChartImageBorderRectangle ] } )
      ],
      spacing: 10
    } );
    const fullChartDialog = new Dialog( dialogContent, combineOptions<DialogOptions>( {
      title: new Text( BuildANucleusStrings.fullNuclideChartStringProperty, {
        font: BANConstants.TITLE_FONT,
        maxWidth: BANConstants.INFO_DIALOG_TEXT_OPTIONS.maxWidth
      } ),
      maxWidthMargin: 800,
      bottomMargin: 60
    }, BANConstants.INFO_DIALOG_OPTIONS ) );

    const options =
      optionize<FullChartTextButtonOptions, EmptySelfOptions, TextPushButtonOptions>()( {
        baseColor: BANColors.fullChartButtonColorProperty,
        stroke: 'black',
        lineWidth: 1,
        minWidth: 80,
        maxWidth: 160,
        listener: () => fullChartDialog.show(),
        textNodeOptions: {
          font: BANConstants.LEGEND_FONT
        }
      }, providedOptions );

    // Create and add the full chart info dialog and button.
    super( BuildANucleusStrings.fullChartCapitalizedStringProperty, options );
  }
}

buildANucleus.register( 'FullChartTextButton', FullChartTextButton );
export default FullChartTextButton;
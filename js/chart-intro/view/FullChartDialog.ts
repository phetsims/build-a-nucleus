// Copyright 2023, University of Colorado Boulder

/**
 * Node that contains the information Dialog on the full chart and a link to the full chart.
 * @author Luisa Vargas
 */

import Dialog, { DialogOptions } from '../../../../sun/js/Dialog.js';
import buildANucleus from '../../buildANucleus.js';
import { allowLinksProperty, Color, Image, Node, Rectangle, RichText, RichTextOptions, Text, VBox } from '../../../../scenery/js/imports.js';
import fullNuclideChart_png from '../../../images/fullNuclideChart_png.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import BANConstants from '../../common/BANConstants.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';

assert && assert( typeof BANConstants.INFO_DIALOG_TEXT_OPTIONS.maxWidth === 'number', 'maxWidth needed for text' );

class FullChartDialog extends Dialog {

  public constructor() {

    // If links are allowed, use hyperlinks. Otherwise, just output the URL. This doesn't need to be internationalized.
    const linkText = 'https://energyeducation.ca/simulations/nuclear/nuclidechart.html';
    const stringProperty = new DerivedStringProperty( [
      allowLinksProperty,
      BuildANucleusStrings.fullChartInfoPanelTextPatternStringProperty,
      BuildANucleusStrings.fullChartLowercaseStringProperty
    ], ( allowLinks, fullChartInfoText, fullChartLowercaseText ) => {
      return allowLinks ?
             StringUtils.fillIn( fullChartInfoText, { link: `<a href="{{url}}">${fullChartLowercaseText}</a>` } ) :
             StringUtils.fillIn( fullChartInfoText, { link: linkText } );
    } );

    const fullChartImage = new Image( fullNuclideChart_png );
    const fullChartInfoText = new RichText( stringProperty, combineOptions<RichTextOptions>( {
      links: { url: linkText } // RichText must fill in URL for link
    }, BANConstants.INFO_DIALOG_TEXT_OPTIONS ) );
    fullChartImage.setMaxWidth( 481.5 ); // determined empirically so image is a bit smaller than text length
    const fullChartImageBorderRectangle = Rectangle.bounds( fullChartImage.bounds.dilated( 5 ), { stroke: Color.BLACK } );

    // create and add the full chart info dialog and button
    super( new VBox( {
        children: [
          fullChartInfoText,
          new Node( { children: [ fullChartImage, fullChartImageBorderRectangle ] } )
        ],
        spacing: 10
      } ),
      combineOptions<DialogOptions>( {
        title: new Text( BuildANucleusStrings.fullNuclideChartStringProperty, {
          font: BANConstants.TITLE_FONT,
          maxWidth: BANConstants.INFO_DIALOG_TEXT_OPTIONS.maxWidth
        } )
      }, combineOptions<DialogOptions>( {
        maxWidthMargin: 800,
        bottomMargin: 60
      }, BANConstants.INFO_DIALOG_OPTIONS ) )
    );
  }
}

buildANucleus.register( 'FullChartDialog', FullChartDialog );
export default FullChartDialog;
// Copyright 2022, University of Colorado Boulder

/**
 * HalfLifeInfoDialog shows an expanded timeline of the half-life's of the nuclide's built with meaningful points in
 * time pointed out with arrows to give more orientation on the half-life time.
 *
 * @author Luisa Vargas
 */

import Dialog from '../../../../sun/js/Dialog.js';
import buildANucleus from '../../buildANucleus.js';
import { RichText, Text, HBox, VBox } from '../../../../scenery/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';
import HalfLifeNumberLineNode from './HalfLifeNumberLineNode.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';

// constants
const MAX_CONTENT_WIDTH = 600;

class HalfLifeInfoDialog extends Dialog {

  constructor( halfLifeNumberProperty: NumberProperty ) {

    const leftSideStrings = [
      buildANucleusStrings.timeForLightToCrossANucleus,
      buildANucleusStrings.timeForLightToCrossAnAtom,
      buildANucleusStrings.chemicalReactionDuration,
      buildANucleusStrings.timeForSoundToTravelOneMillimeter,
      buildANucleusStrings.aBlinkOfAnEye
    ];
    const rightSideStrings = [
      buildANucleusStrings.oneMinute,
      buildANucleusStrings.oneYear,
      buildANucleusStrings.averageHumanLifespan,
      buildANucleusStrings.ageOfTheUniverse,
      buildANucleusStrings.lifetimeOfLongestLivedStars
    ];

    // join the strings in each array, placing one on each line
    const createTextFromStrings = ( strings: string[] ): RichText => {
      return new RichText( strings.join( '<br>' ), {
        font: new PhetFont( 20 ),
        leading: 6
      } );
    };
    const legend = new HBox( {
      children: [
        createTextFromStrings( leftSideStrings ),
        createTextFromStrings( rightSideStrings )
      ],
      spacing: 100,
      align: 'left'
    } );

    // create and add the halfLifeNumberLineNode
    const halfLifeNumberLineNode = new HalfLifeNumberLineNode( halfLifeNumberProperty, -24, 24, MAX_CONTENT_WIDTH, 70, true );

    // the half-life's of the strings, in respective order
    const halfLifeTime = [ Math.pow( 10, -23 ), Math.pow( 10, -19 ), 2.5e-15, 2e-6, 1 / 3, 60, 3.154e7, 2.2911e9, 4.3425072e17, 5e18 ];
    for ( let i = 0; i < halfLifeTime.length; i++ ) {
      halfLifeNumberLineNode.addArrowAndNumber( i + 1, halfLifeTime[ i ] );
    }
    const contents = new VBox( {
      children: [ legend, halfLifeNumberLineNode ],
      spacing: 30,
      align: 'center'
    } );

    const titleNode = new Text( buildANucleusStrings.expandedTimescale, {
      font: new PhetFont( 32 ),
      maxWidth: 0.75 * MAX_CONTENT_WIDTH
    } );

    super( contents, {
      title: titleNode,
      ySpacing: 20,
      bottomMargin: 20,
      fill: BANColors.infoDialogBackgroundColorProperty
    } );
  }
}

buildANucleus.register( 'HalfLifeInfoDialog', HalfLifeInfoDialog );
export default HalfLifeInfoDialog;
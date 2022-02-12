// Copyright 2022, University of Colorado Boulder

/**
 * HalfLifeInfoDialog shows an expanded timeline of the half-life's of the nuclide's built with meaningful points in
 * time pointed out with arrows to give more orientation on the half-life time.
 *
 * @author Luisa Vargas
 */

import Dialog from '../../../../sun/js/Dialog.js';
import buildANucleus from '../../buildANucleus.js';
import { RichText, Text, HBox } from '../../../../scenery/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import BuildANucleusColors from '../../common/BuildANucleusColors.js';

// constants
const MAX_CONTENT_WIDTH = 600;

class HalfLifeInfoDialog extends Dialog {

  constructor() {

    const leftSideStrings = [
      buildANucleusStrings.timeForLightToCrossANucleus,
      buildANucleusStrings.timeForLightToCrossAnAtom,
      buildANucleusStrings.chemicalReactionDuration,
      buildANucleusStrings.timeForSoundToTravel1mm,
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

    const titleNode = new Text( buildANucleusStrings.expandedTimescale, {
      font: new PhetFont( 32 ),
      maxWidth: 0.75 * MAX_CONTENT_WIDTH
    } );

    super( legend, {
      title: titleNode,
      ySpacing: 20,
      bottomMargin: 20,
      fill: BuildANucleusColors.infoDialogBackgroundColorProperty
    } );
  }
}

buildANucleus.register( 'HalfLifeInfoDialog', HalfLifeInfoDialog );
export default HalfLifeInfoDialog;
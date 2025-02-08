// Copyright 2023-2025, University of Colorado Boulder

/**
 * Text for the "Nuclear Shell Model" plus a background
 * @author Luisa Vargas
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';

export default class NuclearShellModelText extends Node {
  public constructor() {

    // Create and add the 'Nuclear Shell Model' title and background.
    const text = new RichText( BuildANucleusStrings.nuclearShellModelStringProperty, {
      font: BANConstants.REGULAR_FONT,
      maxWidth: 220
    } );
    const textBackground = new BackgroundNode( text, {
      xMargin: 15,
      yMargin: 5,
      rectangleOptions: {
        fill: BANColors.shellModelTextHighlightColorProperty,
        cornerRadius: 10
      }
    } );

    super( {
      children: [ textBackground ]
    } );
  }
}

buildANucleus.register( 'NuclearShellModelText', NuclearShellModelText );
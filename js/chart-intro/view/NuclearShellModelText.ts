// Copyright 2022-2023, University of Colorado Boulder

/**
 * Text for the "Nuclear Shell Model" plus a background
 * @author Luisa Vargas
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Node, RichText } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';

export default class NuclearShellModelText extends Node {
  public constructor() {

    // create and add the 'Nuclear Shell Model' title and background
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

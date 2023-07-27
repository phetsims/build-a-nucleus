// Copyright 2023, University of Colorado Boulder

/**
 * Node that represents the view of a decay equation.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import buildANucleus from '../../buildANucleus.js';
import DecayEquationModel from '../model/DecayEquationModel.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import DecaySymbolNode from './DecaySymbolNode.js';
import IconFactory from '../../decay/view/IconFactory.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';

// Fill in the space eagerly, as a constant
const unknownSpacePatternStringProperty = new PatternStringProperty( BuildANucleusStrings.unknownSpacePatternStringProperty, {
  space: ' '
} );

const EQUATION_HBOX_MIN_CONTENT_HEIGHT = 30;
const TEXT_OPTIONS = {
  fontSize: 20,
  maxWidth: 100
};

class DecayEquationNode extends VBox {
  public constructor( decayEquationModel: DecayEquationModel, stableTextCenterXPosition: number ) {

    super( {
      spacing: 5,
      align: 'left',

      // leave equationHBox space visible despite being blank sometimes
      excludeInvisibleChildrenFromBounds: false
    } );

    const stableText = new Text( BuildANucleusStrings.stableStringProperty, TEXT_OPTIONS );
    const mostLikelyDecayText = new Text( BuildANucleusStrings.mostLikelyDecayStringProperty, { font: BANConstants.LEGEND_FONT } );
    const mostLikelyDecayHBox = new HBox( { spacing: 5, layoutOptions: { align: 'left' } } );
    const equationHBox = new HBox( {
      spacing: 10,
      minContentHeight: EQUATION_HBOX_MIN_CONTENT_HEIGHT
    } );
    assert && assert( stableText.height < EQUATION_HBOX_MIN_CONTENT_HEIGHT, `Min content height must be a max so the space is consistent across all equation forms. Stable string height is ${stableText.height}` );

    decayEquationModel.currentCellModelProperty.link( currentCellModel => {
      equationHBox.visible = true;
      if ( currentCellModel ) {
        const decayLikelihoodPercentText = new Text( new PatternStringProperty( BuildANucleusStrings.percentageInParenthesesPatternStringProperty, {
          decayLikelihoodPercent: new DerivedStringProperty( [
            unknownSpacePatternStringProperty
          ], unknownText => `${currentCellModel.decayTypeLikelihoodPercent}` || unknownText )
        } ), {
          font: BANConstants.LEGEND_FONT
        } );

        const currentNuclideSymbol = new DecaySymbolNode( currentCellModel.protonCount, currentCellModel.protonCount + currentCellModel.neutronCount );
        assert && assert( currentNuclideSymbol.height < EQUATION_HBOX_MIN_CONTENT_HEIGHT,
          `Min content height must be a max so the space is consistent across all equation forms. Current nuclide symbol height is ${currentNuclideSymbol.height}` );

        // Choose a length of the arrow that works well for the equation look, and matches the look of the chart arrow
        const decayEquationArrow = new ArrowNode( 0, 0, 25, 0, BANConstants.DECAY_ARROW_OPTIONS );

        const newNuclideSymbol = new DecaySymbolNode( decayEquationModel.finalProtonCountProperty.value, decayEquationModel.finalMassNumberProperty.value );

        const plusNode = IconFactory.createPlusNode( BANColors.decayEquationArrowAndPlusNodeColorProperty );

        if ( currentCellModel.decayType ) {

          const decaySymbol = new DecaySymbolNode(
            currentCellModel.decayType.protonCount,
            currentCellModel.decayType.massNumber, {
              symbolString: currentCellModel.decayType.decaySymbol
            } );
          equationHBox.setChildren( [ currentNuclideSymbol, decayEquationArrow, newNuclideSymbol, plusNode, decaySymbol ] );
        }
        else if ( currentCellModel.isStable ) {
          equationHBox.setChildren( [ stableText ] );
          decayLikelihoodPercentText.visible = false;

          // re-center the stable text at the horizontal center based on the parameter dimension. Do this whenever the
          // text changes length due to a language change.
          stableText.boundsProperty.link( () => {
            stableText.setLayoutOptions( { leftMargin: stableTextCenterXPosition - stableText.width / 2 } );
          } );
        }
        else {
          const unknownText = new Text( BuildANucleusStrings.unknownStringProperty, TEXT_OPTIONS );
          equationHBox.setChildren( [ currentNuclideSymbol, decayEquationArrow, unknownText ] );
          decayLikelihoodPercentText.visible = false;
        }

        mostLikelyDecayHBox.setChildren( [ mostLikelyDecayText, decayLikelihoodPercentText ] );
      }
      else {

        equationHBox.setChildren( [ stableText ] );
        equationHBox.visible = false;
        mostLikelyDecayHBox.setChildren( [ mostLikelyDecayText ] );
      }
      this.children = [
        mostLikelyDecayHBox,
        equationHBox
      ];
    } );
  }
}

buildANucleus.register( 'DecayEquationNode', DecayEquationNode );
export default DecayEquationNode;
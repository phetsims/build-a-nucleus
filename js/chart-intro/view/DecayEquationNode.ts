// Copyright 2023-2024, University of Colorado Boulder

/**
 * Node that represents the view of a decay equation. It is a VBox with the 'Most likely decay' portion at the top and
 * the decay equation at the bottom. It is made of various Text and icon node components that are visible/invisible and
 * added/removed, appropriately.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';
import IconFactory from '../../common/view/IconFactory.js';
import DecayEquationModel from '../model/DecayEquationModel.js';
import DecaySymbolNode from './DecaySymbolNode.js';

// Fill in the space eagerly, as a constant.
const unknownSpacePatternStringProperty = new PatternStringProperty(
  BuildANucleusStrings.unknownSpacePatternStringProperty, { space: ' ' } );

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

      // Leave equationHBox space visible despite being blank sometimes.
      excludeInvisibleChildrenFromBounds: false
    } );

    const stableText = new Text( BuildANucleusStrings.stableStringProperty, TEXT_OPTIONS );

    // Re-center the stable text at the horizontal center based on the parameter dimension. Do this whenever the
    // text changes length due to a language change.
    stableText.boundsProperty.link( () => {
      stableText.setLayoutOptions( { leftMargin: stableTextCenterXPosition - stableText.width / 2 } );
    } );

    const mostLikelyDecayTypeText = new Text( BuildANucleusStrings.mostLikelyDecayTypeStringProperty, {
      font: BANConstants.LEGEND_FONT,
      maxWidth: 150
    } );

    // Create the two text container nodes.
    const mostLikelyDecayTypeHBox = new HBox( { spacing: 5, layoutOptions: { align: 'left' } } );
    const equationHBox = new HBox( {
      spacing: 10,
      minContentHeight: EQUATION_HBOX_MIN_CONTENT_HEIGHT
    } );
    assert && assert( stableText.height < EQUATION_HBOX_MIN_CONTENT_HEIGHT,
      `Min content height must be a max so the space is consistent across all equation forms.
      Stable string height is ${stableText.height}` );

    const decayLikelihoodPercentText = new Text( new PatternStringProperty(
      BuildANucleusStrings.percentageInParenthesesPatternStringProperty, {
        decayLikelihoodPercent: new DerivedStringProperty( [
          unknownSpacePatternStringProperty,
          decayEquationModel.currentCellModelProperty
        ], ( unknownText, currentCellModel ) => currentCellModel ?
                                                ( currentCellModel.decayTypeLikelihoodPercent === null ?
                                                  unknownText :
                                                  `${currentCellModel.decayTypeLikelihoodPercent}` ) :
                                                '' ) // Shouldn't show in this case anyway
      } ), {
      maxWidth: 100,
      font: BANConstants.LEGEND_FONT
    } );

    decayEquationModel.currentCellModelProperty.link( currentCellModel => {
      equationHBox.visible = true;
      decayLikelihoodPercentText.visible = true;

      if ( currentCellModel ) {
        // There exists a cell model, you are a nuclide that exists, so create all the necessary Text and node components.

        const currentNuclideSymbol = new DecaySymbolNode( currentCellModel.protonNumber,
          currentCellModel.protonNumber + currentCellModel.neutronNumber );
        assert && assert( currentNuclideSymbol.height < EQUATION_HBOX_MIN_CONTENT_HEIGHT,
          `Min content height must be a max so the space is consistent across all equation forms.
          Current nuclide symbol height is ${currentNuclideSymbol.height}` );

        // Choose a length of the arrow that works well for the equation look, and matches the look of the chart arrow.
        const decayEquationArrow = new ArrowNode( 0, 0, 25, 0, BANConstants.DECAY_ARROW_OPTIONS );

        const newNuclideSymbol = new DecaySymbolNode( decayEquationModel.finalProtonNumberProperty.value,
          decayEquationModel.finalMassNumberProperty.value );

        const plusNode = IconFactory.createPlusNode( BANColors.decayEquationArrowAndPlusNodeColorProperty );

        if ( currentCellModel.decayType ) {
          // You are unstable and your decay is known so create a decay symbol and set the components for the decay equation.

          const decaySymbol = new DecaySymbolNode(
            currentCellModel.decayType.protonNumber,
            currentCellModel.decayType.massNumber, {
              symbolString: currentCellModel.decayType.decaySymbol
            } );
          equationHBox.setChildren( [ currentNuclideSymbol, decayEquationArrow, newNuclideSymbol, plusNode, decaySymbol ] );
        }
        else if ( currentCellModel.isStable ) {
          // If you are stable, there is no decay type so hide the decayLikelihoodPercentText and show 'Stable'.

          equationHBox.setChildren( [ stableText ] );
          decayLikelihoodPercentText.visible = false;
        }
        else {
          // Nuclide cell unstable but with no known decay type so hide the decayLikelihoodPercentText, and show the
          // nuclide decays into an 'Unknown'.

          const unknownText = new Text( BuildANucleusStrings.unknownStringProperty, TEXT_OPTIONS );
          equationHBox.setChildren( [ currentNuclideSymbol, decayEquationArrow, unknownText ] );
          decayLikelihoodPercentText.visible = false;
        }

        mostLikelyDecayTypeHBox.setChildren( [ mostLikelyDecayTypeText, decayLikelihoodPercentText ] );
      }
      else {
        // If there does not exist a cell model, then a nuclide that does not exist formed, hide the equation but set
        // the stableText as a child so equationHBox has the right height.

        equationHBox.setChildren( [ stableText ] );
        equationHBox.visible = false;
        mostLikelyDecayTypeHBox.setChildren( [ mostLikelyDecayTypeText ] );
      }

      // Add the two container nodes.
      this.children = [
        mostLikelyDecayTypeHBox,
        equationHBox
      ];
    } );
  }
}

buildANucleus.register( 'DecayEquationNode', DecayEquationNode );
export default DecayEquationNode;
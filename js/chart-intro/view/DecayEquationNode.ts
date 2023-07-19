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
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import DecaySymbolNode from './DecaySymbolNode.js';
import IconFactory from '../../decay/view/IconFactory.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';

const unknownSpacePatternStringProperty = new PatternStringProperty( BuildANucleusStrings.unknownSpacePatternStringProperty, { space: ' ' } );

const EQUATION_HBOX_MIN_CONTENT_HEIGHT = 30;
const TEXT_OPTIONS = {
  fontSize: 20
};

class DecayEquationNode extends VBox {

  public constructor( decayEquationModel: DecayEquationModel ) {

    super( {
      spacing: 5,
      align: 'left',

      // leave equationHBox space visible despite being blank sometimes
      excludeInvisibleChildrenFromBounds: false
    } );

    const stableString = new Text( BuildANucleusStrings.stable, TEXT_OPTIONS );
    const decayArrow = new ArrowNode( 0, 0, 20, 0, { fill: null } );
    const mostLikelyDecayString = new Text( BuildANucleusStrings.mostLikelyDecay, { font: BANConstants.LEGEND_FONT } );
    const mostLikelyDecayHBox = new HBox( { spacing: 5, layoutOptions: { align: 'left' } } );
    const equationHBox = new HBox( {
      spacing: 10,
      minContentHeight: EQUATION_HBOX_MIN_CONTENT_HEIGHT
    } );
    assert && assert( stableString.height < EQUATION_HBOX_MIN_CONTENT_HEIGHT, `Min content height must be a max so the space is consistent across all equation forms. Stable string height is ${stableString.height}` );

    decayEquationModel.currentCellModelProperty.link( currentCellModel => {
      equationHBox.visible = true;
      if ( currentCellModel ) {
        const decayLikelihoodPercentString = new Text( StringUtils.fillIn( BuildANucleusStrings.percentageInParenthesesPattern, {
          decayLikelihoodPercent: currentCellModel.decayTypeLikelihoodPercent || unknownSpacePatternStringProperty
        } ), {
          font: BANConstants.LEGEND_FONT
        } );

        const currentNuclideSymbol = new DecaySymbolNode( currentCellModel.protonCount, currentCellModel.protonCount + currentCellModel.neutronCount );
        assert && assert( currentNuclideSymbol.height < EQUATION_HBOX_MIN_CONTENT_HEIGHT,
          `Min content height must be a max so the space is consistent across all equation forms. Current nuclide symbol height is ${currentNuclideSymbol.height}` );

        const decayEquationArrow = IconFactory.createDecayArrowNode();

        const newNuclideSymbol = new DecaySymbolNode( decayEquationModel.finalProtonCountProperty.value, decayEquationModel.finalMassNumberProperty.value );

        const plusNode = IconFactory.createPlusNode( BANColors.decayEquationPlusNodeColorProperty );

        if ( currentCellModel.decayType ) {

          const decaySymbol = new DecaySymbolNode(
            currentCellModel.decayType.protonCount,
            currentCellModel.decayType.massNumber, {
              symbolString: currentCellModel.decayType.decaySymbol
            } );
          equationHBox.setChildren( [ currentNuclideSymbol, decayEquationArrow, newNuclideSymbol, plusNode, decaySymbol ] );
        }
        else if ( currentCellModel.isStable ) {
          equationHBox.setChildren( [ stableString ] );
          decayLikelihoodPercentString.visible = false;
        }
        else {
          const unknownString = new Text( BuildANucleusStrings.unknown, TEXT_OPTIONS );
          equationHBox.setChildren( [ currentNuclideSymbol, decayEquationArrow, unknownString ] );
          decayLikelihoodPercentString.visible = false;
        }

        mostLikelyDecayHBox.setChildren( [ decayArrow, mostLikelyDecayString, decayLikelihoodPercentString ] );
      }
      else {

        equationHBox.setChildren( [ stableString ] );
        equationHBox.visible = false;
        mostLikelyDecayHBox.setChildren( [ decayArrow, mostLikelyDecayString ] );
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
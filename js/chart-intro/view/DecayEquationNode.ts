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
import { HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import DecaySymbolNode from './DecaySymbolNode.js';
import IconFactory from '../../decay/view/IconFactory.js';

class DecayEquationNode extends VBox {

  public constructor( decayEquationModel: DecayEquationModel ) {

    super( {
      spacing: 5
    } );

    decayEquationModel.currentCellModelProperty.link( currentCellModel => {

      console.log( currentCellModel );

      console.log( decayEquationModel.finalMassNumberProperty.value );
      console.log( decayEquationModel.finalProtonNumberProperty.value );

      const decayArrow = new ArrowNode( 0, 0, 20, 0, { fill: null } );
      const mostLikelyDecayString = new Text( BuildANucleusStrings.mostLikelyDecay, { fontSize: 13 } );
      let decayLikelihoodPercentString: Node;
      const mostLikelyDecayHBox = new HBox( { spacing: 5 } );
      const equationHBox = new HBox( {
        spacing: 10, layoutOptions: {
          minContentHeight: 45.2
        }
      } );
      if ( currentCellModel ) {
        decayLikelihoodPercentString = new Text( StringUtils.fillIn( BuildANucleusStrings.percentageInParenthesesPattern, {
            decayLikelihoodPercent: currentCellModel.decayTypeLikelihoodPercent || BuildANucleusStrings.unknown.toLowerCase() + ' ' // TODO: i18n, https://github.com/phetsims/build-a-nucleus/issues/80
          } ),
          {
            fontSize: 13
          } );
        decayLikelihoodPercentString.visible = true;

        const currentNuclideSymbol = new DecaySymbolNode( currentCellModel.protonNumber, currentCellModel.protonNumber + currentCellModel.neutronNumber, {
          scale: 0.15
        } );

        const decayEquationArrow = IconFactory.createDecayArrowNode();

        const newNuclideSymbol = new DecaySymbolNode( decayEquationModel.finalProtonNumberProperty.value, decayEquationModel.finalMassNumberProperty.value, {
          scale: 0.15
        } );

        const plusNode = IconFactory.createPlusNode();

        let decaySymbol: Node;
        if ( currentCellModel.decayType ) {

          decaySymbol = new DecaySymbolNode(
            currentCellModel.decayType.protonNumber,
            currentCellModel.decayType.massNumber, {
              symbolString: currentCellModel.decayType.decaySymbol,
              scale: 0.15
            } );
        }
        else {
          // TODO: Handle stable case here, https://github.com/phetsims/build-a-nucleus/issues/80
          decaySymbol = new DecaySymbolNode(
            0,
            0, {
              symbolString: '!!',
              scale: 0.15
            } );
          decayLikelihoodPercentString.visible = false;
        }

        mostLikelyDecayHBox.setChildren( [ decayArrow, mostLikelyDecayString, decayLikelihoodPercentString ] );
        equationHBox.setChildren( [ currentNuclideSymbol, decayEquationArrow, newNuclideSymbol, plusNode, decaySymbol ] );
      }
      else {
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
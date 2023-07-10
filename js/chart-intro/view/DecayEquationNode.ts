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
      if ( currentCellModel ) {

        const decayArrow = new ArrowNode( 0, 0, 20, 0, { fill: null } );
        const mostLikelyDecayString = new Text( StringUtils.fillIn( BuildANucleusStrings.mostLikelyDecayPattern, {
            decayLikelihoodPercent: currentCellModel.decayTypeLikelihoodPercent || 'unknown ' // TODO: i18n, https://github.com/phetsims/build-a-nucleus/issues/80
          } ),
          {
            fontSize: 13
          } );

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
        }

        const equation = new HBox( {
          spacing: 10,
          children: [ currentNuclideSymbol, decayEquationArrow, newNuclideSymbol, plusNode, decaySymbol ]
        } );

        this.children = [
          new HBox( { spacing: 10, children: [ decayArrow, mostLikelyDecayString ] } ),
          equation
        ];
      }
    } );
  }
}

buildANucleus.register( 'DecayEquationNode', DecayEquationNode );
export default DecayEquationNode;
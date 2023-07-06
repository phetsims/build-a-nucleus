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
import SymbolNode from '../../../../shred/js/view/SymbolNode.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import DecaySymbolNode from './DecaySymbolNode.js';
import BANColors from '../../common/BANColors.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';

class DecayEquationNode extends VBox {

  public constructor( decayEquationModel: DecayEquationModel ) {

    super( {
      spacing: 5
    } );

    decayEquationModel.currentCellModelProperty.link( currentCellModel => {
      if ( currentCellModel ) {

        const decayArrow = new ArrowNode( 0, 0, 20, 0, { fill: null } );
        const mostLikelyDecayString = new Text( StringUtils.fillIn( BuildANucleusStrings.mostLikelyDecayPattern, {
            decayLikelihoodPercent: currentCellModel.decayTypeLikelihoodPercent || 'unknown' // TODO: i18n, https://github.com/phetsims/build-a-nucleus/issues/80
          } ),
          {
            fontSize: 13
          } );

        const currentNuclideSymbol = new SymbolNode( new TinyProperty( currentCellModel.protonNumber ), new TinyProperty( currentCellModel.protonNumber + currentCellModel.neutronNumber ), {
          scale: 0.15,
          boundingBoxStroke: null
        } );

        const decayEquationArrow = new ArrowNode( 0, 0, 20, 0, {
          fill: BANColors.blueDecayIconSymbolsColorProperty,
          stroke: null,
          tailWidth: 1,
          headWidth: 7.5
        } );

        const newNuclideSymbol = new SymbolNode( decayEquationModel.finalProtonNumberProperty, decayEquationModel.finalMassNumberProperty, {
          scale: 0.15,
          boundingBoxStroke: null
        } );

        const plusNode = new PlusNode( {
          fill: BANColors.blueDecayIconSymbolsColorProperty,
          size: new Dimension2( 9, 2 )
        } );

        let decaySymbol: Node;
        if ( currentCellModel.decayType ) {

          decaySymbol = new DecaySymbolNode(
            currentCellModel.decayType.decaySymbol,
            new NumberProperty( currentCellModel.decayType.protonNumber ),
            new NumberProperty( currentCellModel.decayType.massNumber ), {
              scale: 0.15,
              boundingBoxStroke: null
            } );
        }
        else {
          // TODO: Handle stable case here, https://github.com/phetsims/build-a-nucleus/issues/80
          decaySymbol = new DecaySymbolNode(
            '!!',
            new NumberProperty( 0 ),
            new NumberProperty( 0 ), {
              scale: 0.15,
              boundingBoxStroke: null
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
// Copyright 2023, University of Colorado Boulder

/**
 * Creates static icon nodes.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import buildANucleus from '../../buildANucleus.js';
import ParticleType from '../model/ParticleType.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import BANColors from '../BANColors.js';
import { HBox, Line, Node, TColor, VBox } from '../../../../scenery/js/imports.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import DecayType from '../model/DecayType.js';
import BANConstants from '../BANConstants.js';

const ALPHA_PARTICLE_SPACING = -5;
const NUCLEON_PARTICLE_RADIUS = BANConstants.PARTICLE_RADIUS * 0.7;
const ELECTRON_PARTICLE_RADIUS = NUCLEON_PARTICLE_RADIUS * 0.8;
const SPACING = 10;

class IconFactory {

  /**
   * Function to create a particle node ( a circle with a specific color ), make it bigger if the particle is a nucleon.
   */
  public static createParticleNode( particleType: ParticleType ): ParticleNode {
    return new ParticleNode( particleType.particleTypeString,
      particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ? NUCLEON_PARTICLE_RADIUS :
      ELECTRON_PARTICLE_RADIUS
    );
  }

  /**
   * Function to create the right-aligned horizontal motion lines used in the decay icons ( the top and bottom lines are
   * shorter than the middle line ).
   */
  private static createMotionLines( spacingBetweenLines: number, isShort?: boolean ): VBox {
    const motionLines: Node[] = [];
    let topAndBottomLineLength = 25;
    let middleLineLength = 40;

    if ( isShort ) {
      topAndBottomLineLength *= 0.5;
      middleLineLength *= 0.5;
    }

    for ( let i = 0; i < 3; i++ ) {
      motionLines.push( new Line( 0, 0, i % 2 === 0 ? topAndBottomLineLength : middleLineLength, 0,
        { stroke: BANColors.blueDecayIconSymbolsColorProperty } )
      );
    }

    return new VBox( {
      children: motionLines,
      spacing: spacingBetweenLines,
      align: 'right'
    } );
  }

  /**
   * Function to create the icon for a nucleon emission ( a nucleon particle node with motion lines to its left ).
   */
  private static createNucleonEmissionIcon( particleType: ParticleType ): Node {
    return new HBox( {
      children: [
        IconFactory.createMotionLines( 4 ),
        new ParticleNode( particleType.particleTypeString, NUCLEON_PARTICLE_RADIUS )
      ],
      spacing: SPACING / 4
    } );
  }

  /**
   * Function to create a right-pointing arrow.
   */
  public static createDecayArrowNode( fillColor: TColor ): Node {
    return new ArrowNode( 0, 0, 20, 0, {
      fill: fillColor,
      stroke: null,
      tailWidth: 1,
      headWidth: 7.5
    } );
  }

  /**
   * Function to create a plus '+' symbol node.
   */
  public static createPlusNode( fillColor: TColor ): Node {
    return new PlusNode( { fill: fillColor, size: new Dimension2( 9, 2 ) } );
  }

  /**
   * Function to create the icon for a beta decay ( left to right contents: a nucleon particle node, a right-pointing
   * arrow, a different nucleon particle node than the first one, a mathematical 'plus' symbol, motion lines, and an
   * electron or positron ).
   */
  private static createBetaDecayIcon( isBetaMinusDecay: boolean ): Node {
    return new HBox( {
      children: [
        isBetaMinusDecay ? IconFactory.createParticleNode( ParticleType.NEUTRON ) :
        IconFactory.createParticleNode( ParticleType.PROTON ),

        IconFactory.createDecayArrowNode( BANColors.blueDecayIconSymbolsColorProperty ),

        isBetaMinusDecay ? IconFactory.createParticleNode( ParticleType.PROTON ) :
        IconFactory.createParticleNode( ParticleType.NEUTRON ),

        IconFactory.createPlusNode( BANColors.blueDecayIconSymbolsColorProperty ),

        IconFactory.createMotionLines( 3.5, true ),

        isBetaMinusDecay ? IconFactory.createParticleNode( ParticleType.ELECTRON ) :
        IconFactory.createParticleNode( ParticleType.POSITRON )
      ],
      spacing: SPACING / 3
    } );
  }

  /**
   * Function to create half of an alpha particle ( two particle nodes beside each other, slightly overlapping ).
   */
  private static createHalfAlphaParticle( particleNodes: Node[] ): Node {
    return new HBox( {
      children: particleNodes,
      spacing: ALPHA_PARTICLE_SPACING
    } );
  }

  /**
   *  Function to create an alpha decay icon ( four slightly overlapping particle nodes, two on top and two on the bottom,
   *  with motion lines to their left ).
   */
  private static createAlphaDecayIcon(): Node {
    return new HBox( {
      children: [
        IconFactory.createMotionLines( 6 ),
        new VBox( {
          children: [
            IconFactory.createHalfAlphaParticle( [ IconFactory.createParticleNode( ParticleType.PROTON ),
              IconFactory.createParticleNode( ParticleType.NEUTRON ) ] ),
            IconFactory.createHalfAlphaParticle( [ IconFactory.createParticleNode( ParticleType.NEUTRON ),
              IconFactory.createParticleNode( ParticleType.PROTON ) ] )
          ],
          spacing: ALPHA_PARTICLE_SPACING
        } )
      ],
      spacing: SPACING / 4
    } );
  }

  /**
   * Function to create the decay icons corresponding to a specific DecayType.
   */
  public static createDecayIcon( decayType: DecayType ): Node | null {
    switch( decayType ) {
      case DecayType.ALPHA_DECAY:
        return IconFactory.createAlphaDecayIcon(); // alpha decay icon
      case DecayType.BETA_MINUS_DECAY:
        return IconFactory.createBetaDecayIcon( true ); // beta minus decay icon
      case DecayType.BETA_PLUS_DECAY:
        return IconFactory.createBetaDecayIcon( false ); // beta plus decay icon
      case DecayType.PROTON_EMISSION:
        return IconFactory.createNucleonEmissionIcon( ParticleType.PROTON ); // proton emission icon
      case DecayType.NEUTRON_EMISSION:
        return IconFactory.createNucleonEmissionIcon( ParticleType.NEUTRON ); // neutron emission icon
      default:
        return null;
    }
  }
}

buildANucleus.register( 'IconFactory', IconFactory );
export default IconFactory;
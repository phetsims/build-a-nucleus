// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node that represents the initial part of the Nuclide chart, up to 10 protons and 12 neutrons.
 *
 * @author Luisa Vargas
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { GridBox, HBox, Node, NodeOptions, ProfileColorProperty, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BANColors from '../../common/BANColors.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import DecayType from '../../common/view/DecayType.js';
import NucleonNumberLine from './NucleonNumberLine.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Orientation from '../../../../phet-core/js/Orientation.js';

type NuclideChartNodeOptions = NodeOptions;

// constants
const LEGEND_FONT = new PhetFont( 12 );
const LEGEND_KEY_BOX_SIZE = 14;

class NuclideChartNode extends Node {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      providedOptions?: NuclideChartNodeOptions ) {

    super( providedOptions );

    const protonNumberLine = new NucleonNumberLine( protonCountProperty, Orientation.VERTICAL, {
      labelHighlightColorProperty: BANColors.protonColorProperty,
      axisLabel: BuildANucleusStrings.axis.protonNumber
    } );
    this.addChild( protonNumberLine );

    const neutronNumberLine = new NucleonNumberLine( neutronCountProperty, Orientation.HORIZONTAL, {
      labelHighlightColorProperty: BANColors.neutronColorProperty,
      axisLabel: BuildANucleusStrings.axis.neutronNumber
    } );
    neutronNumberLine.top = protonNumberLine.bottom;
    neutronNumberLine.left = protonNumberLine.right;
    this.addChild( neutronNumberLine );

    // create a legend item which consists of a box with the legend color and the string of the decay type to its right
    const createLegendItem = ( decayTypeText: string, decayTypeColor: ProfileColorProperty ): HBox => {
      return new HBox( {
        children: [
          new Rectangle( {
            rectSize: new Dimension2( LEGEND_KEY_BOX_SIZE, LEGEND_KEY_BOX_SIZE ),
            fill: decayTypeColor,
            stroke: BANColors.nuclideChartBorderColorProperty
          } ),
          new RichText( decayTypeText, { font: LEGEND_FONT } )
        ],
        spacing: 5
        // TODO: add maxWidth
      } );
    };

    // to store all legend items
    const decayHBoxes = [];
    const stableHBox = createLegendItem( BuildANucleusStrings.stable, BANColors.stableColorProperty );
    decayHBoxes.push( stableHBox );

    // create the legend item for each decay type in a grid box
    DecayType.enumeration.values.forEach( decayType => {
      decayHBoxes.push( createLegendItem( decayType.label, decayType.colorProperty ) );
    } );
    const legendGridBox = new GridBox( {
      children: decayHBoxes,
      autoColumns: 2,
      ySpacing: 5,
      xSpacing: 80,
      xAlign: 'left'
    } );
    legendGridBox.top = neutronNumberLine.bottom + 10;
    legendGridBox.left = this.left;
    this.addChild( legendGridBox );

  }
}

buildANucleus.register( 'NuclideChartNode', NuclideChartNode );
export default NuclideChartNode;
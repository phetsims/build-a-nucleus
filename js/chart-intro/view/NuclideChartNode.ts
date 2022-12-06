// Copyright 2022, University of Colorado Boulder

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

type NuclideChartNodeOptions = NodeOptions;

// constants
const LEGEND_FONT = new PhetFont( 12 );
const LEGEND_KEY_BOX_SIZE = 20;

class NuclideChartNode extends Node {

  public constructor( providedOptions?: NuclideChartNodeOptions ) {

    super( providedOptions );

    // create and add the legend
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
        spacing: 10
        // TODO: add maxWidth
      } );
    };

    const decayHBoxes = [];
    const stableHBox = createLegendItem( BuildANucleusStrings.stable, BANColors.stableColorProperty );
    decayHBoxes.push( stableHBox );
    DecayType.enumeration.values.forEach( decayType => {
      decayHBoxes.push( createLegendItem( decayType.label, decayType.colorProperty ) );
    } );

    const legendGridBox = new GridBox( {
      children: decayHBoxes,
      autoColumns: 2,
      ySpacing: 5,
      xSpacing: 20,
      xAlign: 'left'
    } );
    this.addChild( legendGridBox );

  }
}

buildANucleus.register( 'NuclideChartNode', NuclideChartNode );
export default NuclideChartNode;
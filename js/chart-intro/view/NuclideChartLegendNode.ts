// Copyright 2023-2024, University of Colorado Boulder

/**
 * Node that represents the legend of the nuclide chart, square boxes with different background colors for each decay type.
 *
 * @author Luisa Vargas
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { GridBox, HBox, Node, ProfileColorProperty, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';
import DecayType from '../../common/model/DecayType.js';

// constants
const LEGEND_KEY_BOX_SIZE = 14;

class NuclideChartLegendNode extends Node {

  public constructor() {
    super();

    // Create a legend item which consists of a box with the legend color and the string of the decay type to its right.
    const createLegendItem = ( decayTypeText: TReadOnlyProperty<string>, decayTypeColor: ProfileColorProperty ): HBox => {
      return new HBox( {
        children: [
          new Rectangle( {
            rectSize: new Dimension2( LEGEND_KEY_BOX_SIZE, LEGEND_KEY_BOX_SIZE ),
            fill: decayTypeColor,
            stroke: BANColors.nuclideChartBorderColorProperty
          } ),
          new RichText( decayTypeText, {
            font: BANConstants.LEGEND_FONT.font,
            maxWidth: 100
          } )
        ],
        spacing: 5
      } );
    };

    // Stores all legend items.
    const decayHBoxes = [];
    const stableHBox = createLegendItem( BuildANucleusStrings.stableStringProperty, BANColors.stableColorProperty );
    decayHBoxes.push( stableHBox );

    // Create the legend item for each decay type in a grid box.
    DecayType.enumeration.values.forEach( decayType => {
      decayHBoxes.push( createLegendItem( decayType.labelStringProperty, decayType.colorProperty ) );
    } );
    const legendGridBox = new GridBox( {
      children: decayHBoxes,
      autoColumns: 2,
      ySpacing: 5,
      xSpacing: 80,
      xAlign: 'left'
    } );
    this.addChild( legendGridBox );

  }
}

buildANucleus.register( 'NuclideChartLegendNode', NuclideChartLegendNode );
export default NuclideChartLegendNode;
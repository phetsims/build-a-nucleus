// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node that represents the initial part of the Nuclide chart, up to 10 protons and 12 neutrons.
 *
 * @author Luisa Vargas
 */

import { Node, NodeOptions } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BANColors from '../../common/BANColors.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import NucleonNumberLine from './NucleonNumberLine.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import BANConstants from '../../common/BANConstants.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Range from '../../../../dot/js/Range.js';
import NuclideChartLegendNode from './NuclideChartLegendNode.js';

type NuclideChartNodeOptions = NodeOptions;

class NuclideChartNode extends Node {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      providedOptions?: NuclideChartNodeOptions ) {

    super( providedOptions );

    const scaleFactor = 20;
    const chartTransform = new ChartTransform( {
      viewWidth: BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS * scaleFactor,
      modelXRange: new Range( BANConstants.DEFAULT_INITIAL_NEUTRON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS ),
      viewHeight: BANConstants.CHART_MAX_NUMBER_OF_PROTONS * scaleFactor,
      modelYRange: new Range( BANConstants.DEFAULT_INITIAL_PROTON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_PROTONS )
    } );

    const protonNumberLine = new NucleonNumberLine( chartTransform, protonCountProperty, Orientation.VERTICAL, {
      labelHighlightColorProperty: BANColors.protonColorProperty,
      axisLabel: BuildANucleusStrings.axis.protonNumber
    } );
    this.addChild( protonNumberLine );

    const neutronNumberLine = new NucleonNumberLine( chartTransform, neutronCountProperty, Orientation.HORIZONTAL, {
      labelHighlightColorProperty: BANColors.neutronColorProperty,
      axisLabel: BuildANucleusStrings.axis.neutronNumber
    } );
    neutronNumberLine.top = protonNumberLine.bottom;
    neutronNumberLine.left = protonNumberLine.right;
    this.addChild( neutronNumberLine );

    const nuclideChartLegendNode = new NuclideChartLegendNode();
    nuclideChartLegendNode.top = neutronNumberLine.bottom + 10;
    this.addChild( nuclideChartLegendNode );
  }
}

buildANucleus.register( 'NuclideChartNode', NuclideChartNode );
export default NuclideChartNode;
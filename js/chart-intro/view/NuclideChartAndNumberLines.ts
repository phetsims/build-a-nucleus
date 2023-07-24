// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node that contains some content in the 'Nuclide Chart', including the proton and neutron NucleonNumberLine's,
 * and the NuclideChartNode.
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
import NuclideChartNode, { NuclideChartNodeOptions } from './NuclideChartNode.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';

type SelfOptions = {
  nuclideChartNodeOptions?: Partial<NuclideChartNodeOptions>;
};
type NuclideChartAndNumberLinesOptions = SelfOptions & StrictOmit<NodeOptions, 'excludeInvisibleChildrenFromBounds' | 'children'>;

class NuclideChartAndNumberLines extends Node {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      chartTransform: ChartTransform, providedOptions?: NuclideChartAndNumberLinesOptions ) {

    const options = optionize<NuclideChartAndNumberLinesOptions, SelfOptions, NodeOptions>()( {
      excludeInvisibleChildrenFromBounds: true,
      nuclideChartNodeOptions: {}
    }, providedOptions );

    // create and add the nuclideChartNode
    const nuclideChartNode = new NuclideChartNode( protonCountProperty, neutronCountProperty, chartTransform,
      combineOptions<NuclideChartNodeOptions>( {
        cellTextFontSize: 11,
        arrowSymbol: false
      }, options.nuclideChartNodeOptions )
    );

    const protonNumberLine = new NucleonNumberLine( chartTransform, protonCountProperty, Orientation.VERTICAL, {
      labelHighlightColorProperty: BANColors.protonColorProperty,
      axisLabelStringProperty: BuildANucleusStrings.axis.protonNumberStringProperty
    } );

    const neutronNumberLine = new NucleonNumberLine( chartTransform, neutronCountProperty, Orientation.HORIZONTAL, {
      labelHighlightColorProperty: BANColors.neutronColorProperty,
      axisLabelStringProperty: BuildANucleusStrings.axis.neutronNumberStringProperty
    } );
    neutronNumberLine.top = protonNumberLine.bottom;
    neutronNumberLine.left = protonNumberLine.right;

    // TODO: We don't fully understand this magic number https://github.com/phetsims/build-a-nucleus/issues/93
    nuclideChartNode.left = chartTransform.modelToViewX( 0.4 );

    options.children = [ nuclideChartNode, protonNumberLine, neutronNumberLine ];
    super( options );
  }
}

buildANucleus.register( 'NuclideChartAndNumberLines', NuclideChartAndNumberLines );
export default NuclideChartAndNumberLines;
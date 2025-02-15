// Copyright 2022-2025, University of Colorado Boulder

/**
 * Node that contains some content in the 'Nuclide Chart', including the proton and neutron NucleonNumberLine's,
 * and the NuclideChartNode.
 *
 * @author Luisa Vargas
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';
import NucleonNumberLine from './NucleonNumberLine.js';
import NuclideChartNode, { NuclideChartNodeOptions } from './NuclideChartNode.js';

type SelfOptions = {
  nuclideChartNodeOptions?: Partial<NuclideChartNodeOptions>;
};
type NuclideChartAndNumberLinesOptions = SelfOptions & StrictOmit<NodeOptions, 'excludeInvisibleChildrenFromBounds' | 'children'>;

class NuclideChartAndNumberLines extends Node {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      chartTransform: ChartTransform, providedOptions?: NuclideChartAndNumberLinesOptions ) {

    const options =
      optionize<NuclideChartAndNumberLinesOptions, SelfOptions, NodeOptions>()( {
        excludeInvisibleChildrenFromBounds: true,
        nuclideChartNodeOptions: {}
      }, providedOptions );

    // Create the nuclideChartNode.
    const nuclideChartNode = new NuclideChartNode(
      protonCountProperty, neutronCountProperty, chartTransform,
      combineOptions<NuclideChartNodeOptions>( {
        cellTextFontSize: 11,
        arrowSymbol: false
      }, options.nuclideChartNodeOptions )
    );

    // Create and position the number lines.
    const tickSpacing = 1;
    const protonNumberLine = new NucleonNumberLine(
      chartTransform, protonCountProperty, Orientation.VERTICAL, {
        labelHighlightColorProperty: BANColors.protonColorProperty,
        axisLabelStringProperty: BuildANucleusStrings.axis.protonNumberStringProperty,
        tickSpacing: tickSpacing
      } );
    const neutronNumberLine = new NucleonNumberLine(
      chartTransform, neutronCountProperty, Orientation.HORIZONTAL, {
        labelHighlightColorProperty: BANColors.neutronColorProperty,
        axisLabelStringProperty: BuildANucleusStrings.axis.neutronNumberStringProperty,
        tickSpacing: tickSpacing
      } );
    neutronNumberLine.top = protonNumberLine.bottom;
    neutronNumberLine.left = protonNumberLine.right;

    // The numberLine's origin is at 0 in model coordinates, but because of how we position the labels offset from the
    // tick marks (see NucleonNumberLine), we need to do that here too.
    nuclideChartNode.left = neutronNumberLine.localToParentPoint( Vector2.ZERO ).x
                            - chartTransform.modelToViewX( tickSpacing );

    options.children = [ nuclideChartNode, protonNumberLine, neutronNumberLine ];
    super( options );
  }
}

buildANucleus.register( 'NuclideChartAndNumberLines', NuclideChartAndNumberLines );
export default NuclideChartAndNumberLines;
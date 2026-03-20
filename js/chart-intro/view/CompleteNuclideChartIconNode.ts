// Copyright 2023-2026, University of Colorado Boulder

/**
 * Icon node for complete NuclideChart which goes up to 10 protons and 12 neutrons.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import NuclideChartAccordionBox from './NuclideChartAccordionBox.js';
import NuclideChartNode from './NuclideChartNode.js';

class CompleteNuclideChartIconNode extends Node {

  public constructor() {

    // Create and add a nuclide chart.
    const cellLayerNode = new Node();
    const smallChartTransform = NuclideChartAccordionBox.getChartTransform( 3.5 );
    NuclideChartNode.createNuclideChart( cellLayerNode, smallChartTransform, smallChartTransform.modelToViewDeltaX( 1 ) );

    super( { children: [ cellLayerNode ] } );
  }
}

export default CompleteNuclideChartIconNode;

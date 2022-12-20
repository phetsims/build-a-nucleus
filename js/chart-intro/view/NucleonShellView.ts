// Copyright 2022, University of Colorado Boulder

/**
 * Node that represents the nucleon shells, aka straight horizontal lines above the buckets, in the view.
 *
 * @author Luisa Vargas
 */

import { Line, Node, NodeOptions } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Particle from '../../../../shred/js/model/Particle.js';

type EnergyLevelNodeOptions = NodeOptions;
type ParticleShellPosition = {
  particle: Particle | null;
  xPosition: number; // 0 - 5
};

class NucleonShellView extends Node {
  private modelViewTransform: ModelViewTransform2;

  public constructor( nucleonShellPositions: ParticleShellPosition[][], providedOptions: EnergyLevelNodeOptions ) {
    super( providedOptions );

    const particleLength = BANConstants.PARTICLE_RADIUS * 2;

    this.modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping( new Bounds2( 0, 0, 5, 2 ),
      new Bounds2( 0, 0, ( particleLength * 6 ) + BANConstants.PARTICLE_RADIUS, 200 ) );

    // create and add the nucleon energy levels
    const energyLevels: Line[] = [];
    nucleonShellPositions.forEach( ( particleShellRow, energyLevel ) => {
      energyLevels.push(
        new Line(
          this.modelViewTransform.modelToViewX( particleShellRow[ energyLevel === 0 ? 2 : 0 ].xPosition ),
          this.modelViewTransform.modelToViewY( energyLevel ),
          this.modelViewTransform.modelToViewX( particleShellRow[ particleShellRow.length - 1 ].xPosition + 1 ),
          this.modelViewTransform.modelToViewY( energyLevel ),
          {
            stroke: 'black'
          }
        )
      );
    } );

    energyLevels.forEach( energyLevel => this.addChild( energyLevel ) );
  }
}

buildANucleus.register( 'NucleonShellView', NucleonShellView );
export default NucleonShellView;
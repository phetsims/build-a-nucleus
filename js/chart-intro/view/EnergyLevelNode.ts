// Copyright 2022, University of Colorado Boulder

import { Line, Node, NodeOptions } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import EnergyLevelModel from '../model/EnergyLevelModel.js';
import BANConstants from '../../common/BANConstants.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';

type EnergyLevelNodeOptions = NodeOptions;

class EnergyLevelNode extends Node {

  private model: EnergyLevelModel;
  private modelViewTransform: ModelViewTransform2;

  public constructor( model: EnergyLevelModel, providedOptions: EnergyLevelNodeOptions ) {

    super( providedOptions );

    this.model = model;

    const particleLength = BANConstants.PARTICLE_RADIUS * 2;

    this.modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping( new Bounds2( 0, 0, 5, 2 ),
      new Bounds2( 0, 0, ( particleLength * 6 ) + BANConstants.PARTICLE_RADIUS, 200 ) );

    // create and add the energy levels
    const energyLevels: Line[] = [];
    model.particleShellPositions.forEach( ( particleShellRow, energyLevel ) => {
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

buildANucleus.register( 'EnergyLevelNode', EnergyLevelNode );
export default EnergyLevelNode;
// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node that represents the nucleon shells, aka straight horizontal lines above the buckets, in the view.
 *
 * @author Luisa Vargas
 */

import { Color, Line, Node, NodeOptions } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BANColors from '../../common/BANColors.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ParticleType from '../../common/model/ParticleType.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { FIRST_LEVEL_CAPACITY, ParticleShellPosition, SECOND_LEVEL_CAPACITY } from '../model/ParticleNucleus.js';

type SelfOptions = {
  xOffset?: number;
};
type EnergyLevelNodeOptions = SelfOptions & NodeOptions;

class NucleonShellView extends Node {
  private modelViewTransform: ModelViewTransform2;

  public constructor( particleType: ParticleType, nucleonShellPositions: ParticleShellPosition[][],
                      nucleonCountProperty: TReadOnlyProperty<number>, particleViewPositionVector: Vector2,
                      providedOptions?: EnergyLevelNodeOptions ) {

    assert && assert( particleType === ParticleType.NEUTRON || particleType === ParticleType.PROTON,
      'only protons and neutrons supported in NucleonShellView' );

    const options = optionize<EnergyLevelNodeOptions, SelfOptions, NodeOptions>()( {
      xOffset: 0
    }, providedOptions );
    super( options );

    this.y = particleViewPositionVector.y + BANConstants.PARTICLE_RADIUS;
    this.x = particleViewPositionVector.x + options.xOffset - BANConstants.PARTICLE_RADIUS;

    this.modelViewTransform = BANConstants.NUCLEON_ENERGY_LEVEL_ARRAY_MVT;

    // Color when the layer is completely empty
    const emptyLayerColor = BANColors.zeroNucleonsEnergyLevelColorProperty.value;

    // Color when the layer is completely full
    const fullLayerColor = particleType === ParticleType.NEUTRON ?
                           BANColors.neutronColorProperty.value :
                           BANColors.protonColorProperty.value;

    // create and add the nucleon energy levels
    const energyLevels: Line[] = [];
    nucleonShellPositions.forEach( ( particleShellRow, energyLevel ) => {
      const particleLength = 2 * BANConstants.PARTICLE_RADIUS;
      energyLevels.push(
        new Line(
          this.modelViewTransform.modelToViewX( particleShellRow[ energyLevel === 0 ? 2 : 0 ].xPosition ),
          this.modelViewTransform.modelToViewY( energyLevel ),

          // extend the energyLevel to the outer edge of the last particle
          this.modelViewTransform.modelToViewX( particleShellRow[ particleShellRow.length - 1 ].xPosition ) + particleLength,
          this.modelViewTransform.modelToViewY( energyLevel ),
          {
            stroke: 'black'
          }
        )
      );
    } );
    energyLevels.forEach( energyLevel => this.addChild( energyLevel ) );

    // update the stroke color and width of the respective energy levels as the nucleon count changes
    const boldEnergyLevelWidth = 4;
    const defaultEnergyLevelWidth = 1;
    nucleonCountProperty.link( nucleonCount => {
      if ( nucleonCount <= FIRST_LEVEL_CAPACITY ) {
        energyLevels[ 0 ].stroke = Color.interpolateRGBA( emptyLayerColor, fullLayerColor, nucleonCount / FIRST_LEVEL_CAPACITY );

        // if the energy level is full (2 particles on the lower energy level), double the lineWidth
        energyLevels[ 0 ].lineWidth = nucleonCount === FIRST_LEVEL_CAPACITY ? boldEnergyLevelWidth : defaultEnergyLevelWidth;
      }
      else {
        let energyLevelNumber = 1;
        if ( nucleonCount > SECOND_LEVEL_CAPACITY + FIRST_LEVEL_CAPACITY ) {
          nucleonCount -= SECOND_LEVEL_CAPACITY;
          energyLevelNumber = FIRST_LEVEL_CAPACITY;
        }
        nucleonCount -= FIRST_LEVEL_CAPACITY; // REVIEW: instead of mutating the listener variable, it is better to name a new one (less confusing that way)
        const stroke = Color.interpolateRGBA( emptyLayerColor, fullLayerColor, nucleonCount / SECOND_LEVEL_CAPACITY );

        console.log( nucleonCount / SECOND_LEVEL_CAPACITY );
        energyLevels[ energyLevelNumber ].stroke = stroke;

        // if the energy level is full (6 particles on the upper and middle energy levels), double the lineWidth
        energyLevels[ energyLevelNumber ].lineWidth = nucleonCount === SECOND_LEVEL_CAPACITY ? boldEnergyLevelWidth : defaultEnergyLevelWidth;
      }
    } );
  }
}

buildANucleus.register( 'NucleonShellView', NucleonShellView );
export default NucleonShellView;
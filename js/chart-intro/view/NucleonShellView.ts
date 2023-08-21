// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node that represents the nucleon shells, meaning the straight horizontal lines above the buckets, in the view.
 *
 * This view Node assumes a lot of ParticleView, and how its position is based on its center (note usages of
 * BANConstants.PARTICLE_RADIUS).
 *
 * @author Luisa Vargas
 */

import { Color, Line, Node, NodeOptions } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import BANColors from '../../common/BANColors.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ParticleType from '../../common/model/ParticleType.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { FIRST_LEVEL_CAPACITY, ParticleShellPosition, SECOND_LEVEL_CAPACITY } from '../model/ParticleNucleus.js';
import EnergyLevelType from '../model/EnergyLevelType.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';

type EnergyLevelNodeOptions = EmptySelfOptions & NodeOptions;

class NucleonShellView extends Node {

  public constructor( particleType: ParticleType, nucleonShellPositions: ParticleShellPosition[][],
                      nucleonCountProperty: TReadOnlyProperty<number>, modelViewTransform: ModelViewTransform2,
                      providedOptions?: EnergyLevelNodeOptions ) {

    assert && assert( particleType === ParticleType.NEUTRON || particleType === ParticleType.PROTON,
      'only protons and neutrons supported in NucleonShellView' );

    const options = optionize<EnergyLevelNodeOptions, EmptySelfOptions, NodeOptions>()( {}, providedOptions );
    super( options );

    // Color when the layer is completely empty
    const emptyLayerColor = BANColors.zeroNucleonsEnergyLevelColorProperty.value;

    // Color when the layer is completely full
    const fullLayerColor = particleType === ParticleType.NEUTRON ?
                           BANColors.neutronColorProperty.value :
                           BANColors.protonColorProperty.value;

    // create and add the nucleon energy levels
    const energyLevels: Line[] = [];
    nucleonShellPositions.forEach( ( particleShellRow, energyLevel ) => {

      // energy level's start at the left edge of the first particle in the row, so move the lines a 'particle radius' length left
      // energy level's sit below the particles, so move the lines a 'particle radius' length down
      // the first energy level begins at xPosition 2 instead of 0, for more information see ALLOWED_PARTICLE_POSITIONS
      const lineStartingPoint = new Vector2(
        modelViewTransform.modelToViewX( particleShellRow[ energyLevel === 0 ? 2 : 0 ].xPosition ) - BANConstants.PARTICLE_RADIUS,
        modelViewTransform.modelToViewY( energyLevel ) + BANConstants.PARTICLE_RADIUS );

      // add the particle radius to extend the energyLevel to the right edge of the last particle
      const lineEndingPoint = new Vector2(
        modelViewTransform.modelToViewX( particleShellRow[ particleShellRow.length - 1 ].xPosition ) + BANConstants.PARTICLE_RADIUS,
        modelViewTransform.modelToViewY( energyLevel ) + BANConstants.PARTICLE_RADIUS );
      energyLevels.push( new Line( lineStartingPoint, lineEndingPoint, { stroke: 'black' } )
      );
    } );
    energyLevels.forEach( energyLevel => this.addChild( energyLevel ) );

    // update the stroke color and width of the respective energy levels as the nucleon number changes
    const boldEnergyLevelWidth = 4;
    const defaultEnergyLevelWidth = 1;
    let xPositionIndex; // the xPosition from 1 to 5 for the second and third energy levels
    nucleonCountProperty.link( nucleonNumber => {
      if ( nucleonNumber <= FIRST_LEVEL_CAPACITY ) {
        const firstEnergyLevel = EnergyLevelType.NONE.yPosition; // set to first energy level where yPosition = 0
        energyLevels[ firstEnergyLevel ].stroke = Color.interpolateRGBA( emptyLayerColor, fullLayerColor, nucleonNumber / FIRST_LEVEL_CAPACITY );

        // if the energy level is full (2 particles on the lower energy level), double the lineWidth
        energyLevels[ firstEnergyLevel ].lineWidth = nucleonNumber === FIRST_LEVEL_CAPACITY ? boldEnergyLevelWidth : defaultEnergyLevelWidth;
      }
      else {
        let energyLevelNumber = EnergyLevelType.FIRST.yPosition; // initialize to second energy level where yPosition = 1
        xPositionIndex = nucleonNumber; // initialize to the current nucleonNumber
        if ( nucleonNumber > ( SECOND_LEVEL_CAPACITY + FIRST_LEVEL_CAPACITY ) ) {
          xPositionIndex = nucleonNumber - SECOND_LEVEL_CAPACITY;
          energyLevelNumber = EnergyLevelType.SECOND.yPosition;
        }
        xPositionIndex = xPositionIndex - FIRST_LEVEL_CAPACITY;
        energyLevels[ energyLevelNumber ].stroke = Color.interpolateRGBA( emptyLayerColor, fullLayerColor, xPositionIndex / SECOND_LEVEL_CAPACITY );

        // if the energy level is full (6 particles on the upper and middle energy levels), double the lineWidth
        energyLevels[ energyLevelNumber ].lineWidth = xPositionIndex === SECOND_LEVEL_CAPACITY ? boldEnergyLevelWidth : defaultEnergyLevelWidth;
      }
    } );
  }
}

buildANucleus.register( 'NucleonShellView', NucleonShellView );
export default NucleonShellView;
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
import { N_ZERO_CAPACITY, ParticleShellPosition, N_ONE_CAPACITY } from '../model/ShellModelNucleus.js';
import EnergyLevelType from '../model/EnergyLevelType.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';

type EnergyLevelNodeOptions = EmptySelfOptions & NodeOptions;

class NucleonShellView extends Node {

  public constructor( particleType: ParticleType, nucleonShellPositions: ParticleShellPosition[][],
                      nucleonCountProperty: TReadOnlyProperty<number>, modelViewTransform: ModelViewTransform2,
                      providedOptions?: EnergyLevelNodeOptions ) {

    assert && assert( particleType === ParticleType.NEUTRON || particleType === ParticleType.PROTON,
      'only protons and neutrons supported in NucleonShellView' );

    const options =
      optionize<EnergyLevelNodeOptions, EmptySelfOptions, NodeOptions>()( {}, providedOptions );
    super( options );

    // Color when the layer is completely empty.
    const emptyLayerColor = BANColors.zeroNucleonsEnergyLevelColorProperty.value;

    // Color when the layer is completely full.
    const fullLayerColor = particleType === ParticleType.NEUTRON ?
                           BANColors.neutronColorProperty.value :
                           BANColors.protonColorProperty.value;

    // Create and add the nucleon energy levels.
    const energyLevels: Line[] = [];
    nucleonShellPositions.forEach( ( particleShellRow, energyLevel ) => {

      // Energy level's start at left edge of the first particle in a row, so move the lines a 'particle radius' length left.
      // Energy level's sit below the particles, so move the lines a 'particle radius' length down.
      // The first energy level begins at xPosition 2 instead of 0, for more information see ALLOWED_PARTICLE_POSITIONS.
      const lineStartingPoint = new Vector2(
        modelViewTransform.modelToViewX( particleShellRow[ energyLevel === 0 ? 2 : 0 ].xPosition )
        - BANConstants.PARTICLE_RADIUS,
        modelViewTransform.modelToViewY( energyLevel ) + BANConstants.PARTICLE_RADIUS
      );

      // Add the particle radius to extend the energyLevel to the right edge of the last particle.
      const lineEndingPoint = new Vector2(
        modelViewTransform.modelToViewX( particleShellRow[ particleShellRow.length - 1 ].xPosition )
        + BANConstants.PARTICLE_RADIUS,
        modelViewTransform.modelToViewY( energyLevel ) + BANConstants.PARTICLE_RADIUS
      );
      energyLevels.push( new Line( lineStartingPoint, lineEndingPoint, { stroke: 'black' } )
      );
    } );
    energyLevels.forEach( energyLevel => this.addChild( energyLevel ) );

    // Update the stroke color and width of the respective energy levels as the nucleon number changes.
    const boldEnergyLevelWidth = 4;
    const defaultEnergyLevelWidth = 1;
    let xPositionIndex; // The xPosition from 1 to 5 for the second and third energy levels.

    nucleonCountProperty.link( nucleonNumber => {
      if ( nucleonNumber <= N_ZERO_CAPACITY ) {

        // Set to first energy level where yPosition = 0.
        const firstEnergyLevel = EnergyLevelType.N_ZERO.yPosition;
        energyLevels[ firstEnergyLevel ].stroke =
          Color.interpolateRGBA(
            emptyLayerColor,
            fullLayerColor,
            nucleonNumber / N_ZERO_CAPACITY );

        // If the energy level is full (2 particles on the lower energy level), double the lineWidth.
        energyLevels[ firstEnergyLevel ].lineWidth = nucleonNumber === N_ZERO_CAPACITY ?
                                                     boldEnergyLevelWidth :
                                                     defaultEnergyLevelWidth;
      }
      else {

        // Initialize to second energy level where yPosition = 1.
        let energyLevelNumber = EnergyLevelType.N_ONE.yPosition;

        // Initialize to the current nucleonNumber.
        xPositionIndex = nucleonNumber;

        if ( nucleonNumber > ( N_ONE_CAPACITY + N_ZERO_CAPACITY ) ) {
          xPositionIndex = nucleonNumber - N_ONE_CAPACITY;
          energyLevelNumber = EnergyLevelType.N_TWO.yPosition;
        }
        xPositionIndex = xPositionIndex - N_ZERO_CAPACITY;
        energyLevels[ energyLevelNumber ].stroke =
          Color.interpolateRGBA(
            emptyLayerColor,
            fullLayerColor,
            xPositionIndex / N_ONE_CAPACITY );

        // If the energy level is full (6 particles on the upper and middle energy levels), double the lineWidth.
        energyLevels[ energyLevelNumber ].lineWidth = xPositionIndex === N_ONE_CAPACITY ?
                                                      boldEnergyLevelWidth :
                                                      defaultEnergyLevelWidth;
      }
    } );
  }

  /**
   * The bounds of this node doesn't account for the particles that sit on top of the top energy level line, so we need
   * to dilate the capture area above this Node more than below it.
   * Created in https://github.com/phetsims/build-a-nucleus/issues/194
   */
  public getCaptureAreaBounds(): Bounds2 {
    const dilated = this.bounds.dilated( BANConstants.PARTICLE_DIAMETER ); // normal dilation on all sides, like expanding the drag area.

    // account for particles above the top energy level
    return dilated.offset( 0, BANConstants.PARTICLE_RADIUS, 0, 0 );
  }
}

buildANucleus.register( 'NucleonShellView', NucleonShellView );
export default NucleonShellView;
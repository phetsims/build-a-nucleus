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
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { FIRST_LEVEL_CAPACITY, ParticleShellPosition, SECOND_LEVEL_CAPACITY } from '../model/ParticleNucleus.js';

type EnergyLevelNodeOptions = EmptySelfOptions & NodeOptions;

class NucleonShellView extends Node {
  private modelViewTransform: ModelViewTransform2;

  public constructor( particleType: ParticleType, nucleonShellPositions: ParticleShellPosition[][],
                      nucleonCountProperty: TReadOnlyProperty<number>, providedOptions?: EnergyLevelNodeOptions ) {

    assert && assert( particleType === ParticleType.NEUTRON || particleType === ParticleType.PROTON,
      'only protons and neutrons supported in NucleonShellView' );

    const options = optionize<EnergyLevelNodeOptions, EmptySelfOptions, NodeOptions>()( {}, providedOptions );
    super( options );

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

      const lineStartingPoint = new Vector2(

        // draw the line to start at the left edge of the first particle, so move the line a 'particle radius' length left
        this.modelViewTransform.modelToViewX( particleShellRow[ energyLevel === 0 ? 2 : 0 ].xPosition ) - BANConstants.PARTICLE_RADIUS,

        // draw the line to sit below the particles, so move the line a 'particle radius' length down
        this.modelViewTransform.modelToViewY( energyLevel ) + BANConstants.PARTICLE_RADIUS );

      const lineEndingPoint = new Vector2(

        // add the particle diameter to extend the energyLevel to the right edge of the last particle
        this.modelViewTransform.modelToViewX( particleShellRow[ particleShellRow.length - 1 ].xPosition ) + BANConstants.PARTICLE_DIAMETER - BANConstants.PARTICLE_RADIUS,
        this.modelViewTransform.modelToViewY( energyLevel ) + BANConstants.PARTICLE_RADIUS );
      energyLevels.push( new Line( lineStartingPoint, lineEndingPoint, { stroke: 'black' } )
      );
    } );
    energyLevels.forEach( energyLevel => this.addChild( energyLevel ) );

    // update the stroke color and width of the respective energy levels as the nucleon number changes
    const boldEnergyLevelWidth = 4;
    const defaultEnergyLevelWidth = 1;
    nucleonCountProperty.link( nucleonNumber => {
      if ( nucleonNumber <= FIRST_LEVEL_CAPACITY ) {
        energyLevels[ 0 ].stroke = Color.interpolateRGBA( emptyLayerColor, fullLayerColor, nucleonNumber / FIRST_LEVEL_CAPACITY );

        // if the energy level is full (2 particles on the lower energy level), double the lineWidth
        energyLevels[ 0 ].lineWidth = nucleonNumber === FIRST_LEVEL_CAPACITY ? boldEnergyLevelWidth : defaultEnergyLevelWidth;
      }
      else {
        let energyLevelNumber = 1;
        if ( nucleonNumber > SECOND_LEVEL_CAPACITY + FIRST_LEVEL_CAPACITY ) {
          nucleonNumber -= SECOND_LEVEL_CAPACITY;
          energyLevelNumber = FIRST_LEVEL_CAPACITY;
        }
        nucleonNumber -= FIRST_LEVEL_CAPACITY; // REVIEW: instead of mutating the listener variable, it is better to name a new one (less confusing that way)
        energyLevels[ energyLevelNumber ].stroke = Color.interpolateRGBA( emptyLayerColor, fullLayerColor, nucleonNumber / SECOND_LEVEL_CAPACITY );

        // if the energy level is full (6 particles on the upper and middle energy levels), double the lineWidth
        energyLevels[ energyLevelNumber ].lineWidth = nucleonNumber === SECOND_LEVEL_CAPACITY ? boldEnergyLevelWidth : defaultEnergyLevelWidth;
      }
    } );
  }
}

buildANucleus.register( 'NucleonShellView', NucleonShellView );
export default NucleonShellView;
// Copyright 2022, University of Colorado Boulder

/**
 * Model class which the 'Decay' and 'Nuclide Chart' screen will extend.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import optionize from '../../../../phet-core/js/optionize.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import ParticleType from '../../decay/view/ParticleType.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

// types
export type BANModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

class BANModel {

  public isStableBooleanProperty: IReadOnlyProperty<boolean>;
  public readonly massNumberProperty: IReadOnlyProperty<number>;
  public readonly doesNuclideExistBooleanProperty: IReadOnlyProperty<boolean>;
  public particles: ObservableArray<Particle>;
  public particleAtom: ParticleAtom;
  public protonCountRange: Range;
  public neutronCountRange: Range;
  public incomingProtons: ObservableArray<Particle>;
  public incomingNeutrons: ObservableArray<Particle>;
  public doubleArrowButtonClickedBooleanProperty: BooleanProperty;

  constructor( maximumProtonNumber: number, maximumNeutronNumber: number, providedOptions?: BANModelOptions ) {

    const options = optionize<BANModelOptions, {}>()( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    console.log( options.tandem );

    // Create the atom that the user will build, modify, and generally play with.
    this.particleAtom = new ParticleAtom();

    // arrays of all Particle's that exist in all places
    this.particles = createObservableArray();

    // array of particles sent to the nucleus but not there yet
    this.incomingProtons = createObservableArray();
    this.incomingNeutrons = createObservableArray();

    // keep track of when the double arrow buttons are clicked or when the single arrow buttons are clicked
    this.doubleArrowButtonClickedBooleanProperty = new BooleanProperty( false );

    // the range of the number of protons allowed
    this.protonCountRange = new Range( 0, maximumProtonNumber );

    // the range of the number of neutrons allowed
    this.neutronCountRange = new Range( 0, maximumNeutronNumber );

    // the number of protons and neutrons
    this.massNumberProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => protonCount + neutronCount
    );

    // the stability of the nuclide with a given number of protons and neutrons
    this.isStableBooleanProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => AtomIdentifier.isStable( protonCount, neutronCount )
    );

    // if a nuclide with a given number of protons and neutrons exists
    this.doesNuclideExistBooleanProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => AtomIdentifier.doesExist( protonCount, neutronCount )
    );
  }

  /**
   * Add a Particle to the model
   */
  public addParticle( particle: Particle ): void {
    assert && assert( _.some( ParticleType.enumeration.values, particleType => {
      return particle.type === particleType.name.toLowerCase();
    } ),
      'Particles must be one of the types in ParticleType ' + particle.type );
    this.particles.push( particle );
  }

  /**
   * Remove a Particle from the model
   */
  public removeParticle( particle: Particle ): void {
    this.particles.remove( particle );
  }

  public reset(): void {
    this.particleAtom.clear();
    this.particles.clear();
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public step( dt: number ): void {
    // Update particle positions.
    this.particles.forEach( particle => {
      particle.step( dt );
    } );
  }
}

buildANucleus.register( 'BANModel', BANModel );
export default BANModel;
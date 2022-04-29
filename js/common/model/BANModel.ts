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
import Vector2 from '../../../../dot/js/Vector2.js';

// types
export type BANModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

class BANModel {

  public isStableBooleanProperty: IReadOnlyProperty<boolean>;
  public readonly massNumberProperty: IReadOnlyProperty<number>;
  public readonly doesNuclideExistBooleanProperty: IReadOnlyProperty<boolean>;
  public nucleons: ObservableArray<Particle>;
  public particleAtom: ParticleAtom;
  public protonCountRange: Range;
  public neutronCountRange: Range;
  public incomingProtons: ObservableArray<Particle>;
  public incomingNeutrons: ObservableArray<Particle>;

  constructor( maximumProtonNumber: number, maximumNeutronNumber: number, providedOptions?: BANModelOptions ) {

    const options = optionize<BANModelOptions, {}>()( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    console.log( options.tandem );

    // Create the atom that the user will build, modify, and generally play with.
    this.particleAtom = new ParticleAtom();

    // arrays of proton and neutron Particle's that exist in all places
    this.nucleons = createObservableArray();

    // array of particles sent to the nucleus but not there yet
    this.incomingProtons = createObservableArray();
    this.incomingNeutrons = createObservableArray();

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
   * Animate particle to the given destination and then remove it.
   */
  public animateAndRemoveNucleon( particle: Particle, destination: Vector2 ): void {
    particle.destinationProperty.value = destination;

    particle.animationEndedEmitter.addListener( () => {
      this.removeParticle( particle );
    } );
  }

  /**
   * Add a Particle to the model
   */
  public addParticle( particle: Particle ): void {
    assert && assert( particle.type === ParticleType.PROTON.name.toLowerCase() ||
                      particle.type === ParticleType.NEUTRON.name.toLowerCase(),
      'Nucleons must be of type proton or neutron' );
    this.nucleons.push( particle );
  }

  /**
   * Remove a Particle from the model
   */
  public removeParticle( particle: Particle ): void {
    this.nucleons.remove( particle );
  }

  public reset(): void {
    this.particleAtom.clear();
    this.nucleons.clear();
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public step( dt: number ): void {
    // Update particle positions.
    this.nucleons.forEach( nucleon => {
      nucleon.step( dt );
    } );
  }
}

buildANucleus.register( 'BANModel', BANModel );
export default BANModel;
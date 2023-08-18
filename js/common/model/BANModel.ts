// Copyright 2022-2023, University of Colorado Boulder

/**
 * Model class which the 'Decay' and 'Nuclide Chart' screen will extend.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Range from '../../../../dot/js/Range.js';
import ParticleType from './ParticleType.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Animation from '../../../../twixt/js/Animation.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import BANParticle from './BANParticle.js';
import BANConstants from '../BANConstants.js';

class BANModel<T extends ParticleAtom> {

  // the stability of the nuclide
  public readonly isStableBooleanProperty: TReadOnlyProperty<boolean>;

  // if a nuclide exists
  public readonly doesNuclideExistBooleanProperty: TReadOnlyProperty<boolean>;

  // arrays of all Particle's that exist in all places, except the mini atom in the Chart Intro screen.
  public readonly particles: ObservableArray<BANParticle>;

  // the atom that the user will build, modify, and generally play with.
  public readonly particleAtom: T;

  // the range of the number of protons allowed
  public readonly protonNumberRange: Range;

  // the range of the number of neutrons allowed
  public readonly neutronNumberRange: Range;

  // array of particles sent to the nucleus but not there yet
  public readonly incomingProtons: ObservableArray<BANParticle>;
  public readonly incomingNeutrons: ObservableArray<BANParticle>;

  // If there are any incoming particles currently
  public readonly hasIncomingParticlesProperty: TReadOnlyProperty<boolean>;

  // keep track of when the double arrow buttons are clicked or when the single arrow buttons are clicked
  public readonly doubleArrowButtonClickedBooleanProperty: TProperty<boolean>;

  // keep track of any particle related animations that may need to be cancelled at some point
  public readonly particleAnimations: ObservableArray<Animation | null>;

  public readonly userControlledProtons: ObservableArray<BANParticle>;
  public readonly userControlledNeutrons: ObservableArray<BANParticle>;

  // array of all emitted particles, this helps keep track of particles that are no longer "counted" in the atom
  public readonly outgoingParticles: ObservableArray<BANParticle>;

  protected constructor( maximumProtonNumber: number, maximumNeutronNumber: number, particleAtom: T ) {

    // Create the atom
    this.particleAtom = particleAtom;

    this.particles = createObservableArray( {

      // TODO: Not positive that this is true, but CT will let us know, see https://github.com/phetsims/build-a-nucleus/issues/105
      hasListenerOrderDependencies: true
    } );

    this.incomingProtons = createObservableArray();
    this.incomingNeutrons = createObservableArray();

    this.hasIncomingParticlesProperty = new DerivedProperty( [
      this.incomingProtons.lengthProperty,
      this.incomingNeutrons.lengthProperty
    ], ( protonsLength, neutronsLength ) => protonsLength > 0 || neutronsLength > 0 );

    this.userControlledProtons = createObservableArray();
    this.userControlledNeutrons = createObservableArray();

    this.outgoingParticles = createObservableArray();

    this.particleAnimations = createObservableArray();
    this.particleAnimations.addItemRemovedListener( animation => {
      animation && animation.stop();
    } );

    this.doubleArrowButtonClickedBooleanProperty = new BooleanProperty( false );

    this.protonNumberRange = new Range( BANConstants.CHART_MIN, maximumProtonNumber );
    this.neutronNumberRange = new Range( BANConstants.CHART_MIN, maximumNeutronNumber );

    // the stability of the nuclide is determined by the given number of protons and neutrons
    this.isStableBooleanProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonNumber: number, neutronNumber: number ) => AtomIdentifier.isStable( protonNumber, neutronNumber )
    );

    // if a nuclide with a given number of protons and neutrons exists
    this.doesNuclideExistBooleanProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonNumber: number, neutronNumber: number ) => AtomIdentifier.doesExist( protonNumber, neutronNumber )
    );

    // reconfigure the nucleus when the massNumber changes
    this.particleAtom.massNumberProperty.link( () => this.particleAtom.reconfigureNucleus() );
  }

  /**
   * Select the particle closest to its creator node.
   */
  public getParticleToReturn( particleType: ParticleType, creatorNodePosition: Vector2 ): Particle {
    const sortedParticles = _.sortBy( this.getParticlesByType( particleType ), particle => {
      return particle.positionProperty.value.distance( creatorNodePosition );
    } );

    // We know that sortedParticles is not empty, and does not contain null.
    return sortedParticles.shift()!;
  }

  /**
   * Return array of all the particles that are of particleType and part of the particleAtom
   */
  public getParticlesByType( particleType: ParticleType ): Particle[] {
    const filteredParticles = _.filter( this.particles, particle => {
      return this.particleAtom.containsParticle( particle ) && particle.type === particleType.particleTypeString;
    } );

    assert && assert( filteredParticles.length !== 0, 'No particles of particleType ' + particleType.name + ' are in the particleAtom.' );

    return filteredParticles;
  }

  /**
   * Return the destination of a particle when it's added to the particleAtom.
   */
  public getParticleDestination( particleType: ParticleType, particle: Particle ): Vector2 {
    return this.particleAtom.positionProperty.value;
  }

  /**
   * Add a Particle to the model.
   */
  public addParticle( particle: Particle ): void {
    assert && assert( _.some( ParticleType.enumeration.values, particleType => {
        return particle.type === particleType.particleTypeString;
      } ),
      'Particles must be one of the types in ParticleType ' + particle.type );
    this.particles.push( particle );
  }

  /**
   * Remove a Particle from the model (from the particles array).
   */
  public removeParticle( particle: Particle ): void {
    this.particles.remove( particle );
  }

  public reset(): void {

    // particleAnimations must be cleared before any particle arrays so any remaining animation endedEmitters can complete on remaining particles
    this.particleAnimations.clear();
    this.particleAtom.clear();
    this.particles.clear();
    this.incomingProtons.clear();
    this.incomingNeutrons.clear();
    this.outgoingParticles.clear();
    this.userControlledProtons.clear();
    this.userControlledNeutrons.clear();
  }

  /**
   * @param dt - time step, in seconds
   */
  public step( dt: number ): void {

    // Update particle positions
    this.particles.forEach( particle => {
      assert && assert( !particle.isDisposed, 'cannot step a particle that has already been disposed' );
      particle.step( dt );
    } );
  }
}

buildANucleus.register( 'BANModel', BANModel );
export default BANModel;
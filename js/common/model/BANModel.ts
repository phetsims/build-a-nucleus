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
import Range from '../../../../dot/js/Range.js';
import ParticleType from './ParticleType.js';
import Animation from '../../../../twixt/js/Animation.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import BANParticle from './BANParticle.js';
import BANConstants from '../BANConstants.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';

class BANModel<T extends ParticleAtom> {

  // the stability of the nuclide
  public readonly isStableProperty: TReadOnlyProperty<boolean>;

  // if a nuclide exists
  public readonly nuclideExistsProperty: TReadOnlyProperty<boolean>;

  // arrays of all Particle's that exist in all places, except the mini atom in the Chart Intro screen.
  public readonly particles: ObservableArray<BANParticle>;

  // the atom that the user will build, modify, and generally play with.
  public readonly particleAtom: T;

  // the range of the number of protons allowed
  public readonly protonNumberRange: Range;

  // the range of the number of neutrons allowed
  public readonly neutronNumberRange: Range;

  // array of particles sent to the nucleus but not there yet
  public readonly incomingProtons = createObservableArray<BANParticle>();
  public readonly incomingNeutrons = createObservableArray<BANParticle>();

  // If there are any incoming particles currently
  public readonly hasIncomingParticlesProperty: TReadOnlyProperty<boolean>;

  // keep track of any particle related animations that may need to be cancelled at some point
  public readonly particleAnimations = createObservableArray<Animation | null>();

  public readonly userControlledProtons = createObservableArray<BANParticle>();
  public readonly userControlledNeutrons = createObservableArray<BANParticle>();

  // array of all emitted particles, this helps keep track of particles that are no longer "counted" in the atom
  public readonly outgoingParticles = createObservableArray<BANParticle>();

  protected constructor( maximumProtonNumber: number, maximumNeutronNumber: number, particleAtom: T ) {

    // Create the atom
    this.particleAtom = particleAtom;

    this.particles = createObservableArray();

    this.hasIncomingParticlesProperty = new DerivedProperty( [
      this.incomingProtons.lengthProperty,
      this.incomingNeutrons.lengthProperty
    ], ( protonsLength, neutronsLength ) => protonsLength > 0 || neutronsLength > 0 );

    this.particleAnimations.addItemRemovedListener( animation => {
      animation && animation.stop();
    } );

    this.protonNumberRange = new Range( BANConstants.CHART_MIN, maximumProtonNumber );
    this.neutronNumberRange = new Range( BANConstants.CHART_MIN, maximumNeutronNumber );

    // the stability of the nuclide is determined by the given number of protons and neutrons
    this.isStableProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonNumber, neutronNumber ) => AtomIdentifier.isStable( protonNumber, neutronNumber )
    );

    // If a nuclide with a given number of protons and neutrons exists.
    this.nuclideExistsProperty = new DerivedProperty(
      [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonNumber, neutronNumber ) => AtomIdentifier.doesExist( protonNumber, neutronNumber )
    );

    const userControlledListener = ( isUserControlled: boolean, particle: Particle ) => {
      if ( isUserControlled && this.particleAtom.containsParticle( particle ) ) {
        this.particleAtom.removeParticle( particle );
      }

      if ( isUserControlled && particle.type === ParticleType.PROTON.particleTypeString && !this.userControlledProtons.includes( particle ) ) {
        this.userControlledProtons.add( particle );
      }
      else if ( !isUserControlled && particle.type === ParticleType.PROTON.particleTypeString && this.userControlledProtons.includes( particle ) ) {
        this.userControlledProtons.remove( particle );
      }
      else if ( isUserControlled && particle.type === ParticleType.NEUTRON.particleTypeString && !this.userControlledNeutrons.includes( particle ) ) {
        this.userControlledNeutrons.add( particle );
      }
      else if ( !isUserControlled && particle.type === ParticleType.NEUTRON.particleTypeString && this.userControlledNeutrons.includes( particle ) ) {
        this.userControlledNeutrons.remove( particle );
      }
    };

    this.particles.addItemAddedListener( particle => {

      // No need to remove because when a particle is removed from this.particles, it is disposed
      particle.userControlledProperty.link( isUserControlled => userControlledListener( isUserControlled, particle ) );
    } );

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
    assert && assert( !particle.isDisposed, 'cannot remove a particle that is already disposed' );

    this.particleAtom.containsParticle( particle ) && this.particleAtom.removeParticle( particle );
    this.outgoingParticles.includes( particle ) && this.outgoingParticles.remove( particle );
    if ( this.particles.includes( particle ) ) {
      this.particles.remove( particle );
    }
    else {
      particle.dispose();
    }
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


  /**
   * Create and add a nucleon of particleType immediately to the particleAtom. Position is by default the position of
   * the particleAtom.
   */
  public addNucleonImmediatelyToAtom( particleType: ParticleType ): void {
    const particle = new BANParticle( particleType.particleTypeString );
    this.addParticle( particle );
    this.particleAtom.addParticle( particle );
  }

  /**
   * Populate the ParticleAtom with the desired number of nucleons.
   */
  public populateAtom( numberOfProtons: number, numberOfNeutrons: number ): void {

    // add initial neutrons and protons specified by the query parameters to the atom
    _.times( Math.max( numberOfNeutrons, numberOfProtons ), () => {
      if ( this.particleAtom.neutronCountProperty.value < numberOfNeutrons &&
           this.particleAtom.neutronCountProperty.value < this.neutronNumberRange.max ) {
        this.addNucleonImmediatelyToAtom( ParticleType.NEUTRON );
      }
      if ( this.particleAtom.protonCountProperty.value < numberOfProtons &&
           this.particleAtom.protonCountProperty.value < this.protonNumberRange.max ) {
        this.addNucleonImmediatelyToAtom( ParticleType.PROTON );
      }
    } );

    // In the chart screen view, animation is done through reconfiguring the nucleus, so immediately send all to their
    // destinations instead of relying on animations for the particle's position.
    this.particleAtom.moveAllToDestination();
  }

  /**
   * Don't finish the animation towards to the particle atom, because now it is time to remove this particle
   * (animating it back to the stack).
   */
  public clearIncomingParticle( particle: Particle, particleType: ParticleType ): void {
    assert && assert( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON,
      'only proton and neutron types support for clearing' );
    arrayRemove( particleType === ParticleType.PROTON ? this.incomingProtons : this.incomingNeutrons, particle );
    particle.animationEndedEmitter.removeAllListeners();
  }

  // 2D array that defines the table structure.
  // The rows are the proton number, for example the first row is protonNumber = 0. The numbers in the rows are the neutron number.
  public static readonly POPULATED_CELLS = [
    [ 1, 4, 6 ],
    [ 0, 1, 2, 3, 4, 5, 6 ],
    [ 1, 2, 3, 4, 5, 6, 7, 8 ],
    [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
    [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
    [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
    [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
    [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
    [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
    [ 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
    [ 5, 6, 7, 8, 9, 10, 11, 12 ]
  ];
}

buildANucleus.register( 'BANModel', BANModel );
export default BANModel;
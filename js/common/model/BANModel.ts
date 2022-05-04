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
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DecayScreenView from '../../decay/view/DecayScreenView.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import BANScreenView from '../view/BANScreenView.js';

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
  public doubleArrowButtonClickedBooleanProperty: BooleanProperty;
  private timeSinceCountdownStarted = 0;
  private previousProtonCount = 0;
  private previousNeutronCount = 0;

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

  createParticleFromStack( particleType: ParticleType ): void {
    const particle = new Particle( particleType.name.toLowerCase(), {
      maxZLayer: DecayScreenView.NUM_NUCLEON_LAYERS - 1
    } );
    const origin = particleType === ParticleType.PROTON ?
                   BANScreenView.protonsCreatorNodeModelCenter : BANScreenView.neutronsCreatorNodeModelCenter;
    particle.setPositionAndDestination( origin );
    particle.destinationProperty.value = this.particleAtom.positionProperty.value;
    this.addParticle( particle );

    if ( particleType === ParticleType.PROTON ) {
      this.incomingProtons.push( particle );
    }
    else {
      this.incomingNeutrons.push( particle );
    }

    particle.animationEndedEmitter.addListener( () => {
      if ( !this.particleAtom.containsParticle( particle ) ) {
        this.particleAtom.addParticle( particle );

        if ( particleType === ParticleType.PROTON ) {
          arrayRemove( this.incomingProtons, particle );
        }
        else {
          arrayRemove( this.incomingNeutrons, particle );
        }

        particle.animationEndedEmitter.removeAllListeners();
      }
    } );
  }

  returnParticleToStack( particleType: ParticleType ): void {
    const creatorNodePosition = particleType === ParticleType.PROTON ?
                                BANScreenView.protonsCreatorNodeModelCenter : BANScreenView.neutronsCreatorNodeModelCenter;

    // array of all the particles of particleType
    const particles = [ ...this.nucleons ];

    _.remove( particles, particle => {
      return !this.particleAtom.containsParticle( particle ) || particle.type !== particleType.name.toLowerCase();
    } );

    const sortedParticles = _.sortBy( particles, particle => {
      return particle!.positionProperty.value.distance( creatorNodePosition );
    } );

    const particleToReturn = sortedParticles.shift();
    if ( particleToReturn ) {
      assert && assert( this.particleAtom.containsParticle( particleToReturn ),
        'There is no particle of this type in the atom.' );
      this.particleAtom.removeParticle( particleToReturn );
      this.animateAndRemoveNucleon( particleToReturn, creatorNodePosition );
    }
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

    const protonCount = this.particleAtom.protonCountProperty.value;
    const neutronCount = this.particleAtom.neutronCountProperty.value;

    if ( !this.doesNuclideExistBooleanProperty.value && ( protonCount + neutronCount ) > 0 ) {
      this.timeSinceCountdownStarted += dt;
    }
    else {
      this.timeSinceCountdownStarted = 0;

      // keep track of the old values of protonCountProperty and neutronCountProperty to know which value increased
      this.previousProtonCount = protonCount;
      this.previousNeutronCount = neutronCount;
    }

    // show the nuclide that does not exist for one second, then return the necessary particles
    if ( this.timeSinceCountdownStarted >= 1 ) {
      this.timeSinceCountdownStarted = 0;

      // TODO: change this because it is a bit hacky, uses a boolean property to keep track of if a double arrow button
      //  was clicked
      // a proton and neutron were added to create a nuclide that does not exist, so return a proton and neutron
      if ( this.doubleArrowButtonClickedBooleanProperty.value &&
           AtomIdentifier.doesPreviousNuclideExist( protonCount, neutronCount ) ) {
        this.returnParticleToStack( ParticleType.NEUTRON );
        this.returnParticleToStack( ParticleType.PROTON );
      }

      // the neutronCount increased to create a nuclide that does not exist, so return a neutron to the stack
      else if ( this.previousNeutronCount < neutronCount &&
                AtomIdentifier.doesPreviousIsotopeExist( protonCount, neutronCount ) ) {
        this.returnParticleToStack( ParticleType.NEUTRON );
      }

      // the protonCount increased to create a nuclide that does not exist, so return a proton to the stack
      else if ( this.previousProtonCount < protonCount &&
                AtomIdentifier.doesPreviousIsotoneExist( protonCount, neutronCount ) ) {
        this.returnParticleToStack( ParticleType.PROTON );
      }
    }
  }
}

buildANucleus.register( 'BANModel', BANModel );
export default BANModel;
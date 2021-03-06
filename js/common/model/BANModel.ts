// Copyright 2022, University of Colorado Boulder

/**
 * Model class which the 'Decay' and 'Nuclide Chart' screen will extend.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import IProperty from '../../../../axon/js/IProperty.js';
import Range from '../../../../dot/js/Range.js';
import ParticleType from '../../decay/view/ParticleType.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Animation from '../../../../twixt/js/Animation.js';

// types
export type BANModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

class BANModel {

  // the stability of the nuclide
  public readonly isStableBooleanProperty: IReadOnlyProperty<boolean>;

  // if a nuclide exists
  public readonly doesNuclideExistBooleanProperty: IReadOnlyProperty<boolean>;

  // arrays of all Particle's that exist in all places
  public readonly particles: ObservableArray<Particle>;

  // the atom that the user will build, modify, and generally play with.
  public readonly particleAtom: ParticleAtom;

  // the range of the number of protons allowed
  public readonly protonCountRange: Range;

  // the range of the number of neutrons allowed
  public readonly neutronCountRange: Range;

  // array of particles sent to the nucleus but not there yet
  public readonly incomingProtons: ObservableArray<Particle>;
  public readonly incomingNeutrons: ObservableArray<Particle>;

  // keep track of when the double arrow buttons are clicked or when the single arrow buttons are clicked
  public readonly doubleArrowButtonClickedBooleanProperty: IProperty<boolean>;

  // array of alpha particle animations
  public readonly alphaParticleAnimations: ObservableArray<Animation | null>;

  public readonly userControlledProtons: ObservableArray<Particle>;
  public readonly userControlledNeutrons: ObservableArray<Particle>;

  protected constructor( maximumProtonNumber: number, maximumNeutronNumber: number, providedOptions?: BANModelOptions ) {

    const options = optionize<BANModelOptions, EmptySelfOptions>()( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    console.log( options.tandem );

    // Create the atom
    this.particleAtom = new ParticleAtom();

    this.particles = createObservableArray();

    this.incomingProtons = createObservableArray();
    this.incomingNeutrons = createObservableArray();

    this.userControlledProtons = createObservableArray();
    this.userControlledNeutrons = createObservableArray();

    this.alphaParticleAnimations = createObservableArray();
    this.alphaParticleAnimations.addItemRemovedListener( animation => {
      animation && animation.stop();
      animation = null;
    } );

    this.doubleArrowButtonClickedBooleanProperty = new BooleanProperty( false );

    this.protonCountRange = new Range( 0, maximumProtonNumber );
    this.neutronCountRange = new Range( 0, maximumNeutronNumber );

    // the stability of the nuclide is determined by the given number of protons and neutrons
    this.isStableBooleanProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => AtomIdentifier.isStable( protonCount, neutronCount )
    );

    // if a nuclide with a given number of protons and neutrons exists
    this.doesNuclideExistBooleanProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => AtomIdentifier.doesExist( protonCount, neutronCount )
    );

    // reconfigure the nucleus when the massNumber changes
    this.particleAtom.massNumberProperty.link( () => this.particleAtom.reconfigureNucleus() );
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
    this.alphaParticleAnimations.clear();
  }

  /**
   * @param dt - time step, in seconds
   */
  public step( dt: number ): void {

    // Update particle positions
    this.particles.forEach( particle => {
      particle.step( dt );
    } );
  }
}

buildANucleus.register( 'BANModel', BANModel );
export default BANModel;
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
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';

// types
export type BANModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

class BANModel {

  public readonly protonCountProperty: NumberProperty;
  public readonly neutronCountProperty: NumberProperty;
  public isStableBooleanProperty: IReadOnlyProperty<boolean>;
  public readonly massNumberProperty: IReadOnlyProperty<number>;
  public readonly doesNuclideExistBooleanProperty: IReadOnlyProperty<boolean>;
  public nucleons: ObservableArray<Particle>;
  public particleAtom: ParticleAtom;

  constructor( maximumProtonNumber: number, maximumNeutronNumber: number, providedOptions?: BANModelOptions ) {

    const options = optionize<BANModelOptions, {}>()( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    console.log( options.tandem );

    // Create the atom that the user will build, modify, and generally play with.
    this.particleAtom = new ParticleAtom();
    
    // arrays of proton and neutron Particle's that exist but are not in the nucleus
    this.nucleons = createObservableArray();

    // the number of protons in the nucleus
    this.protonCountProperty = new NumberProperty( 0, {
      numberType: 'Integer',
      range: new Range( 0, maximumProtonNumber )
    } );

    // the number of neutrons in the nucleus
    this.neutronCountProperty = new NumberProperty( 0, {
      numberType: 'Integer',
      range: new Range( 0, maximumNeutronNumber )
    } );

    // the number of protons and neutrons
    this.massNumberProperty = new DerivedProperty( [ this.protonCountProperty, this.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => protonCount + neutronCount
    );

    // the stability of the nuclide with a given number of protons and neutrons
    this.isStableBooleanProperty = new DerivedProperty( [ this.protonCountProperty, this.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => AtomIdentifier.isStable( protonCount, neutronCount )
    );

    // if a nuclide with a given number of protons and neutrons exists
    this.doesNuclideExistBooleanProperty = new DerivedProperty( [ this.protonCountProperty, this.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => AtomIdentifier.doesExist( protonCount, neutronCount )
    );

    // TODO: Eventually change this to allow the nucleon count property's to change the particleAtom's nucleon count property's
    // update protonCountProperty and neutronCountProperty if the nucleons in the particleAtom change
    this.particleAtom.protonCountProperty.link( ( protonCount: number ) => {
      this.protonCountProperty.value = protonCount;
    } );

    this.particleAtom.neutronCountProperty.link( ( neutronCount: number ) => {
      this.neutronCountProperty.value = neutronCount;
    } );
  }

  /**
   * Add a Particle to the model
   */
  public addParticle( particle: Particle ): void {
    this.nucleons.push( particle );
  }

  /**
   * Remove a Particle from the model
   */
  public removeParticle( particle: Particle ): void {
    this.nucleons.remove( particle );
  }

  public reset(): void {
    this.protonCountProperty.reset();
    this.neutronCountProperty.reset();
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
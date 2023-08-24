// Copyright 2022-2023, University of Colorado Boulder

/**
 * Model class for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import BANModel from '../../common/model/BANModel.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import BANConstants from '../../common/BANConstants.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DecayType from '../../common/model/DecayType.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';

class DecayModel extends BANModel<ParticleAtom> {

  // the half-life number
  public halfLifeNumberProperty: TReadOnlyProperty<number>;

  // REVIEW: Some docs about this field would be helpful.
  public decayEnabledPropertyMap: Map<DecayType, TReadOnlyProperty<boolean>>;

  public constructor() {

    const particleAtom = new ParticleAtom();

    // empirically determined, the last nuclide the Decay screen goes up to is Plutonium-240 (94 protons and 146 neutrons)
    super( BANConstants.DECAY_MAX_NUMBER_OF_PROTONS, BANConstants.DECAY_MAX_NUMBER_OF_NEUTRONS, particleAtom );

    this.halfLifeNumberProperty = new DerivedProperty( [
        this.particleAtom.protonCountProperty,
        this.particleAtom.neutronCountProperty,
        this.doesNuclideExistBooleanProperty,
        this.isStableBooleanProperty
      ], ( protonNumber, neutronNumber, doesNuclideExist, isStable ) => {

        let halfLife: number | null;

        if ( doesNuclideExist ) {
          if ( isStable ) {

            // the nuclide is stable, set the indicator to the maximum half-life number on the half-life number line
            halfLife = Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT );
          }
          else {

            // the nuclide is unstable, update its half-life
            halfLife = AtomIdentifier.getNuclideHalfLife( protonNumber, neutronNumber );
          }
        }
        else {
          // the nuclide does not exist
          halfLife = 0;
        }

        // Since this sim relies on two Properties (one for protons and one for neutrons), it is possible to have an
        // intermediate state where there is an unexpected "no half life". Be graceful in this case, knowing that
        // listeners are going to soon fire that will bring this nuclide back into an actual substance.
        if ( halfLife === null ) {
          return 0;
        }
        else {
          return halfLife;
        }
      }
    );

    // function which would return whether a given nuclide (defined by the number of protons and neutrons) has a certain
    // available decay type
    const createDecayEnabledListener = ( protonNumber: number, neutronNumber: number, decayType: DecayType,
                                         hasIncomingParticles: boolean ): boolean => {
      const decays = AtomIdentifier.getAvailableDecaysAndPercents( protonNumber, neutronNumber );

      return !hasIncomingParticles && !!decays.find( decay => Object.keys( decay ).includes( decayType.name ) );
    };

    const dependencies = [
      this.particleAtom.protonCountProperty,
      this.particleAtom.neutronCountProperty,
      this.hasIncomingParticlesProperty
    ] as const;

    this.decayEnabledPropertyMap = new Map();

    // create the decay enabled properties
    this.decayEnabledPropertyMap.set( DecayType.PROTON_EMISSION, new DerivedProperty( dependencies,
      ( protonNumber, neutronNumber, hasIncomingParticles ) =>
        createDecayEnabledListener( protonNumber, neutronNumber, DecayType.PROTON_EMISSION, hasIncomingParticles )
    ) );
    this.decayEnabledPropertyMap.set( DecayType.NEUTRON_EMISSION, new DerivedProperty( dependencies,
      ( protonNumber, neutronNumber, hasIncomingParticles ) =>
        createDecayEnabledListener( protonNumber, neutronNumber, DecayType.NEUTRON_EMISSION, hasIncomingParticles )
    ) );
    this.decayEnabledPropertyMap.set( DecayType.BETA_MINUS_DECAY, new DerivedProperty( dependencies,
      ( protonNumber, neutronNumber, hasIncomingParticles ) =>
        createDecayEnabledListener( protonNumber, neutronNumber, DecayType.BETA_MINUS_DECAY, hasIncomingParticles )
    ) );
    this.decayEnabledPropertyMap.set( DecayType.BETA_PLUS_DECAY, new DerivedProperty( dependencies,
      ( protonNumber, neutronNumber, hasIncomingParticles ) =>
        createDecayEnabledListener( protonNumber, neutronNumber, DecayType.BETA_PLUS_DECAY, hasIncomingParticles )
    ) );
    this.decayEnabledPropertyMap.set( DecayType.ALPHA_DECAY, new DerivedProperty( dependencies,
      ( protonNumber, neutronNumber, hasIncomingParticles ) =>
        createDecayEnabledListener( protonNumber, neutronNumber, DecayType.ALPHA_DECAY, hasIncomingParticles )
    ) );
  }

  public override reset(): void {
    super.reset();
  }

  /**
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    super.step( dt );
  }
}

buildANucleus.register( 'DecayModel', DecayModel );
export default DecayModel;
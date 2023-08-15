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

  // the decay enabled properties for all five decays
  public protonEmissionEnabledProperty: TReadOnlyProperty<boolean>;
  public neutronEmissionEnabledProperty: TReadOnlyProperty<boolean>;
  public betaMinusDecayEnabledProperty: TReadOnlyProperty<boolean>;
  public betaPlusDecayEnabledProperty: TReadOnlyProperty<boolean>;
  public alphaDecayEnabledProperty: TReadOnlyProperty<boolean>;

  public constructor() {

    const particleAtom = new ParticleAtom();

    // empirically determined, the last nuclide the Decay screen goes up to is Uranium-238 (92 protons and 146 neutrons)
    super( BANConstants.DECAY_MAX_NUMBER_OF_PROTONS, BANConstants.DECAY_MAX_NUMBER_OF_NEUTRONS, particleAtom );

    this.halfLifeNumberProperty = new DerivedProperty(
      [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty, this.doesNuclideExistBooleanProperty, this.isStableBooleanProperty ],
      ( protonNumber: number, neutronNumber: number, doesNuclideExist: boolean, isStable: boolean ) => {

        let halfLife: number | undefined | null;

        // a nuclide of 0 protons and 0 neutrons does not exist
        if ( doesNuclideExist && !( protonNumber === 0 && neutronNumber === 0 ) ) {

          // the nuclide is stable, set the indicator to the maximum half-life number on the half-life number line
          if ( isStable ) {
            halfLife = Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT );
          }

          // the nuclide is unstable and its half-life data is missing, set -1 as the half-life as a placeholder
          else if ( AtomIdentifier.getNuclideHalfLife( protonNumber, neutronNumber ) === null ) {
            halfLife = -1;
          }

          // the nuclide is unstable and its half-life data is not missing, update its half-life
          else {
            halfLife = AtomIdentifier.getNuclideHalfLife( protonNumber, neutronNumber );
          }
        }

        // the nuclide does not exist
        else {
          halfLife = 0;
        }

        // Since this sim relies on two Properties (one for protons and one for neutrons), it is possible to have an
        // intermediate state where there is an unexpected "no half life". Be graceful in this case, knowing that
        // listeners are going to soon fire that will bring this nuclide back into an actual substance.
        if ( halfLife === undefined || halfLife === null ) {
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

      // TODO: remove with https://github.com/phetsims/build-a-nucleus/issues/42
      // Disallow having more protons that Uranium. Though this is not scientifically accurate, it keeps the model in
      // the confines of 92 protons. See https://github.com/phetsims/build-a-nucleus/issues/42
      // if ( protonNumber === 92 && neutronNumber === 145 && decayType === DecayType.BETA_MINUS_DECAY ) {
      //   return false;
      // }

      return !hasIncomingParticles && !!decays.find( decay => Object.keys( decay ).includes( decayType.name ) );
    };

    const dependencies = [
      this.particleAtom.protonCountProperty,
      this.particleAtom.neutronCountProperty,
      this.hasIncomingParticlesProperty
    ] as const;

    // create the decay enabled properties
    this.protonEmissionEnabledProperty = new DerivedProperty( dependencies,
      ( protonNumber, neutronNumber, hasIncomingParticles ) =>
        createDecayEnabledListener( protonNumber, neutronNumber, DecayType.PROTON_EMISSION, hasIncomingParticles )
    );
    this.neutronEmissionEnabledProperty = new DerivedProperty( dependencies,
      ( protonNumber, neutronNumber, hasIncomingParticles ) =>
        createDecayEnabledListener( protonNumber, neutronNumber, DecayType.NEUTRON_EMISSION, hasIncomingParticles )
    );
    this.betaMinusDecayEnabledProperty = new DerivedProperty( dependencies,
      ( protonNumber, neutronNumber, hasIncomingParticles ) =>
        createDecayEnabledListener( protonNumber, neutronNumber, DecayType.BETA_MINUS_DECAY, hasIncomingParticles )
    );
    this.betaPlusDecayEnabledProperty = new DerivedProperty( dependencies,
      ( protonNumber, neutronNumber, hasIncomingParticles ) =>
        createDecayEnabledListener( protonNumber, neutronNumber, DecayType.BETA_PLUS_DECAY, hasIncomingParticles )
    );
    this.alphaDecayEnabledProperty = new DerivedProperty( dependencies,
      ( protonNumber, neutronNumber, hasIncomingParticles ) =>
        createDecayEnabledListener( protonNumber, neutronNumber, DecayType.ALPHA_DECAY, hasIncomingParticles )
    );
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
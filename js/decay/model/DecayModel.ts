// Copyright 2022-2025, University of Colorado Boulder

/**
 * Model class for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import BANModel from '../../common/model/BANModel.js';
import DecayType from '../../common/model/DecayType.js';

class DecayModel extends BANModel<ParticleAtom> {

  // The half-life number.
  public halfLifeNumberProperty: TReadOnlyProperty<number>;

  // A data structure for all the enabledProperties for the "decay buttons". These enabledProperties toggle to enabled
  // when the Nuclide supports that given decay type.
  public decayEnabledPropertyMap: Map<DecayType, TReadOnlyProperty<boolean>>;

  public constructor() {

    const particleAtom = new ParticleAtom( {
      tandem: Tandem.OPT_OUT // Opt out for now until phet-io is implemented.
    } );

    // Empirically determined, the last nuclide the Decay screen goes up to is Plutonium-240 (94 protons and 146 neutrons).
    super( BANConstants.DECAY_MAX_NUMBER_OF_PROTONS, BANConstants.DECAY_MAX_NUMBER_OF_NEUTRONS, particleAtom );

    this.halfLifeNumberProperty = new DerivedProperty( [
        this.particleAtom.protonCountProperty,
        this.particleAtom.neutronCountProperty,
        this.nuclideExistsProperty,
        this.isStableProperty
      ], ( protonNumber, neutronNumber, doesNuclideExist, isStable ) => {

        let halfLife: number | null;

        if ( doesNuclideExist ) {
          if ( isStable ) {

            // The nuclide is stable, set the indicator to the maximum half-life number on the half-life number line.
            halfLife = Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT );
          }
          else {

            // The nuclide is unstable, update its half-life.
            halfLife = AtomIdentifier.getNuclideHalfLife( protonNumber, neutronNumber );
          }
        }
        else {
          // The nuclide does not exist.
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

    // Function which would return whether a given nuclide (defined by the number of protons and neutrons) has a certain
    // available decay type.
    const createDecayEnabledListener = ( protonNumber: number, neutronNumber: number, decayType: DecayType,
                                         hasIncomingParticles: boolean ): boolean => {
      const decays = AtomIdentifier.getAvailableDecaysAndPercents( protonNumber, neutronNumber );

      return !hasIncomingParticles && !!decays.find( decay => decay[ 0 ] === decayType.name );
    };

    const dependencies = [
      this.particleAtom.protonCountProperty,
      this.particleAtom.neutronCountProperty,
      this.hasIncomingParticlesProperty
    ] as const;

    this.decayEnabledPropertyMap = new Map();

    // Create the decay enabled properties.
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
// Copyright 2022, University of Colorado Boulder

/**
 * Model class for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANModel, { BANModelOptions } from '../../common/model/BANModel.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import BANConstants from '../../common/BANConstants.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DecayType from '../view/DecayType.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import IProperty from '../../../../axon/js/IProperty.js';

// types
export type DecayModelOptions = BANModelOptions;

class DecayModel extends BANModel {

  public halfLifeNumberProperty: IReadOnlyProperty<number>;
  public protonEmissionEnabledProperty: IProperty<boolean>;
  public neutronEmissionEnabledProperty: IProperty<boolean>;
  public betaMinusDecayEnabledProperty: IProperty<boolean>;
  public betaPlusDecayEnabledProperty: IProperty<boolean>;
  public alphaDecayEnabledProperty: IProperty<boolean>;

  constructor( providedOptions?: DecayModelOptions ) {

    const options = optionize<DecayModelOptions, {}, BANModelOptions>()( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // empirically determined, the last nuclide the Decay screen goes up to is Uranium-238 (92 protons and 146 neutrons)
    super( BANConstants.MAX_NUMBER_OF_PROTONS, BANConstants.MAX_NUMBER_OF_NEUTRONS, options );

    // the half-life number
    this.halfLifeNumberProperty = new DerivedProperty(
      [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty, this.doesNuclideExistBooleanProperty, this.isStableBooleanProperty ],
      ( protonCount: number, neutronCount: number, doesNuclideExist: boolean, isStable: boolean ) => {

        let halfLife;
        // the nuclide exists
        if ( doesNuclideExist ) {

          // the nuclide is stable, set the indicator to the maximum half-life number on the half-life number line
          if ( isStable ) {
            halfLife = Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT );
          }

          // the nuclide is unstable and its half-life data is missing, set -1 as the half-life as a placeholder
          else if ( AtomIdentifier.getNuclideHalfLife( protonCount, neutronCount ) === null ) {
            halfLife = -1;
          }

          // the nuclide is unstable and its half-life data is not missing, update its half-life
          else {
            halfLife = AtomIdentifier.getNuclideHalfLife( protonCount, neutronCount )!;
          }
        }

        // the nuclide does not exist
        else {
          halfLife = 0;
        }

        // TODO: is this alright that the halfLife is not correct yet?
        // one of the boolean properties (doesNuclideExist or isStable) is not updated yet but it will be updated soon
        if ( halfLife === undefined ) {
          return 0;
        }
        else {
          return halfLife;
        }
      }
    );

    // function which would return whether a given nuclide (defined by the number of protons and neutrons) has a certain
    // available decay type
    const createDecayEnabledListener = ( protonCount: number, neutronCount: number, decayType: DecayType ): boolean => {
      const decays = AtomIdentifier.getAvailableDecays( protonCount, neutronCount );
      return decays.includes( decayType.name );
    };

    // create the decay enabled properties for all five decays possible
    this.protonEmissionEnabledProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) =>
        createDecayEnabledListener( protonCount, neutronCount, DecayType.PROTON_EMISSION )
    );
    this.neutronEmissionEnabledProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) =>
        createDecayEnabledListener( protonCount, neutronCount, DecayType.NEUTRON_EMISSION )
    );
    this.betaMinusDecayEnabledProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) =>
        createDecayEnabledListener( protonCount, neutronCount, DecayType.BETA_MINUS_DECAY )
    );
    this.betaPlusDecayEnabledProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) =>
        createDecayEnabledListener( protonCount, neutronCount, DecayType.BETA_PLUS_DECAY )
    );
    this.alphaDecayEnabledProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) =>
        createDecayEnabledListener( protonCount, neutronCount, DecayType.ALPHA_DECAY )
    );
  }

  public override reset(): void {
    super.reset();
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public override step( dt: number ): void {
    super.step( dt );
  }
}

buildANucleus.register( 'DecayModel', DecayModel );
export default DecayModel;
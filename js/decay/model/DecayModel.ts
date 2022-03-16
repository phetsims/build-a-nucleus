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

// types
export type DecayModelOptions = BANModelOptions;

class DecayModel extends BANModel {

  public halfLifeNumberProperty: DerivedProperty<number,
    [ protonCount: number, neutronCount: number, doesNuclideExist: boolean, isStable: boolean ]>;

  constructor( providedOptions?: DecayModelOptions ) {

    const options = optionize<DecayModelOptions, {}, BANModelOptions>( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // empirically determined, the last nuclide the Decay screen goes up to is Uranium-238 (92 protons and 146 neutrons)
    super( 92, 146, options );

    // the half-life number
    this.halfLifeNumberProperty = new DerivedProperty(
      [ this.protonCountProperty, this.neutronCountProperty, this.doesNuclideExistBooleanProperty, this.isStableBooleanProperty ],
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

      } );
  }

  public reset(): void {
    super.reset();
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public step( dt: number ): void {
    //TODO
  }
}

buildANucleus.register( 'DecayModel', DecayModel );
export default DecayModel;
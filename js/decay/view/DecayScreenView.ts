// Copyright 2022, University of Colorado Boulder

/**
 * ScreenView for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import DecayModel from '../model/DecayModel.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BuildANucleusScreenView from '../../common/view/BuildANucleusScreenView.js';

// types
type DecayScreenViewSelfOptions = {};
export type DecayScreenViewOptions = DecayScreenViewSelfOptions & PhetioObjectOptions & Required<Pick<PhetioObjectOptions, 'tandem'>>;

class DecayScreenView extends BuildANucleusScreenView {

  constructor( model: DecayModel, providedOptions?: DecayScreenViewOptions ) {

    const options = optionize<DecayScreenViewOptions, DecayScreenViewSelfOptions, PhetioObjectOptions>( {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( model, options );
  }

  public reset(): void {
    //TODO
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public step( dt: number ): void {
    //TODO
  }
}

buildANucleus.register( 'DecayScreenView', DecayScreenView );
export default DecayScreenView;
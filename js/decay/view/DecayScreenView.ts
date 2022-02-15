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
import BANScreenView from '../../common/view/BANScreenView.js';
import HalfLifeInformationNode from './HalfLifeInformationNode.js';
import BANConstants from '../../common/BANConstants.js';

// types
type DecayScreenViewSelfOptions = {};
export type DecayScreenViewOptions =
  DecayScreenViewSelfOptions
  & PhetioObjectOptions
  & Required<Pick<PhetioObjectOptions, 'tandem'>>;

class DecayScreenView extends BANScreenView {

  constructor( model: DecayModel, providedOptions?: DecayScreenViewOptions ) {

    const options = optionize<DecayScreenViewOptions, DecayScreenViewSelfOptions, PhetioObjectOptions>( {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( model, options );

    // create and add the half-life information node at the top half of the decay screen
    const halfLifeInformationNode = new HalfLifeInformationNode( model.halfLifeNumberProperty );
    halfLifeInformationNode.left = this.layoutBounds.minX + 60;
    halfLifeInformationNode.y = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN + 80;
    this.addChild( halfLifeInformationNode );
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
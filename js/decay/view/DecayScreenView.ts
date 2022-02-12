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
import HalfLifeNumberLineNode from './HalfLifeNumberLineNode.js';
import BuildANucleusConstants from '../../common/BuildANucleusConstants.js';

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

    const halfLifeNumberLineNode = new HalfLifeNumberLineNode( -18, 18, 450 );
    halfLifeNumberLineNode.left = this.layoutBounds.minX + 60;
    halfLifeNumberLineNode.y = this.layoutBounds.minY + BuildANucleusConstants.SCREEN_VIEW_Y_MARGIN + 70;
    this.addChild( halfLifeNumberLineNode );
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
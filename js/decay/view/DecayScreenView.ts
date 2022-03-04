// Copyright 2022, University of Colorado Boulder

/**
 * ScreenView for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import DecayModel from '../model/DecayModel.js';
import { PhetioObjectOptions, RequiredTandem } from '../../../../tandem/js/PhetioObject.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANScreenView from '../../common/view/BANScreenView.js';
import HalfLifeInformationNode from './HalfLifeInformationNode.js';
import BANConstants from '../../common/BANConstants.js';
import AvailableDecaysPanel from './AvailableDecaysPanel.js';
import SymbolNode from '../../../../shred/js/view/SymbolNode.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import { Text } from '../../../../scenery/js/imports.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import BANColors from '../../common/BANColors.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';

// constants
const LABEL_FONT = new PhetFont( 24 );

// types
type DecayScreenViewSelfOptions = {};
export type DecayScreenViewOptions =
  DecayScreenViewSelfOptions
  & PhetioObjectOptions
  & RequiredTandem;

class DecayScreenView extends BANScreenView {

  constructor( model: DecayModel, providedOptions?: DecayScreenViewOptions ) {

    const options = optionize<DecayScreenViewOptions, DecayScreenViewSelfOptions, PhetioObjectOptions>( {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( model, options );

    // create and add the half-life information node at the top half of the decay screen
    const halfLifeInformationNode = new HalfLifeInformationNode( model.halfLifeNumberProperty, model.isStableBooleanProperty );
    halfLifeInformationNode.left = this.layoutBounds.minX + BANConstants.SCREEN_VIEW_X_MARGIN + 30;
    halfLifeInformationNode.y = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN + 80;
    this.addChild( halfLifeInformationNode );

    // create and add the available decays panel at the center right of the decay screen
    const availableDecaysPanel = new AvailableDecaysPanel();
    availableDecaysPanel.right = this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN;
    availableDecaysPanel.bottom = this.resetAllButton.top - 20;
    this.addChild( availableDecaysPanel );

    // create and add the symbol node in an accordion box
    const symbolNode = new SymbolNode( model.protonCountProperty, model.massNumberProperty, {
      scale: 0.3
    } );
    const symbolAccordionBox = new AccordionBox( symbolNode, {
      titleNode: new Text( buildANucleusStrings.symbol, {
        font: LABEL_FONT,
        maxWidth: ShredConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
      } ),
      fill: BANColors.panelBackgroundColorProperty,
      minWidth: 50,
      contentAlign: 'center',
      contentXMargin: 30,
      titleAlignX: 'left',
      expandedProperty: new BooleanProperty( true )
    } );
    symbolAccordionBox.right = availableDecaysPanel.right;
    symbolAccordionBox.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( symbolAccordionBox );

    this.nucleonCountPanel.left = availableDecaysPanel.left;
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
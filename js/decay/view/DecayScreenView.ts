// Copyright 2022, University of Colorado Boulder

/**
 * ScreenView for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import DecayModel from '../model/DecayModel.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANScreenView, { BANScreenViewOptions } from '../../common/view/BANScreenView.js';
import HalfLifeInformationNode from './HalfLifeInformationNode.js';
import BANConstants from '../../common/BANConstants.js';
import AvailableDecaysPanel from './AvailableDecaysPanel.js';
import SymbolNode from '../../../../shred/js/view/SymbolNode.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import { Color, Text } from '../../../../scenery/js/imports.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import BANColors from '../../common/BANColors.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Property from '../../../../axon/js/Property.js';

// constants
const LABEL_FONT = new PhetFont( 24 );
const STABILITY_AND_ELEMENT_NAME_FONT = new PhetFont( 20 );

// types
export type DecayScreenViewOptions = BANScreenViewOptions;

class DecayScreenView extends BANScreenView {

  constructor( model: DecayModel, providedOptions?: DecayScreenViewOptions ) {

    const options = optionize<DecayScreenViewOptions, {}, BANScreenViewOptions>( {
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
      buttonXMargin: 8,
      buttonYMargin: 8,
      titleAlignX: 'left',
      expandedProperty: new BooleanProperty( true )
    } );
    symbolAccordionBox.right = availableDecaysPanel.right;
    symbolAccordionBox.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( symbolAccordionBox );

    // create and add stability indicator
    const stabilityIndicator = new Text( '', {
      font: STABILITY_AND_ELEMENT_NAME_FONT,
      fill: 'black',
      center: new Vector2( halfLifeInformationNode.centerX, availableDecaysPanel.top ),
      visible: true
      // TODO: maxWidth
    } );
    this.addChild( stabilityIndicator );

    // Define the update function for the stability indicator.
    const updateStabilityIndicator = ( protonCount: number, neutronCount: number ) => {
      if ( protonCount > 0 ) {
        if ( AtomIdentifier.isStable( protonCount, neutronCount ) ) {
          stabilityIndicator.text = buildANucleusStrings.stable;
        }
        else {
          stabilityIndicator.text = buildANucleusStrings.unstable;
        }
      }
      else {
        stabilityIndicator.text = '';
      }
      stabilityIndicator.center = new Vector2( halfLifeInformationNode.centerX, availableDecaysPanel.top );
    };

    // Add the listeners that control the label content
    Property.multilink( [ model.protonCountProperty, model.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => updateStabilityIndicator( protonCount, neutronCount )
     );
    const updateStabilityIndicatorVisibility = ( visible: boolean ) => {
      stabilityIndicator.visible = visible;
    };
    model.doesNuclideExistBooleanProperty.link( updateStabilityIndicatorVisibility );

    // Create the textual readout for the element name.
    const elementName = new Text( '', {
      font: STABILITY_AND_ELEMENT_NAME_FONT,
      fill: Color.RED,
      center: stabilityIndicator.center.plusXY( 0, 60 )
    } );
    this.addChild( elementName );

    // Define the update function for the element name.
    const updateElementName = ( protonCount: number, doesNuclideExist: boolean, massNumber: number ) => {
      let name = AtomIdentifier.getName( protonCount );

      // show "Does not form" in the elementName's place when a nuclide that does not exist on Earth is built
      if ( !doesNuclideExist && massNumber !== 0 ) {
        name = buildANucleusStrings.doesNotForm;
      }
      else if ( name.length === 0 ) {
        name = '';
      }
      else {
        name += ' - ' + massNumber.toString();
      }
      elementName.text = name;
      elementName.center = stabilityIndicator.center.plusXY( 0, 60 );
    };

    // Hook up update listeners.
    Property.multilink( [ model.protonCountProperty, model.doesNuclideExistBooleanProperty, model.massNumberProperty ],
    ( protonCount: number, doesNuclideExist: boolean, massNumber: number ) =>
      updateElementName( protonCount, doesNuclideExist, massNumber )
    );

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
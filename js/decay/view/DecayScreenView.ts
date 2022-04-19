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
import { Color, RadialGradient, Text } from '../../../../scenery/js/imports.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import BANColors from '../../common/BANColors.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Property from '../../../../axon/js/Property.js';
import HalfLifeInfoDialog from './HalfLifeInfoDialog.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';

// constants

const LABEL_FONT = new PhetFont( 24 );
const STABILITY_AND_ELEMENT_NAME_FONT = new PhetFont( 20 );

// types
export type DecayScreenViewOptions = BANScreenViewOptions;

class DecayScreenView extends BANScreenView {

  constructor( model: DecayModel, providedOptions?: DecayScreenViewOptions ) {

    const options = optionize<DecayScreenViewOptions, {}, BANScreenViewOptions>()( {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( model, options );

    // create and add the half-life information node at the top half of the decay screen
    const halfLifeInformationNode = new HalfLifeInformationNode( model.halfLifeNumberProperty, model.isStableBooleanProperty );
    halfLifeInformationNode.left = this.layoutBounds.minX + BANConstants.SCREEN_VIEW_X_MARGIN + 30;
    halfLifeInformationNode.y = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN + 80;
    this.addChild( halfLifeInformationNode );

    // use this constant since everything else is positioned off of the halfLifeInformationNode and the centerX changes
    // as the halfLifeArrow in the halfLifeInformationNode moves
    const halfLifeInformationNodeCenterX = halfLifeInformationNode.centerX;

    // create and add the available decays panel at the center right of the decay screen
    const availableDecaysPanel = new AvailableDecaysPanel( model );
    availableDecaysPanel.right = this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN;
    availableDecaysPanel.bottom = this.resetAllButton.top - 20;
    this.addChild( availableDecaysPanel );

    // create and add the HalfLifeInfoDialog
    const halfLifeInfoDialog = new HalfLifeInfoDialog( model.halfLifeNumberProperty, model.isStableBooleanProperty );

    // create and add the info button
    const infoButton = new InfoButton( {
      listener: () => halfLifeInfoDialog.show(),
      baseColor: BANColors.infoButtonColorProperty,
      maxHeight: 45,
      top: this.nucleonCountPanel.top,
      right: halfLifeInformationNode.right
    } );
    this.addChild( infoButton );

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
      center: new Vector2( halfLifeInformationNodeCenterX, availableDecaysPanel.top ),
      visible: true,
      maxWidth: 225
    } );
    this.addChild( stabilityIndicator );

    // Define the update function for the stability indicator.
    const updateStabilityIndicator = ( protonCount: number, neutronCount: number ) => {
      if ( protonCount > 0 ) {
        if ( AtomIdentifier.isStable( protonCount, neutronCount ) ) {
          stabilityIndicator.text = buildANucleusStrings.stableDoesNotDecay;
        }
        else {
          stabilityIndicator.text = buildANucleusStrings.unstable;
        }
      }
      else {
        stabilityIndicator.text = '';
      }
      stabilityIndicator.center = new Vector2( halfLifeInformationNodeCenterX, availableDecaysPanel.top );
    };

    // Add the listeners that control the label content
    Property.multilink( [ model.protonCountProperty, model.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => updateStabilityIndicator( protonCount, neutronCount )
     );
    const updateStabilityIndicatorVisibility = ( visible: boolean ) => {
      stabilityIndicator.visible = visible;
    };
    model.doesNuclideExistBooleanProperty.link( updateStabilityIndicatorVisibility );

    // function that updates the size of the electron cloud based on the massNumber
    const updateCloudSize = ( massNumber: number ) => {

      // the radius in femtometres (fm), based on the equation on the radius of the nucleus:
      // r = 1.2 fm * A^(1/3), where A is the mass number
      const realRadiusNumber = 1.2 * Math.pow( massNumber, 1 / 3 );

      if ( realRadiusNumber === 0 ) {
        this.electronCloud.radius = 1E-5; // arbitrary non-zero value
        this.electronCloud.fill = 'transparent';
      }
      else {
        const radius = BANScreenView.MIN_NUCLEON_CLOUD_RADIUS +
                       (
                         ( BANScreenView.MAX_NUCLEON_CLOUD_RADIUS - BANScreenView.MIN_NUCLEON_CLOUD_RADIUS ) /
                         ( 1.2 * Math.pow( BANConstants.MAX_NUMBER_OF_PROTONS + BANConstants.MAX_NUMBER_OF_NEUTRONS, 1 / 3 ) ) // max realRadiusNumber
                       )
                       * realRadiusNumber;
        this.electronCloud.radius = radius;
        this.electronCloud.fill = new RadialGradient( 0, 0, 0, 0, 0, radius )
          .addColorStop( 0, 'rgba( 116, 208, 246, 200 )' )
          .addColorStop( 0.9, 'rgba( 116, 208, 246, 0 )' );
      }
    };

    // update the cloud size as the massNumber changes
    model.massNumberProperty.link( updateCloudSize );

    // Create the textual readout for the element name.
    const elementName = new Text( '', {
      font: STABILITY_AND_ELEMENT_NAME_FONT,
      fill: Color.RED,
      center: stabilityIndicator.center.plusXY( 0, 60 ),
      maxWidth: 325
    } );
    this.addChild( elementName );

    // Define the update function for the element name.
    const updateElementName = ( protonCount: number, doesNuclideExist: boolean, massNumber: number ) => {
      let name = AtomIdentifier.getName( protonCount );

      // show "{name} - {massNumber} does not form" in the elementName's place when a nuclide that does not exist on Earth is built
      if ( !doesNuclideExist && massNumber !== 0 ) {
        name += ' - ' + massNumber.toString() + ' ' + buildANucleusStrings.doesNotForm;
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

  public override reset(): void {
    //TODO
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public override step( dt: number ): void {
    //TODO
  }
}

buildANucleus.register( 'DecayScreenView', DecayScreenView );
export default DecayScreenView;
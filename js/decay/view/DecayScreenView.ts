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
import { Circle, Color, RadialGradient, Text } from '../../../../scenery/js/imports.js';
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

// empirically determined, from the ElectronCloudView radius
const MIN_NUCLEON_CLOUD_RADIUS = 42.5;
const MAX_NUCLEON_CLOUD_RADIUS = 130;

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
      center: new Vector2( halfLifeInformationNode.centerX, availableDecaysPanel.top ),
      visible: true,
      maxWidth: 125 // empirically determined, from the stabilityIndicator in AtomNode
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

    // create and add the nucleon cloud
    const nucleonCloud = new Circle( {
      radius: MIN_NUCLEON_CLOUD_RADIUS,
      fill: new RadialGradient( 0, 0, 0, 0, 0, MIN_NUCLEON_CLOUD_RADIUS )
        .addColorStop( 0.2, 'rgba( 116, 208, 246, 0 )' )
        .addColorStop( 1, 'rgba( 116, 208, 246, 200 )' )
    } );
    nucleonCloud.centerX = stabilityIndicator.centerX;
    nucleonCloud.top = 290; // empirically determined
    this.addChild( nucleonCloud );

    // function that updates the size of the nucleon cloud based on the massNumber
    const update = ( massNumber: number ) => {

      // the radius in femtometres (fm), based on the equation on the radius of the nucleus:
      // r = 1.2 fm * A^(1/3), where A is the mass number
      const realRadiusNumber = 1.2 * Math.pow( massNumber, 1 / 3 );

      if ( realRadiusNumber === 0 ) {
        nucleonCloud.radius = 1E-5; // arbitrary non-zero value
        nucleonCloud.fill = 'transparent';
      }
      else {
        const radius = MIN_NUCLEON_CLOUD_RADIUS +
                       (
                         ( MAX_NUCLEON_CLOUD_RADIUS - MIN_NUCLEON_CLOUD_RADIUS ) /
                         ( 1.2 * Math.pow( BANConstants.MAX_NUMBER_OF_PROTONS + BANConstants.MAX_NUMBER_OF_NEUTRONS, 1 / 3 ) ) // max realRadiusNumber
                       )
                       * realRadiusNumber;
        nucleonCloud.radius = radius;
        nucleonCloud.fill = new RadialGradient( 0, 0, 0, 0, 0, radius )
          .addColorStop( 0.2, 'rgba( 116, 208, 246, 0 )' )
          .addColorStop( 1, 'rgba( 116, 208, 246, 200 )' );
        nucleonCloud.centerX = stabilityIndicator.centerX;
        nucleonCloud.top = 290; // empirically determined
      }
    };

    // update the cloud size as the massNumber changes
    model.massNumberProperty.link( update );

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
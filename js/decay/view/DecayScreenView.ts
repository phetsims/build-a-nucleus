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
import { Color, Node, RadialGradient, Text } from '../../../../scenery/js/imports.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import BANColors from '../../common/BANColors.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Property from '../../../../axon/js/Property.js';
import AtomNode from '../../../../shred/js/view/AtomNode.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ParticleType from './ParticleType.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import Checkbox from '../../../../sun/js/Checkbox.js';

// constants
const LABEL_FONT = new PhetFont( 24 );
const STABILITY_ELEMENT_AND_CHECKBOX_FONT = new PhetFont( 20 );
const NUCLEON_CAPTURE_RADIUS = 100;
const NUM_NUCLEON_LAYERS = 22; // This is based on max number of particles, may need adjustment if that changes.

// types
export type DecayScreenViewOptions = BANScreenViewOptions;

class DecayScreenView extends BANScreenView<DecayModel> {

  public static NUM_NUCLEON_LAYERS: number;
  private nucleonLayers: Node[];

  constructor( model: DecayModel, providedOptions?: DecayScreenViewOptions ) {

    const options = optionize<DecayScreenViewOptions, {}, BANScreenViewOptions>()( {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( model, options );

    this.model = model;

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

    // show the electron cloud by default
    const showElectronCloudBooleanProperty = new BooleanProperty( true );
    showElectronCloudBooleanProperty.link( showElectronCloud => { this.electronCloud.visible = showElectronCloud; } );

    // create and add the electronCloud checkbox
    const showElectronCloudCheckbox = new Checkbox(
      new Text( buildANucleusStrings.showElectronCloud, { font: STABILITY_ELEMENT_AND_CHECKBOX_FONT } ),
      showElectronCloudBooleanProperty
    );
    showElectronCloudCheckbox.left = availableDecaysPanel.left;
    showElectronCloudCheckbox.top = availableDecaysPanel.bottom + 25;
    this.addChild( showElectronCloudCheckbox );

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
      expandedProperty: new BooleanProperty( true ),
      stroke: BANConstants.PANEL_STROKE
    } );
    symbolAccordionBox.right = availableDecaysPanel.right;
    symbolAccordionBox.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( symbolAccordionBox );

    // create and add stability indicator
    const stabilityIndicator = new Text( '', {
      font: STABILITY_ELEMENT_AND_CHECKBOX_FONT,
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

    // TODO: correctly update the cloud size if we choose to have it represent an electron cloud
    // function that updates the size of the electron cloud based on the protonNumber since the nuclides created are neutral
    // meaning the number of electrons is the same as the number of protons
    const updateCloudSize = ( massNumber: number ) => {

      // the radius in femtometres (fm), based on the equation on the radius of the nucleus:
      // r = 1.2 fm * A^(1/3), where A is the mass number
      const realRadiusNumber = 1.2 * Math.pow( massNumber, 1 / 3 );

      if ( realRadiusNumber === 0 ) {
        this.electronCloud.radius = 1E-5; // arbitrary non-zero value
        this.electronCloud.fill = 'transparent';
      }
      else {
        const radius = BANScreenView.MIN_ELECTRON_CLOUD_RADIUS +
                       (
                         ( BANScreenView.MAX_ELECTRON_CLOUD_RADIUS - BANScreenView.MIN_ELECTRON_CLOUD_RADIUS ) /
                         ( 1.2 * Math.pow( BANConstants.MAX_NUMBER_OF_PROTONS + BANConstants.MAX_NUMBER_OF_NEUTRONS, 1 / 3 ) ) // max realRadiusNumber
                       )
                       * realRadiusNumber;
        this.electronCloud.radius = radius;
        this.electronCloud.fill = new RadialGradient( 0, 0, 0, 0, 0, radius )
          .addColorStop( 0, 'rgba( 0, 0, 255, 200 )' )
          .addColorStop( 0.9, 'rgba( 0, 0, 255, 0 )' );
      }
    };

    // update the cloud size as the massNumber changes
    model.massNumberProperty.link( updateCloudSize );

    // Create the textual readout for the element name.
    const elementName = new Text( '', {
      font: STABILITY_ELEMENT_AND_CHECKBOX_FONT,
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

    // create and add the AtomNode
    const atomNode = new AtomNode( model.particleAtom, this.modelViewTransform, {
      showCenterX: false,
      showElementNameProperty: new Property( false ),
      showNeutralOrIonProperty: new Property( false ),
      showStableOrUnstableProperty: new Property( false ),
      electronShellDepictionProperty: new Property( 'cloud' )
    } );
    atomNode.center = this.modelViewTransform.modelToViewPosition( model.particleAtom.positionProperty.value );
    this.addChild( atomNode );

    this.nucleonCountPanel.left = availableDecaysPanel.left;

    // Add the layers where the nucleons will exist.
    this.nucleonLayers = [];
    _.times( NUM_NUCLEON_LAYERS, () => {
      const nucleonLayer = new Node();
      this.nucleonLayers.push( nucleonLayer );
      this.particleViewLayerNode.addChild( nucleonLayer );
    } );
    this.nucleonLayers.reverse(); // Set up the nucleon layers so that layer 0 is in front.
  }

  // Add ParticleView to the correct nucleonLayer
  protected override addParticleView( particle: Particle, particleView: ParticleView ) {
    this.nucleonLayers[ particle.zLayerProperty.get() ].addChild( particleView );

    // Add a listener that adjusts a nucleon's z-order layering.
    particle.zLayerProperty.link( zLayer => {
      assert && assert(
        this.nucleonLayers.length > zLayer,
        'zLayer for nucleon exceeds number of layers, max number may need increasing.'
      );
      // Determine whether nucleon view is on the correct layer.
      let onCorrectLayer = false;
      this.nucleonLayers[ zLayer ].children.forEach( particleView => {
        // @ts-ignore TODO-TS: How do you assume sub-types of children?
        if ( particleView.particle === particle ) {
          onCorrectLayer = true;
        }
      } );

      if ( !onCorrectLayer ) {

        // Remove particle view from its current layer.
        let particleView = null;
        for ( let layerIndex = 0; layerIndex < this.nucleonLayers.length && particleView === null; layerIndex++ ) {
          for ( let childIndex = 0; childIndex < this.nucleonLayers[ layerIndex ].children.length; childIndex++ ) {
            // @ts-ignore TODO-TS: How do you assume sub-types of children?
            if ( this.nucleonLayers[ layerIndex ].children[ childIndex ].particle === particle ) {
              particleView = this.nucleonLayers[ layerIndex ].children[ childIndex ];
              this.nucleonLayers[ layerIndex ].removeChildAt( childIndex );
              break;
            }
          }
        }

        // Add the particle view to its new layer.
        assert && assert( particleView !== null, 'Particle view not found during relayering' );
        // @ts-ignore TODO-TS: How do you assume sub-types of children?
        this.nucleonLayers[ zLayer ].addChild( particleView );
      }
    } );
  }

  // Define a function that will decide where to put nucleons.
  protected override dragEndedListener( particle: Particle, atom: ParticleAtom ) {
    if ( particle.positionProperty.value.distance( atom.positionProperty.value ) < NUCLEON_CAPTURE_RADIUS ) {
      atom.addParticle( particle );
      // TODO: once arrows are working with the creator node, add line here to make the ParticleView's  not pickable
    }
    else {
      const particleView = this.findParticleView( particle );
      particleView.inputEnabled = false;

      // TODO: might need to add a check to see if particle is already on its way to the destination passed in
      // animate particle back to its stack
      if ( particle.type === ParticleType.PROTON.name.toLowerCase() ) {
        this.model.animateAndRemoveNucleon( particle, this.modelViewTransform.viewToModelPosition( this.protonsCreatorNode.center ) );
      }
      else if ( particle.type === ParticleType.NEUTRON.name.toLowerCase() ) {
        this.model.animateAndRemoveNucleon( particle, this.modelViewTransform.viewToModelPosition( this.neutronsCreatorNode.center ) );
      }
    }
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

// export for usage when creating shred Particles
DecayScreenView.NUM_NUCLEON_LAYERS = NUM_NUCLEON_LAYERS;

buildANucleus.register( 'DecayScreenView', DecayScreenView );
export default DecayScreenView;
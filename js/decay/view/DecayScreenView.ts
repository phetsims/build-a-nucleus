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
import { Circle, Color, Node, RadialGradient, Text } from '../../../../scenery/js/imports.js';
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
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';

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
  private readonly elementName: Text;
  private readonly stabilityIndicator: Text;

  constructor( model: DecayModel, providedOptions?: DecayScreenViewOptions ) {

    const options = optionize<DecayScreenViewOptions, {}, BANScreenViewOptions>()( {
      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( model, options );

    this.model = model;

    // create and add the half-life information node at the top half of the decay screen
    const halfLifeInformationNode = new HalfLifeInformationNode( model.halfLifeNumberProperty, model.isStableBooleanProperty,
      model.particleAtom.protonCountProperty, model.doesNuclideExistBooleanProperty, model.massNumberProperty );
    halfLifeInformationNode.left = this.layoutBounds.minX + BANConstants.SCREEN_VIEW_X_MARGIN + 30;
    halfLifeInformationNode.y = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN + 80;
    this.addChild( halfLifeInformationNode );

    // use this constant since everything else is positioned off of the halfLifeInformationNode and the centerX changes
    // as the halfLifeArrow in the halfLifeInformationNode moves
    const halfLifeInformationNodeCenterX = halfLifeInformationNode.centerX;

    // create and add the available decays panel at the center right of the decay screen
    const availableDecaysPanel = new AvailableDecaysPanel( model, this.modelViewTransform, this.visibleBoundsProperty,
      this.emitNucleon.bind( this ) );
    availableDecaysPanel.right = this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN;
    availableDecaysPanel.bottom = this.resetAllButton.top - 20;
    this.addChild( availableDecaysPanel );

    // show the electron cloud by default
    const showElectronCloudBooleanProperty = new BooleanProperty( true );
    showElectronCloudBooleanProperty.link( showElectronCloud => { this.electronCloud.visible = showElectronCloud; } );

    // create and add the electronCloud checkbox
    const showElectronCloudCheckbox = new Checkbox(
      new Text( buildANucleusStrings.electronCloud, { font: STABILITY_ELEMENT_AND_CHECKBOX_FONT } ),
      showElectronCloudBooleanProperty
    );
    showElectronCloudCheckbox.left = availableDecaysPanel.left;
    showElectronCloudCheckbox.top = availableDecaysPanel.bottom + 25;
    this.addChild( showElectronCloudCheckbox );

    // create and add the symbol node in an accordion box
    const symbolNode = new SymbolNode( model.particleAtom.protonCountProperty, model.massNumberProperty, {
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
    this.stabilityIndicator = new Text( '', {
      font: STABILITY_ELEMENT_AND_CHECKBOX_FONT,
      fill: 'black',
      visible: true,
      maxWidth: 225
    } );
    this.stabilityIndicator.center = new Vector2( halfLifeInformationNodeCenterX, availableDecaysPanel.top );
    this.addChild( this.stabilityIndicator );

    // Define the update function for the stability indicator.
    const updateStabilityIndicator = ( protonCount: number, neutronCount: number ) => {
      if ( protonCount > 0 ) {
        if ( AtomIdentifier.isStable( protonCount, neutronCount ) ) {
          this.stabilityIndicator.text = buildANucleusStrings.stableDoesNotDecay;
        }
        else {
          this.stabilityIndicator.text = buildANucleusStrings.unstable;
        }
      }
      else {
        this.stabilityIndicator.text = '';
      }
      this.stabilityIndicator.center = new Vector2( halfLifeInformationNodeCenterX, availableDecaysPanel.top );
    };

    // Add the listeners that control the label content
    Property.multilink( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => updateStabilityIndicator( protonCount, neutronCount )
    );
    const updateStabilityIndicatorVisibility = ( visible: boolean ) => {
      this.stabilityIndicator.visible = visible;
    };
    model.doesNuclideExistBooleanProperty.link( updateStabilityIndicatorVisibility );

    // function that updates the size of the electron cloud based on the protonNumber since the nuclides created are neutral
    // meaning the number of electrons is the same as the number of protons
    const updateCloudSize = ( protonCount: number ) => {
      if ( protonCount === 0 ) {
        this.electronCloud.radius = 1E-5; // arbitrary non-zero value
        this.electronCloud.fill = 'transparent';
      }
      else {
        const radius = this.modelViewTransform.modelToViewDeltaX( getElectronShellDiameter( protonCount ) / 2 );
        this.electronCloud.radius = radius * 2;
        this.electronCloud.fill = new RadialGradient( 0, 0, 0, 0, 0, radius * 2 )
          .addColorStop( 0, 'rgba( 0, 0, 255, 200 )' )
          .addColorStop( 0.9, 'rgba( 0, 0, 255, 0 )' );
      }
    };

    // update the cloud size as the massNumber changes
    model.particleAtom.protonCountProperty.link( updateCloudSize );

     // Maps a number of electrons to a diameter in screen coordinates for the electron shell.  This mapping function is
     // based on the real size relationships between the various atoms, but has some tweakable parameters to reduce the
     // range and scale to provide values that are usable for our needs on the canvas.
    const getElectronShellDiameter = ( numElectrons: number ) => {
      const maxElectrons = this.model.protonCountRange.max; // for uranium
      const atomicRadius = AtomIdentifier.getAtomicRadius( numElectrons );
      if ( atomicRadius ) {
        return reduceRadiusRange( atomicRadius, this.model.protonCountRange.min + 1, maxElectrons );
      }
      else {
        assert && assert( numElectrons <= maxElectrons, `Atom has more than supported number of electrons, ${numElectrons}` );
        return 0;
      }
    };

    // This method increases the value of the smaller radius values and decreases the value of the larger ones.
    // This effectively reduces the range of radii values used.
    // This is a very specialized function for the purposes of this class.
    const reduceRadiusRange = ( value: number, minShellRadius: number, maxShellRadius: number ) => {
      // The following two factors define the way in which an input value is increased or decreased.  These values
      // can be adjusted as needed to make the cloud size appear as desired.
      const minChangedRadius = 70;
      const maxChangedRadius = 95;

      const compressionFunction = new LinearFunction( minShellRadius, maxShellRadius, minChangedRadius, maxChangedRadius );
      return compressionFunction.evaluate( value );
    };

    // Create the textual readout for the element name.
    this.elementName = new Text( '', {
      font: STABILITY_ELEMENT_AND_CHECKBOX_FONT,
      fill: Color.RED,
      maxWidth: 325
    } );
    this.elementName.center = this.stabilityIndicator.center.plusXY( 0, 60 );
    this.addChild( this.elementName );

    // Hook up update listeners.
    Property.multilink( [ model.particleAtom.protonCountProperty, model.doesNuclideExistBooleanProperty, model.massNumberProperty ],
      ( protonCount: number, doesNuclideExist: boolean, massNumber: number ) =>
        DecayScreenView.updateElementName( this.elementName, protonCount, doesNuclideExist, massNumber,
          this.stabilityIndicator.center.plusXY( 0, 60 ) )
    );

    // create and add the dashed empty circle at the center
    const lineWidth = 1;
    const emptyAtomCircle = new Circle( {
      radius: ShredConstants.NUCLEON_RADIUS - lineWidth,
      stroke: Color.GRAY,
      lineDash: [ 2, 2 ],
      lineWidth: lineWidth
    } );
    emptyAtomCircle.center = this.modelViewTransform.modelToViewPosition( model.particleAtom.positionProperty.value );
    this.addChild( emptyAtomCircle );

    // only show the emptyAtomCircle if less than 2 particles are in the atom. We still want to shown it when there's
    // only one nucleon, and no electron cloud, to accommodate for when the first nucleon is being animated towards the
    // atomNode center. However, if the electronCloud is showing, then only show the emptyAtomCircle when there are zero
    // nucleons
    Property.multilink( [ this.model.particleAtom.protonCountProperty, this.model.particleAtom.neutronCountProperty,
      showElectronCloudBooleanProperty ], ( protonCount, neutronCount, showElectronCloud ) => {
      emptyAtomCircle.visible = showElectronCloud ? ( protonCount + neutronCount ) === 0 : ( protonCount + neutronCount ) <= 1;
    } );

    // create and add the AtomNode
    const atomNode = new AtomNode( model.particleAtom, this.modelViewTransform, {
      showCenterX: false,
      showElementNameProperty: new Property( false ),
      showNeutralOrIonProperty: new Property( false ),
      showStableOrUnstableProperty: new Property( false ),
      electronShellDepictionProperty: new Property( 'cloud' )
    } );
    atomNode.center = emptyAtomCircle.center;
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

    // add the particleViewLayerNode
    this.addChild( this.particleViewLayerNode );
  }

  // Define the update function for the element name.
  public static updateElementName( elementNameText: Text, protonCount: number, doesNuclideExist: boolean, massNumber: number, center: Vector2 ): void {
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
    elementNameText.text = name;
    elementNameText.center = center;
  }

  // Add ParticleView to the correct nucleonLayer
  protected override addParticleView( particle: Particle, particleView: ParticleView ): void {
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

  public emitNucleon( particleType: ParticleType, visibleModelBounds: Bounds2 ): void {
    const proton = this.model.particleAtom.extractParticle( particleType.name.toLowerCase() );

    const destinationBounds = visibleModelBounds.dilated( 300 );

    let randomVector = Vector2.ZERO;
    while ( visibleModelBounds.containsPoint( randomVector ) ) {
      randomVector = new Vector2( dotRandom.nextDoubleBetween( destinationBounds.minX, destinationBounds.maxX ),
        dotRandom.nextDoubleBetween( destinationBounds.minY, destinationBounds.maxY ) );
    }

    this.animateAndRemoveNucleon( proton, randomVector );
  }

  // Define a function that will decide where to put nucleons.
  protected override dragEndedListener( particle: Particle, atom: ParticleAtom ): void {
    if ( particle.positionProperty.value.distance( atom.positionProperty.value ) < NUCLEON_CAPTURE_RADIUS ) {
      atom.addParticle( particle );
    }

    // if removing the particle will create a nuclide that does not exist, re-add the particle to the atom
    else if ( ( this.model.particleAtom.protonCountProperty.value + this.model.particleAtom.neutronCountProperty.value ) > 0 &&
              !AtomIdentifier.doesExist( this.model.particleAtom.protonCountProperty.value, this.model.particleAtom.neutronCountProperty.value )
    ) {
        atom.addParticle( particle );
    }

    // only remove the particle if it will create a nuclide that exists
    else {

      // TODO: might need to add a check to see if particle is already on its way to the destination passed in
      // animate particle back to its stack
      if ( particle.type === ParticleType.PROTON.name.toLowerCase() ) {
        this.animateAndRemoveNucleon( particle, this.modelViewTransform.viewToModelPosition( this.protonsCreatorNode.center ) );
      }
      else if ( particle.type === ParticleType.NEUTRON.name.toLowerCase() ) {
        this.animateAndRemoveNucleon( particle, this.modelViewTransform.viewToModelPosition( this.neutronsCreatorNode.center ) );
      }
    }
  }

  public override reset(): void {
    //TODO
  }
}

// export for usage when creating shred Particles
DecayScreenView.NUM_NUCLEON_LAYERS = NUM_NUCLEON_LAYERS;

buildANucleus.register( 'DecayScreenView', DecayScreenView );
export default DecayScreenView;
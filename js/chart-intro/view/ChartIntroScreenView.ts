// Copyright 2022, University of Colorado Boulder

/**
 * ScreenView for the 'Nuclide Chart Intro' screen.
 *
 * @author Luisa Vargas
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import ChartIntroModel from '../model/ChartIntroModel.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import BANScreenView, { BANScreenViewOptions } from '../../common/view/BANScreenView.js';
import BANConstants from '../../common/BANConstants.js';
import { Circle, Color, Node, RadialGradient, Text } from '../../../../scenery/js/imports.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Property from '../../../../axon/js/Property.js';
import AtomNode from '../../../../shred/js/view/AtomNode.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ParticleType from '../../common/view/ParticleType.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PeriodicTableAndIsotopeSymbol from './PeriodicTableAndIsotopeSymbol.js';

// constants
const LABEL_FONT = new PhetFont( BANConstants.REGULAR_FONT_SIZE );
const NUCLEON_CAPTURE_RADIUS = 100;
const NUMBER_OF_NUCLEON_LAYERS = 22; // This is based on max number of particles, may need adjustment if that changes.

// types
export type NuclideChartIntroScreenViewOptions = BANScreenViewOptions;

class ChartIntroScreenView extends BANScreenView<ChartIntroModel> {

  public static NUMBER_OF_NUCLEON_LAYERS: number;

  private readonly atomNode: Node;

  // layers where nucleons exist
  private nucleonLayers: Node[];

  public constructor( model: ChartIntroModel, providedOptions?: NuclideChartIntroScreenViewOptions ) {

    const options = optionize<NuclideChartIntroScreenViewOptions, EmptySelfOptions, BANScreenViewOptions>()( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( model, options );

    this.model = model;

    // function that updates the size of the electron cloud based on the protonNumber since the nuclides created are neutral
    // meaning the number of electrons is the same as the number of protons
    const updateCloudSize = ( protonCount: number ) => {
      if ( protonCount === 0 ) {
        this.electronCloud.radius = 1E-5; // arbitrary non-zero value
        this.electronCloud.fill = 'transparent';
      }
      else {
        const radius = this.modelViewTransform.modelToViewDeltaX( getElectronShellDiameter( protonCount ) / 2 );
        this.electronCloud.radius = radius * 0.65;
        this.electronCloud.fill = new RadialGradient( 0, 0, 0, 0, 0, radius * 0.65 )
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
    const elementName = new Text( '', {
      font: LABEL_FONT,
      fill: Color.RED,
      maxWidth: BANConstants.ELEMENT_NAME_MAX_WIDTH
    } );
    elementName.centerX = this.doubleArrowButtons.centerX;
    elementName.top = this.nucleonCountPanel.top;
    this.addChild( elementName );

    // Hook up update listeners.
    Multilink.multilink( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty, model.doesNuclideExistBooleanProperty ],
      ( protonCount: number, neutronCount: number, doesNuclideExist: boolean ) =>
        ChartIntroScreenView.updateElementName( elementName, protonCount, neutronCount, doesNuclideExist,
          this.doubleArrowButtons.centerX )
    );

    // create and add the periodic table and symbol
    const periodicTableAndIsotopeSymbol = new PeriodicTableAndIsotopeSymbol( model.particleAtom );
    this.addChild( periodicTableAndIsotopeSymbol );
    periodicTableAndIsotopeSymbol.top = this.nucleonCountPanel.top;
    periodicTableAndIsotopeSymbol.right = this.resetAllButton.right;

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

    // only show the emptyAtomCircle when there are zero nucleons
    Multilink.multilink( [ this.model.particleAtom.protonCountProperty, this.model.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => {
      emptyAtomCircle.visible = ( protonCount + neutronCount ) === 0;
    } );

    // create and add the AtomNode
    this.atomNode = new AtomNode( model.particleAtom, this.modelViewTransform, {
      showCenterX: false,
      showElementNameProperty: new Property( false ),
      showNeutralOrIonProperty: new Property( false ),
      showStableOrUnstableProperty: new Property( false ),
      electronShellDepictionProperty: new Property( 'cloud' )
    } );
    this.atomNode.center = emptyAtomCircle.center;
    this.addChild( this.atomNode );

    this.nucleonCountPanel.left = this.layoutBounds.left + 20;

    // Add the nucleonLayers
    this.nucleonLayers = [];
    _.times( NUMBER_OF_NUCLEON_LAYERS, () => {
      const nucleonLayer = new Node();
      this.nucleonLayers.push( nucleonLayer );
      this.particleViewLayerNode.addChild( nucleonLayer );
    } );
    this.nucleonLayers.reverse(); // Set up the nucleon layers so that layer 0 is in front.

    // add the particleViewLayerNode
    this.addChild( this.particleViewLayerNode );
  }

  /**
   * Define the update function for the element name.
   */
  public static updateElementName( elementNameText: Text, protonCount: number, neutronCount: number, doesNuclideExist: boolean, centerX: number ): void {
    let name = AtomIdentifier.getName( protonCount );
    const massNumber = protonCount + neutronCount;

    // show "{name} - {massNumber} does not form" in the elementName's place when a nuclide that does not exist on Earth is built
    if ( !doesNuclideExist && massNumber !== 0 ) {

      // no protons
      if ( name.length === 0 ) {
        name += massNumber.toString() + ' ' + buildANucleusStrings.neutronsLowercase + ' ' + buildANucleusStrings.doesNotForm;
      }
      else {
        name += ' - ' + massNumber.toString() + ' ' + buildANucleusStrings.doesNotForm;
      }
    }

    // no protons
    else if ( name.length === 0 ) {

      // no neutrons
      if ( neutronCount === 0 ) {
        name = '';
      }

      // only one neutron
      else if ( neutronCount === 1 ) {
        name = neutronCount + ' ' + buildANucleusStrings.neutronLowercase;
      }

      // multiple neutrons
      else {
        name = StringUtils.fillIn( buildANucleusStrings.clusterOfNeutronsPattern, {
          neutronNumber: neutronCount
        } );
      }

    }
    else {
      name += ' - ' + massNumber.toString();
    }
    elementNameText.text = name;
    elementNameText.centerX = centerX;
  }

  /**
   * Add ParticleView to the correct nucleonLayer.
   */
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
      const nucleonLayersChildren = this.nucleonLayers[ zLayer ].getChildren() as ParticleView[];
      nucleonLayersChildren.forEach( particleView => {
        if ( particleView.particle === particle ) {
          onCorrectLayer = true;
        }
      } );

      if ( !onCorrectLayer ) {

        // Remove particle view from its current layer.
        let particleView = null;
        for ( let layerIndex = 0; layerIndex < this.nucleonLayers.length && particleView === null; layerIndex++ ) {
          for ( let childIndex = 0; childIndex < this.nucleonLayers[ layerIndex ].children.length; childIndex++ ) {
            const nucleonLayersChildren = this.nucleonLayers[ layerIndex ].getChildren() as ParticleView[];
            if ( nucleonLayersChildren[ childIndex ].particle === particle ) {
              particleView = nucleonLayersChildren[ childIndex ];
              this.nucleonLayers[ layerIndex ].removeChildAt( childIndex );
              break;
            }
          }
        }

        // Add the particle view to its new layer.
        assert && assert( particleView, 'Particle view not found during relayering' );
        this.nucleonLayers[ zLayer ].addChild( particleView! );
      }
    } );
  }

  /**
   * Define a function that will decide where to put nucleons.
   */
  protected override dragEndedListener( nucleon: Particle, atom: ParticleAtom ): void {
    const particleCreatorNodeCenter = nucleon.type === ParticleType.PROTON.name.toLowerCase() ?
                                      this.protonsCreatorNode.center : this.neutronsCreatorNode.center;

    if ( nucleon.positionProperty.value.distance( atom.positionProperty.value ) < NUCLEON_CAPTURE_RADIUS ||

         // if removing the nucleon will create a nuclide that does not exist, re-add the nucleon to the atom
         ( ( this.model.particleAtom.protonCountProperty.value + this.model.particleAtom.neutronCountProperty.value ) !== 0 &&
           !AtomIdentifier.doesExist( this.model.particleAtom.protonCountProperty.value, this.model.particleAtom.neutronCountProperty.value )
         )
    ) {
      atom.addParticle( nucleon );
    }

    // only animate the removal of a nucleon if it was dragged out of the creator node
    else if ( nucleon.positionProperty.value.distance( particleCreatorNodeCenter ) > 10 ) {
      this.animateAndRemoveParticle( nucleon, this.modelViewTransform.viewToModelPosition( particleCreatorNodeCenter ) );
    }
  }
}

// export for usage when creating shred Particles
ChartIntroScreenView.NUMBER_OF_NUCLEON_LAYERS = NUMBER_OF_NUCLEON_LAYERS;

buildANucleus.register( 'ChartIntroScreenView', ChartIntroScreenView );
export default ChartIntroScreenView;
// Copyright 2022-2023, University of Colorado Boulder

/**
 * ScreenView for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import DecayModel from '../model/DecayModel.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import BANScreenView, { BANScreenViewOptions } from '../../common/view/BANScreenView.js';
import HalfLifeInformationNode from './HalfLifeInformationNode.js';
import BANConstants from '../../common/BANConstants.js';
import AvailableDecaysPanel from './AvailableDecaysPanel.js';
import SymbolNode from '../../../../shred/js/view/SymbolNode.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import { Circle, Color, HBox, ManualConstraint, Node, RadialGradient, Text } from '../../../../scenery/js/imports.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import BANColors from '../../common/BANColors.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Property from '../../../../axon/js/Property.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ParticleType from '../../common/model/ParticleType.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Multilink from '../../../../axon/js/Multilink.js';
import ReturnButton from '../../../../scenery-phet/js/buttons/ReturnButton.js';

// constants
const NUCLEON_CAPTURE_RADIUS = 100;

// types
export type DecayScreenViewOptions = BANScreenViewOptions;

class DecayScreenView extends BANScreenView<DecayModel> {

  private readonly stabilityIndicator: Text;

  // the symbol node in an accordion box
  private readonly symbolAccordionBox: AccordionBox;

  // show or hide the electron cloud
  private readonly showElectronCloudBooleanProperty: Property<boolean>;

  public constructor( model: DecayModel, providedOptions?: DecayScreenViewOptions ) {

    const options = optionize<DecayScreenViewOptions, EmptySelfOptions, BANScreenViewOptions>()( {}, providedOptions );

    super( model, new Vector2( BANConstants.SCREEN_VIEW_ATOM_CENTER_X, BANConstants.SCREEN_VIEW_ATOM_CENTER_Y ), options );

    this.model = model;

    // create and add the half-life information node at the top half of the decay screen
    const halfLifeInformationNode = new HalfLifeInformationNode( model.halfLifeNumberProperty, model.isStableBooleanProperty,
      model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty, model.doesNuclideExistBooleanProperty );
    halfLifeInformationNode.left = this.layoutBounds.minX + BANConstants.SCREEN_VIEW_X_MARGIN + 30;
    halfLifeInformationNode.y = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN + 80;
    this.addChild( halfLifeInformationNode );

    // use this constant since everything else is positioned off of the halfLifeInformationNode and the centerX changes
    // as the halfLifeArrow in the halfLifeInformationNode moves
    const halfLifeInformationNodeCenterX = halfLifeInformationNode.centerX;

    // create and add the symbol node in an accordion box
    const symbolNode = new SymbolNode( model.particleAtom.protonCountProperty, model.particleAtom.massNumberProperty, {
      scale: 0.3
    } );
    this.symbolAccordionBox = new AccordionBox( symbolNode, {
      titleNode: new Text( BuildANucleusStrings.symbol, {
        font: BANConstants.REGULAR_FONT,
        maxWidth: 118
      } ),
      fill: BANColors.panelBackgroundColorProperty,
      minWidth: 50,
      contentAlign: 'center',
      contentXMargin: 35,
      contentYMargin: 16,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        sideLength: 18
      },
      titleAlignX: 'left',
      stroke: BANColors.panelStrokeColorProperty,
      cornerRadius: BANConstants.PANEL_CORNER_RADIUS
    } );
    this.symbolAccordionBox.right = this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN;
    this.symbolAccordionBox.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( this.symbolAccordionBox );


    // store the current nucleon counts
    let oldProtonCount: number;
    let oldNeutronCount: number;
    const storeNucleonCounts = () => {
      oldProtonCount = this.model.particleAtom.protonCountProperty.value;
      oldNeutronCount = this.model.particleAtom.neutronCountProperty.value;
    };

    // create the undo decay button
    const undoDecayButton = new ReturnButton( () => {
      undoDecayButton.visible = false;
      restorePreviousNucleonCount( ParticleType.PROTON, oldProtonCount );
      restorePreviousNucleonCount( ParticleType.NEUTRON, oldNeutronCount );
      this.model.outgoingParticles.forEach( particle => {
        this.model.removeParticle( particle );
      } );
      this.model.outgoingParticles.clear();
      this.model.particleAnimations.clear();
    }, {
      baseColor: Color.YELLOW.darkerColor( 0.95 )
    } );
    undoDecayButton.visible = false;
    this.addChild( undoDecayButton );

    // restore the particleAtom to have the nucleon counts before a decay occurred
    const restorePreviousNucleonCount = ( particleType: ParticleType, oldNucleonCount: number ) => {
      const newNucleonCount = particleType === ParticleType.PROTON ?
                              this.model.particleAtom.protonCountProperty.value :
                              this.model.particleAtom.neutronCountProperty.value;
      const nucleonCountDifference = oldNucleonCount - newNucleonCount;

      for ( let i = 0; i < Math.abs( nucleonCountDifference ); i++ ) {
        if ( nucleonCountDifference > 0 ) {
          this.addNucleonImmediatelyToAtom( particleType );
        }
        else if ( nucleonCountDifference < 0 ) {
          removeNucleonImmediatelyFromAtom( particleType );
        }
      }
    };

    // remove a nucleon of a given particleType from the atom immediately
    const removeNucleonImmediatelyFromAtom = ( particleType: ParticleType ) => {
      const particleToRemove = this.model.particleAtom.extractParticle( particleType.name.toLowerCase() );
      this.animateAndRemoveParticle( particleToRemove );
    };

    // show the undoDecayButton
    const showAndRepositionUndoDecayButton = ( decayType: string ) => {
      repositionUndoDecayButton( decayType );
      undoDecayButton.visible = true;
    };

    // hide the undo decay button if anything in the nucleus changes
    Multilink.multilink( [ this.model.particleAtom.massNumberProperty, this.model.userControlledProtons.lengthProperty,
      this.model.incomingProtons.lengthProperty, this.model.incomingNeutrons.lengthProperty,
      this.model.userControlledNeutrons.lengthProperty ], () => {
      undoDecayButton.visible = false;
    } );

    // create and add the available decays panel at the center right of the decay screen
    const availableDecaysPanel = new AvailableDecaysPanel( model, {
      decayAtom: this.decayAtom.bind( this ),
      storeNucleonCounts: storeNucleonCounts.bind( this ),
      showAndRepositionUndoDecayButton: showAndRepositionUndoDecayButton.bind( this )
    } );
    availableDecaysPanel.right = this.symbolAccordionBox.right;
    availableDecaysPanel.top = this.symbolAccordionBox.bottom + 10;
    this.addChild( availableDecaysPanel );

    let manualConstraint: ManualConstraint<Node[]> | null;

    // reposition the undo button beside the decayButton
    const repositionUndoDecayButton = ( decayType: string ) => {
      const decayButtonAndIconIndex = availableDecaysPanel.decayTypeButtonIndexMap[ decayType ];
      const decayButtonAndIcon = availableDecaysPanel.arrangedDecayButtonsAndIcons.children[ decayButtonAndIconIndex ];
      manualConstraint && manualConstraint.dispose();
      manualConstraint = new ManualConstraint( this, [ decayButtonAndIcon, undoDecayButton ],
        ( decayButtonAndIconWrapper, undoDecayButtonWrapper ) => {
          undoDecayButtonWrapper.centerY = decayButtonAndIconWrapper.centerY;
        } );
    };
    undoDecayButton.right = availableDecaysPanel.left - 10;

    // show the electron cloud by default
    this.showElectronCloudBooleanProperty = new BooleanProperty( true );
    this.showElectronCloudBooleanProperty.link( showElectronCloud => { this.particleAtomNode.electronCloud.visible = showElectronCloud; } );

    // create and add the electronCloud checkbox
    const showElectronCloudCheckbox = new Checkbox( this.showElectronCloudBooleanProperty, new HBox( {
      children: [
        new Text( BuildANucleusStrings.electronCloud, { font: BANConstants.REGULAR_FONT, maxWidth: 210 } ),

        // electron cloud icon
        new Circle( {
          radius: 18,
          fill: new RadialGradient( 0, 0, 0, 0, 0, 18 )
            .addColorStop( 0, 'rgba( 0, 0, 255, 200 )' )
            .addColorStop( 0.9, 'rgba( 0, 0, 255, 0 )' )
        } )
      ],
      spacing: 5
    } ) );
    showElectronCloudCheckbox.left = availableDecaysPanel.left;
    showElectronCloudCheckbox.bottom = this.resetAllButton.bottom;
    this.addChild( showElectronCloudCheckbox );

    // create and add stability indicator
    this.stabilityIndicator = new Text( '', {
      font: BANConstants.REGULAR_FONT,
      fill: 'black',
      visible: true,
      maxWidth: 225
    } );
    this.stabilityIndicator.center = new Vector2( halfLifeInformationNodeCenterX, availableDecaysPanel.top );
    this.addChild( this.stabilityIndicator );

    // add the particleViewLayerNode after everything else so particles are in the top layer
    this.addChild( this.particleAtomNode );

    // Define the update function for the stability indicator.
    const updateStabilityIndicator = ( protonCount: number, neutronCount: number ) => {
      if ( protonCount > 0 ) {
        if ( AtomIdentifier.isStable( protonCount, neutronCount ) ) {
          this.stabilityIndicator.string = BuildANucleusStrings.stable;
        }
        else {
          this.stabilityIndicator.string = BuildANucleusStrings.unstable;
        }
      }
      else {
        this.stabilityIndicator.string = '';
      }
      this.stabilityIndicator.center = new Vector2( halfLifeInformationNodeCenterX, availableDecaysPanel.top );
    };

    // Add the listeners that control the label content
    Multilink.multilink( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => updateStabilityIndicator( protonCount, neutronCount )
    );
    const updateStabilityIndicatorVisibility = ( visible: boolean ) => {
      this.stabilityIndicator.visible = visible;
    };
    model.doesNuclideExistBooleanProperty.link( updateStabilityIndicatorVisibility );

    // TODO: move elementName to BANScreenView bc text node the same, just positioning different https://github.com/phetsims/build-a-nucleus/issues/93

    this.elementName.center = this.stabilityIndicator.center.plusXY( 0, 60 );
    this.nucleonCountPanel.left = availableDecaysPanel.left;

    // Hook up update listeners.
    Multilink.multilink( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty, model.doesNuclideExistBooleanProperty ],
      ( protonCount: number, neutronCount: number, doesNuclideExist: boolean ) =>
        BANScreenView.updateElementName( this.elementName, protonCount, neutronCount, doesNuclideExist, this.stabilityIndicator.centerX )
    );

    // only show the emptyAtomCircle if less than 2 particles are in the atom. We still want to show it when there's
    // only one nucleon, and no electron cloud, to accommodate for when the first nucleon is being animated towards the
    // atomNode center. However, if the electronCloud is showing, then only show the emptyAtomCircle when there are zero
    // nucleons
    Multilink.multilink( [ this.model.particleAtom.protonCountProperty, this.model.particleAtom.neutronCountProperty,
      this.showElectronCloudBooleanProperty ], ( protonCount, neutronCount, showElectronCloud ) => {

      // TODO: Why should there be two cases? Could remove the latter case? https://github.com/phetsims/build-a-nucleus/issues/93
      this.particleAtomNode.emptyAtomCircle.visible = showElectronCloud ? ( protonCount + neutronCount ) === 0 : ( protonCount + neutronCount ) <= 1;
    } );
  }

  /**
   * Returns whether the nucleon is within the circular capture radius around the atom.
   */
  protected override isNucleonInCaptureArea( nucleon: Particle, atom: ParticleAtom ): boolean {
    return nucleon.positionProperty.value.distance( atom.positionProperty.value ) < NUCLEON_CAPTURE_RADIUS;
  }

  public override reset(): void {
    this.symbolAccordionBox.reset();
    this.showElectronCloudBooleanProperty.reset();
  }

  protected getAtomNodeCenter(): Vector2 {
    return this.particleAtomNode.emptyAtomCircle.center;
  }
}

buildANucleus.register( 'DecayScreenView', DecayScreenView );
export default DecayScreenView;

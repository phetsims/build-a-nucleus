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
import { Circle, HBox, ManualConstraint, Node, Text } from '../../../../scenery/js/imports.js';
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
import DecayType from '../../common/model/DecayType.js';
import AlphaParticle from '../../common/model/AlphaParticle.js';
import ReturnButton from '../../../../scenery-phet/js/buttons/ReturnButton.js';
import BANQueryParameters from '../../common/BANQueryParameters.js';

// constants
const NUCLEON_CAPTURE_RADIUS = 100;

// types
export type DecayScreenViewOptions = BANScreenViewOptions;

class DecayScreenView extends BANScreenView<DecayModel> {

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
      this.elementNameStringProperty );
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
      titleNode: new Text( BuildANucleusStrings.symbolStringProperty, {
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


    // store the current nucleon numbers
    let oldProtonNumber: number;
    let oldNeutronNumber: number;
    const storeNucleonNumbers = () => {
      oldProtonNumber = this.model.particleAtom.protonCountProperty.value;
      oldNeutronNumber = this.model.particleAtom.neutronCountProperty.value;
    };

    // create the undo decay button
    const undoDecayButton = new ReturnButton( {
      iconOptions: { scale: 0.7 },
      listener: () => {
        undoDecayButton.visible = false;
        restorePreviousNucleonNumber( ParticleType.PROTON, oldProtonNumber );
        restorePreviousNucleonNumber( ParticleType.NEUTRON, oldNeutronNumber );

        // remove all particles in the outgoingParticles array from the particles array
        this.model.outgoingParticles.forEach( particle => {
          this.model.removeParticle( particle );
        } );
        this.model.outgoingParticles.clear();
        this.model.particleAnimations.clear();

        // clear all active animations
        this.model.particleAtom.clearAnimations();
      }
    } );
    undoDecayButton.visible = false;
    this.addChild( undoDecayButton );

    // restore the particleAtom to have the nucleon numbers before a decay occurred
    const restorePreviousNucleonNumber = ( particleType: ParticleType, oldNucleonNumber: number ) => {
      const newNucleonNumber = particleType === ParticleType.PROTON ?
                               this.model.particleAtom.protonCountProperty.value :
                               this.model.particleAtom.neutronCountProperty.value;
      const nucleonNumberDifference = oldNucleonNumber - newNucleonNumber;

      for ( let i = 0; i < Math.abs( nucleonNumberDifference ); i++ ) {
        if ( nucleonNumberDifference > 0 ) {
          this.addNucleonImmediatelyToAtom( particleType );
        }
        else if ( nucleonNumberDifference < 0 ) {
          removeNucleonImmediatelyFromAtom( particleType );
        }
      }
    };

    // remove a nucleon of a given particleType from the atom immediately
    const removeNucleonImmediatelyFromAtom = ( particleType: ParticleType ) => {

      const particleToRemove = this.model.particleAtom.extractParticle( particleType.particleTypeString );
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
      storeNucleonNumbers: storeNucleonNumbers.bind( this ),
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
    const electronCloudRadius = 18; // empirically determined to be close in size to the 'Electron Cloud' text height
    const showElectronCloudCheckbox = new Checkbox( this.showElectronCloudBooleanProperty, new HBox( {
      children: [
        new Text( BuildANucleusStrings.electronCloudStringProperty, { font: BANConstants.REGULAR_FONT, maxWidth: 210 } ),

        // electron cloud icon
        new Circle( {
          radius: electronCloudRadius,
          fill: BANConstants.ELECTRON_CLOUD_FILL_GRADIENT( electronCloudRadius )
        } )
      ],
      spacing: 5
    } ) );
    showElectronCloudCheckbox.left = availableDecaysPanel.left;
    showElectronCloudCheckbox.bottom = this.resetAllButton.bottom;
    this.addChild( showElectronCloudCheckbox );

    // create and add stability indicator
    const stabilityIndicator = new Text( '', {
      font: BANConstants.REGULAR_FONT,
      fill: 'black',
      visible: true,
      maxWidth: 225
    } );
    stabilityIndicator.boundsProperty.link( () => {
      stabilityIndicator.center = new Vector2( halfLifeInformationNodeCenterX, availableDecaysPanel.top );
    } );
    this.addChild( stabilityIndicator );

    // add the particleViewLayerNode after everything else so particles are in the top layer
    this.addChild( this.particleAtomNode );

    // Define the update function for the stability indicator.
    const updateStabilityIndicator = ( protonNumber: number, neutronNumber: number ) => {
      if ( protonNumber > 0 ) {
        if ( AtomIdentifier.isStable( protonNumber, neutronNumber ) ) {
          stabilityIndicator.stringProperty = BuildANucleusStrings.stableStringProperty;
        }
        else {
          stabilityIndicator.stringProperty = BuildANucleusStrings.unstableStringProperty;
        }
      }
      else {
        stabilityIndicator.string = '';
      }
    };

    // Add the listeners that control the label content
    Multilink.multilink( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty ],
      ( protonNumber: number, neutronNumber: number ) => updateStabilityIndicator( protonNumber, neutronNumber )
    );
    const updateStabilityIndicatorVisibility = ( visible: boolean ) => {
      stabilityIndicator.visible = visible;
    };
    model.doesNuclideExistBooleanProperty.link( updateStabilityIndicatorVisibility );

    this.elementName.boundsProperty.link( () => {

      // place the elementName a bit below the stabilityIndicator
      this.elementName.center = stabilityIndicator.center.plusXY( 0, 60 );
    } );
    this.nucleonNumberPanel.left = availableDecaysPanel.left;

    this.pdomPlayAreaNode.pdomOrder = this.pdomPlayAreaNode.pdomOrder!.concat( [
      halfLifeInformationNode,
      undoDecayButton,
      this.symbolAccordionBox,
      availableDecaysPanel
    ] );
    this.pdomControlAreaNode.pdomOrder = [ showElectronCloudCheckbox, ...this.pdomControlAreaNode.pdomOrder! ];

    phet.joist.sim.isConstructionCompleteProperty.link( ( complete: boolean ) => {
      complete && this.populateAtom( BANQueryParameters.decayScreenProtons, BANQueryParameters.decayScreenNeutrons );
    } );
  }

  /**
   * Add particleView to correct layer in particleAtomNode.
   */
  protected override addParticleView( particle: Particle ): void {
    this.particleAtomNode.addParticleView( particle, this.particleViewMap[ particle.id ] );
  }

  protected override getRandomExternalModelPosition(): Vector2 {
    return this.particleTransform.viewToModelPosition( this.getRandomEscapePosition() );
  }

  protected override getParticleAtom(): ParticleAtom {
    return this.model.particleAtom;
  }

  /**
   * Creates an alpha particle by removing the needed nucleons from the nucleus, arranging them, and then animates the
   * particle out of view.
   */
  protected override emitAlphaParticle(): AlphaParticle {
    const alphaParticle = super.emitAlphaParticle();

    // this is a special case where the 2 remaining protons, after an alpha particle is emitted, are emitted too
    if ( this.model.particleAtom.protonCountProperty.value === 2 && this.model.particleAtom.neutronCountProperty.value === 0 ) {
      const alphaParticleInitialPosition = alphaParticle.positionProperty.value;

      // the distance the alpha particle travels in {{ BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST }} seconds
      const alphaParticleDistanceTravelled = BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST * alphaParticle.velocity;

      let protonsEmitted = false;
      alphaParticle.positionProperty.link( position => {

        // emit the 2 protons after {{ BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST }} seconds
        if ( !protonsEmitted && position.distance( alphaParticleInitialPosition ) >= alphaParticleDistanceTravelled ) {
          _.times( 2, () => { this.emitNucleon( ParticleType.PROTON ); } );
          protonsEmitted = true;
        }
      } );
    }

    return alphaParticle;
  }

  /**
   * Changes the nucleon type of a particle in the atom and emits an electron or positron from behind that particle.
   */
  protected override betaDecay( betaDecayType: DecayType ): Particle {
    const particleToEmit = super.betaDecay( betaDecayType );
    this.model.addParticle( particleToEmit );
    return particleToEmit;
  }

  /**
   * Returns whether the nucleon is within the circular capture radius around the atom.
   */
  protected override isNucleonInCaptureArea( nucleon: Particle, atom: ParticleAtom ): boolean {
    return nucleon.positionProperty.value.distance( atom.positionProperty.value ) < NUCLEON_CAPTURE_RADIUS;
  }

  protected override reset(): void {
    this.symbolAccordionBox.reset();
    this.showElectronCloudBooleanProperty.reset();
    super.reset();
  }
}

buildANucleus.register( 'DecayScreenView', DecayScreenView );
export default DecayScreenView;

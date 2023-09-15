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
import { ManualConstraint, Node, Text } from '../../../../scenery/js/imports.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleType from '../../common/model/ParticleType.js';
import Multilink from '../../../../axon/js/Multilink.js';
import DecayType from '../../common/model/DecayType.js';
import AlphaParticle from '../../common/model/AlphaParticle.js';
import ReturnButton from '../../../../scenery-phet/js/buttons/ReturnButton.js';
import BANQueryParameters from '../../common/BANQueryParameters.js';
import ShowElectronCloudCheckbox from './ShowElectronCloudCheckbox.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import StabilityIndicatorText from './StabilityIndicatorText.js';

// constants
const NUCLEON_CAPTURE_RADIUS = 100;

// types
export type DecayScreenViewOptions = BANScreenViewOptions;

class DecayScreenView extends BANScreenView<DecayModel> {

  // The symbol node in an accordion box.
  private readonly symbolAccordionBox: AccordionBox;

  // For resetting.
  private readonly showElectronCloudCheckbox: ShowElectronCloudCheckbox;

  public constructor( model: DecayModel, providedOptions?: DecayScreenViewOptions ) {

    const options =
      optionize<DecayScreenViewOptions, EmptySelfOptions, BANScreenViewOptions>()( {}, providedOptions );

    super( model, new Vector2( BANConstants.SCREEN_VIEW_ATOM_CENTER_X, BANConstants.SCREEN_VIEW_ATOM_CENTER_Y ), options );

    this.model = model;

    // Create and add the half-life information node at the top half of the decay screen.
    const halfLifeInformationNode = new HalfLifeInformationNode( model.halfLifeNumberProperty,
      model.isStableProperty, this.elementNameText.elementNameStringProperty );
    halfLifeInformationNode.left = this.layoutBounds.minX + BANConstants.SCREEN_VIEW_X_MARGIN + 30;
    halfLifeInformationNode.y = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN + 80;
    this.addChild( halfLifeInformationNode );

    // Use this constant since everything else is positioned off of the halfLifeInformationNode and the centerX changes
    // as the halfLifeArrow in the halfLifeInformationNode moves.
    const halfLifeInformationNodeCenterX = halfLifeInformationNode.centerX;

    // Create and add the symbol node in an accordion box.
    const symbolNode = new SymbolNode( model.particleAtom.protonCountProperty, model.particleAtom.massNumberProperty, {
      scale: 0.3
    } );
    this.symbolAccordionBox = new AccordionBox( symbolNode, {
      titleNode: new Text( BuildANucleusStrings.symbolStringProperty, {
        font: BANConstants.REGULAR_FONT,
        maxWidth: 113 // This value largely controls the size of the whole panel, which others rely on. Change wisely, https://github.com/phetsims/build-a-nucleus/issues/187
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

    // Store the current nucleon numbers.
    let oldProtonNumber: number;
    let oldNeutronNumber: number;

    // Create and add the undo decay button.
    const undoDecayButton = new ReturnButton( {
      iconOptions: { scale: 0.7 },
      listener: () => {
        undoDecayButton.visible = false;
        this.restorePreviousNucleonNumber( ParticleType.PROTON, oldProtonNumber );
        this.restorePreviousNucleonNumber( ParticleType.NEUTRON, oldNeutronNumber );

        // Remove all particles in the outgoingParticles array from the particles array.
        [ ...this.model.outgoingParticles ].forEach( particle => {
          this.model.removeParticle( particle );
        } );
        this.model.outgoingParticles.clear();
        this.model.particleAnimations.clear();

        // Clear all active animations.
        this.model.particleAtom.clearAnimations();
      }
    } );
    undoDecayButton.visible = false;
    this.addChild( undoDecayButton );

    // Hide the undo decay button if anything in the nucleus changes.
    Multilink.multilink( [ this.model.particleAtom.massNumberProperty, this.model.userControlledProtons.lengthProperty,
      this.model.incomingProtons.lengthProperty, this.model.incomingNeutrons.lengthProperty,
      this.model.userControlledNeutrons.lengthProperty ], () => {
      undoDecayButton.visible = false;
    } );

    // Create and add the available decays panel at the center right of the decay screen.
    const availableDecaysPanel = new AvailableDecaysPanel( {
      decayEnabledPropertyMap: model.decayEnabledPropertyMap,
      handleDecayListener: decayType => {
        oldProtonNumber = this.model.particleAtom.protonCountProperty.value;
        oldNeutronNumber = this.model.particleAtom.neutronCountProperty.value;
        this.decayAtom( decayType );
        repositionUndoDecayButton( decayType.name.toString() );
        undoDecayButton.visible = true;
      }
    } );
    availableDecaysPanel.right = this.symbolAccordionBox.right;
    availableDecaysPanel.top = this.symbolAccordionBox.bottom + 10;
    this.addChild( availableDecaysPanel );

    let manualConstraint: ManualConstraint<Node[]> | null;

    // Reposition the undo button beside the decayButton.
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
    this.showElectronCloudCheckbox = new ShowElectronCloudCheckbox( this.particleAtomNode.electronCloud );
    this.showElectronCloudCheckbox.left = availableDecaysPanel.left;
    this.showElectronCloudCheckbox.bottom = this.resetAllButton.bottom;
    this.addChild( this.showElectronCloudCheckbox );

    // Create and add stability indicator.
    const stabilityIndicatorText = new StabilityIndicatorText( model.particleAtom.protonCountProperty,
      model.particleAtom.neutronCountProperty, model.nuclideExistsProperty );
    this.addChild( stabilityIndicatorText );

    // Add the particleViewLayerNode after everything else so particles are in the top layer.
    this.addChild( this.particleAtomNode );

    // Positioning.
    this.elementNameText.boundsProperty.link( () => {

      // Place the elementNameText a bit below the stabilityIndicatorText.
      this.elementNameText.center = stabilityIndicatorText.center.plusXY( 0, 60 );
    } );
    this.nucleonNumberPanel.left = availableDecaysPanel.left;
    stabilityIndicatorText.boundsProperty.link( () => {
      stabilityIndicatorText.center = new Vector2( halfLifeInformationNodeCenterX, availableDecaysPanel.top );
    } );

    this.pdomPlayAreaNode.pdomOrder = this.pdomPlayAreaNode.pdomOrder!.concat( [
      halfLifeInformationNode,
      undoDecayButton,
      this.symbolAccordionBox,
      availableDecaysPanel
    ] );
    this.pdomControlAreaNode.pdomOrder = [ this.showElectronCloudCheckbox, ...this.pdomControlAreaNode.pdomOrder! ];

    phet.joist.sim.isConstructionCompleteProperty.link( ( complete: boolean ) => {
      complete && this.populateDefaultAtom();
    } );
  }

  private populateDefaultAtom(): void {
    this.model.populateAtom( BANQueryParameters.decayScreenProtons, BANQueryParameters.decayScreenNeutrons );
  }

  /**
   * Add particleView to correct layer in particleAtomNode.
   */
  protected override addParticleView( particle: Particle ): void {
    this.particleAtomNode.addParticleView( particle, this.particleViewMap[ particle.id ] );
  }

  /**
   * Returns a random position, in model coordinates, outside the screen view's visible bounds.
   */
  protected override getRandomExternalModelPosition(): Vector2 {
    return this.particleTransform.viewToModelPosition( this.getRandomEscapePosition() );
  }

  /**
   * Creates an alpha particle by removing the needed nucleons from the nucleus, arranging them, and then animates the
   * particle out of view.
   */
  protected override emitAlphaParticle(): AlphaParticle {
    const alphaParticle = super.emitAlphaParticle();

    // This is a special case where the 2 remaining protons, after an alpha particle is emitted, are emitted too.
    if ( this.model.particleAtom.protonCountProperty.value === 2 && this.model.particleAtom.neutronCountProperty.value === 0 ) {
      const alphaParticleInitialPosition = alphaParticle.positionProperty.value;

      // The distance the alpha particle travels in {{ BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST }} seconds.
      const alphaParticleDistanceTravelled = BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST * alphaParticle.velocity;

      let protonsEmitted = false;

      // Make sure that this case stays valid through the animation and that particleAtom state doesn't get mucked with.
      this.model.particleAtom.protons.forEach( proton => proton.inputEnabledProperty.set( false ) );

      alphaParticle.positionProperty.link( position => {

        // Emit the 2 protons after {{ BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST }} seconds.
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
  protected override isNucleonInCaptureArea( nucleon: Particle, atomPositionProperty: TReadOnlyProperty<Vector2> ): boolean {
    return nucleon.positionProperty.value.distance( atomPositionProperty.value ) < NUCLEON_CAPTURE_RADIUS;
  }

  /**
   * Restore the particleAtom to have the nucleon numbers before a decay occurred.
   */
  private restorePreviousNucleonNumber( particleType: ParticleType, oldNucleonNumber: number ): void {
    const newNucleonNumber = particleType === ParticleType.PROTON ?
                             this.model.particleAtom.protonCountProperty.value :
                             this.model.particleAtom.neutronCountProperty.value;
    const nucleonNumberDifference = oldNucleonNumber - newNucleonNumber;

    for ( let i = 0; i < Math.abs( nucleonNumberDifference ); i++ ) {
      if ( nucleonNumberDifference > 0 ) {
        this.model.addNucleonImmediatelyToAtom( particleType );
      }
      else if ( nucleonNumberDifference < 0 ) {
        this.removeNucleonImmediatelyFromAtom( particleType );
      }
    }
  }

  /**
   * Remove a nucleon of a given particleType from the atom immediately.
   */
  private removeNucleonImmediatelyFromAtom( particleType: ParticleType ): void {
    const particleToRemove = this.model.particleAtom.extractParticle( particleType.particleTypeString );
    this.animateAndRemoveParticle( particleToRemove );
  }

  protected override reset(): void {
    this.symbolAccordionBox.reset();
    this.showElectronCloudCheckbox.reset();
    super.reset();
    this.populateDefaultAtom(); // this should be last
  }
}

buildANucleus.register( 'DecayScreenView', DecayScreenView );
export default DecayScreenView;

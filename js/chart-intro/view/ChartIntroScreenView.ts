// Copyright 2022-2023, University of Colorado Boulder

/**
 * ScreenView for the 'Nuclide Chart Intro' screen.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import ChartIntroModel, { SelectedChartType } from '../model/ChartIntroModel.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import BANScreenView, { BANScreenViewOptions } from '../../common/view/BANScreenView.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import PeriodicTableAndIsotopeSymbol from './PeriodicTableAndIsotopeSymbol.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import { Line, Node, RichText, Text } from '../../../../scenery/js/imports.js';
import BANConstants from '../../common/BANConstants.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import BANColors from '../../common/BANColors.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import NucleonShellView from './NucleonShellView.js';
import ParticleType from '../../common/model/ParticleType.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import NuclideChartAccordionBox from './NuclideChartAccordionBox.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import CompleteNuclideChartIconNode from './CompleteNuclideChartIconNode.js';
import ZoomInNuclideChartIconNode from './ZoomInNuclideChartIconNode.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import DecayType from '../../common/model/DecayType.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import FullChartDialog from './FullChartDialog.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import AlphaParticle from '../../common/model/AlphaParticle.js';
import BANQueryParameters from '../../common/BANQueryParameters.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';

// types
export type NuclideChartIntroScreenViewOptions = BANScreenViewOptions;

// constants
const CHART_VERTICAL_MARGINS = 10;
const FADE_ANINIMATION_DURATION = 1; // in seconds

class ChartIntroScreenView extends BANScreenView<ChartIntroModel> {

  private readonly protonEnergyLevelNode: NucleonShellView;
  private readonly neutronEnergyLevelNode: NucleonShellView;
  private readonly energyLevelLayer = new Node();

  // If the miniAtom is connected to the main particleAtom (ParticleNucleus in the Chart Intro screen). When true the
  // mini ParticleAtom is kept in sync (false only for when decaying particles cause behavior differences in each
  // representation).
  private isMiniAtomConnected = true;

  // positions and sizes particles in the miniParticleAtom
  private readonly miniAtomMVT: ModelViewTransform2;

  public constructor( model: ChartIntroModel, providedOptions?: NuclideChartIntroScreenViewOptions ) {

    const options = optionize<NuclideChartIntroScreenViewOptions, EmptySelfOptions, BANScreenViewOptions>()( {

      // Position of the particle nucleus (top left corner-ish)
      particleViewPosition: new Vector2( 135, 245 )
    }, providedOptions );

    super( model, new Vector2( BANConstants.SCREEN_VIEW_ATOM_CENTER_X, 87 ), options ); // center of the mini-atom

    this.model = model;

    // the center of the particleAtomNode is the (0,0) point
    this.miniAtomMVT = ModelViewTransform2.createSinglePointScaleMapping( Vector2.ZERO, this.particleAtomNode.emptyAtomCircle.center, 1 );

    // update nucleons in mini-particle as the particleAtom's nucleon changes. This listener keeps the mini-particle in sync.
    const nucleonNumberListener = ( nucleonNumber: number, particleType: ParticleType ) => {
      const currentMiniAtomNucleonNumber = particleType === ParticleType.PROTON ?
                                           model.miniParticleAtom.protonCountProperty.value :
                                           model.miniParticleAtom.neutronCountProperty.value;

      // difference between particleAtom's nucleon number and miniAtom's nucleon number
      const nucleonDelta = currentMiniAtomNucleonNumber - nucleonNumber;

      // add nucleons to miniAtom
      if ( nucleonDelta < 0 ) {

        // If true, keep the mini atom's particles identical to those in the ParticleNucleus
        if ( this.isMiniAtomConnected ) {
          _.times( nucleonDelta * -1, () => {
            const miniParticle = model.createMiniParticleModel( particleType );
            this.createMiniParticleView( miniParticle );
          } );
        }
      }

      // remove nucleons from miniAtom
      else if ( nucleonDelta > 0 ) {
        _.times( nucleonDelta, () => {

          // If true, keep the mini atom's particles identical to those in the ParticleNucleus
          if ( this.isMiniAtomConnected ) {
            const particle = model.miniParticleAtom.extractParticle( particleType.particleTypeString );
            particle.dispose();
            assert && assert( !this.model.particles.includes( particle ),
              'Particle from mini atom should not be a part of the particles array when disposed.' );

            model.miniParticleAtom.reconfigureNucleus();
          }
        } );
      }
    };
    model.particleAtom.protonCountProperty.link( protonNumber => nucleonNumberListener( protonNumber, ParticleType.PROTON ) );
    model.particleAtom.neutronCountProperty.link( neutronNumber => nucleonNumberListener( neutronNumber, ParticleType.NEUTRON ) );
    const particleAtomNodeCenter = this.particleAtomNode.center;

    // scale down to make nucleus 'mini' sized and keep the same center after scaling
    this.particleAtomNode.scale( 0.75 );
    this.particleAtomNode.center = particleAtomNodeCenter;

    // create and add the periodic table and symbol
    const periodicTableAndIsotopeSymbol = new PeriodicTableAndIsotopeSymbol( model.particleAtom );
    periodicTableAndIsotopeSymbol.top = this.nucleonNumberPanel.top;
    periodicTableAndIsotopeSymbol.right = this.resetAllButton.right;
    this.addChild( periodicTableAndIsotopeSymbol );

    // positioning
    this.elementNameText.boundsProperty.link( () => {
      this.elementNameText.centerX = this.doubleArrowButtons.centerX;
      this.elementNameText.top = this.nucleonNumberPanel.top;
    } );
    this.nucleonNumberPanel.left = this.layoutBounds.left + 20;

    // create and add the 'Nuclear Shell Model' title and background
    const nuclearShellModelText = new RichText( BuildANucleusStrings.nuclearShellModelStringProperty, {
      font: BANConstants.REGULAR_FONT,
      maxWidth: 220
    } );
    const textBackground = new BackgroundNode( nuclearShellModelText, {
      xMargin: 15,
      yMargin: 5,
      rectangleOptions: {
        fill: BANColors.shellModelTextHighlightColorProperty,
        cornerRadius: 10
      }
    } );
    textBackground.boundsProperty.link( () => {
      textBackground.centerX = this.doubleArrowButtons.centerX;
      textBackground.centerY = periodicTableAndIsotopeSymbol.bottom + 20;
    } );
    this.addChild( textBackground );

    // create and add the 'Energy' label
    const energyText = new RichText( BuildANucleusStrings.energyStringProperty, {
      font: BANConstants.REGULAR_FONT,
      maxWidth: 150
    } );
    energyText.rotate( -Math.PI / 2 );
    energyText.boundsProperty.link( () => {
      energyText.left = this.nucleonNumberPanel.left;
      energyText.centerY = this.layoutBounds.centerY + 20;
    } );
    this.addChild( energyText );

    // create and add the 'Energy' arrow
    const energyTextDistanceFromArrow = 10;
    const arrow = new ArrowNode( energyText.right + energyTextDistanceFromArrow, this.protonArrowButtons.top - 30,
      energyText.right + energyTextDistanceFromArrow, periodicTableAndIsotopeSymbol.bottom + 15, { tailWidth: 2 } );
    this.addChild( arrow );

    // add proton and neutron energy level nodes
    this.protonEnergyLevelNode = new NucleonShellView( ParticleType.PROTON, model.particleAtom.protonShellPositions,
      model.particleAtom.protonCountProperty, this.model.particleAtom.modelViewTransform );

    // We don't want to effect the origin of this, so just translate
    this.protonEnergyLevelNode.setTranslation( options.particleViewPosition );
    this.addChild( this.protonEnergyLevelNode );

    this.neutronEnergyLevelNode = new NucleonShellView( ParticleType.NEUTRON, model.particleAtom.neutronShellPositions,
      model.particleAtom.neutronCountProperty, this.model.particleAtom.modelViewTransform );

    // neutron energy levels are further to the right than the proton energy levels
    this.neutronEnergyLevelNode.setTranslation( options.particleViewPosition.plusXY( BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS, 0 ) );
    this.addChild( this.neutronEnergyLevelNode );

    // dashed 'zoom' lines options and positioning
    const dashedLineOptions = { stroke: BANColors.zoomInDashedLineStrokeColorProperty, lineDash: [ 6, 3 ] };
    const endLeft = this.particleAtomNode.emptyAtomCircle.center.x - ( BANConstants.PARTICLE_DIAMETER );
    const endRight = this.particleAtomNode.emptyAtomCircle.center.x + ( BANConstants.PARTICLE_DIAMETER );

    // create and add dashed 'zoom' lines
    const leftDashedLine = new Line( this.protonEnergyLevelNode.left, arrow.top, endLeft,
      periodicTableAndIsotopeSymbol.centerY, dashedLineOptions );
    this.addChild( leftDashedLine );
    const rightDashedLine = new Line( this.neutronEnergyLevelNode.right, arrow.top, endRight,
      periodicTableAndIsotopeSymbol.centerY, dashedLineOptions );
    this.addChild( rightDashedLine );

    // Whether to show a special highlight for magic-numbered nuclides in the charts
    const showMagicNumbersBooleanProperty = new BooleanProperty( false );

    // create the nuclideChartAccordionBox
    const nuclideChartAccordionBox = new NuclideChartAccordionBox(
      this.model.particleAtom.protonCountProperty, this.model.particleAtom.neutronCountProperty, this.model.selectedNuclideChartProperty, this.model.decayEquationModel,
      this.decayAtom.bind( this ), showMagicNumbersBooleanProperty, this.model.hasIncomingParticlesProperty, {
        minWidth: periodicTableAndIsotopeSymbol.width
      } );

    // position and add the nuclideChartAccordionBox
    nuclideChartAccordionBox.top = periodicTableAndIsotopeSymbol.bottom + CHART_VERTICAL_MARGINS;
    nuclideChartAccordionBox.left = periodicTableAndIsotopeSymbol.left;
    this.addChild( nuclideChartAccordionBox );

    // create and add the radio buttons that select the chart type view in the nuclideChartAccordionBox
    const partialChartRadioButton = new RectangularRadioButtonGroup<SelectedChartType>(
      this.model.selectedNuclideChartProperty, [
        { value: 'partial', createNode: () => new CompleteNuclideChartIconNode() },
        { value: 'zoom', createNode: () => new ZoomInNuclideChartIconNode() }
      ], {
        left: nuclideChartAccordionBox.left,
        top: nuclideChartAccordionBox.bottom + CHART_VERTICAL_MARGINS,
        orientation: 'horizontal',
        radioButtonOptions: { baseColor: BANColors.chartRadioButtonsBackgroundColorProperty }
      } );
    this.addChild( partialChartRadioButton );

    // create and add the checkbox to show special highlight for magic-numbered nuclides in the charts
    const showMagicNumbersCheckbox = new Checkbox( showMagicNumbersBooleanProperty,
      new Text( BuildANucleusStrings.magicNumbersStringProperty, { font: BANConstants.LEGEND_FONT, maxWidth: 145 } ), {
        boxWidth: 15,
        touchAreaYDilation: 4
      } );
    showMagicNumbersCheckbox.left = partialChartRadioButton.right + CHART_VERTICAL_MARGINS;
    showMagicNumbersCheckbox.top = nuclideChartAccordionBox.bottom + CHART_VERTICAL_MARGINS;
    this.addChild( showMagicNumbersCheckbox );

    // create and add the fullChartDialog and 'Full Chart' button
    const fullChartDialog = new FullChartDialog();
    const fullChartTextButton = new TextPushButton( BuildANucleusStrings.fullChartCapitalizedStringProperty, {
      baseColor: BANColors.fullChartButtonColorProperty,
      textNodeOptions: {
        font: BANConstants.LEGEND_FONT
      },
      stroke: 'black',
      lineWidth: 1,
      minWidth: 80,
      maxWidth: 160,
      listener: () => fullChartDialog.show()
    } );
    fullChartTextButton.left = showMagicNumbersCheckbox.left;
    fullChartTextButton.bottom = partialChartRadioButton.bottom;
    this.addChild( fullChartTextButton );

    // add the particleView layer nodes after everything else so particles are in the top layer
    this.addChild( this.particleAtomNode );
    this.addChild( this.energyLevelLayer );

    this.pdomPlayAreaNode.pdomOrder = this.pdomPlayAreaNode.pdomOrder!.concat( [
      nuclideChartAccordionBox,
      partialChartRadioButton,
      showMagicNumbersCheckbox,
      fullChartTextButton
    ] );

    phet.joist.sim.isConstructionCompleteProperty.link( ( complete: boolean ) => {
      complete && this.model.populateAtom( BANQueryParameters.chartIntroScreenProtons, BANQueryParameters.chartIntroScreenNeutrons );
    } );
  }

  /**
   * Returns whether the nucleon is within a rectangular capture radius defined by the left edge of the proton arrow
   * buttons, the right edge of the neutron arrow buttons, below the periodic table, and above the arrow buttons.
   */
  protected override isNucleonInCaptureArea( nucleon: Particle ): boolean {
    const nucleonViewPosition = this.particleTransform.modelToViewPosition( nucleon.positionProperty.value );

    return this.protonEnergyLevelNode.boundsProperty.value.dilated( BANConstants.PARTICLE_DIAMETER ).containsPoint( nucleonViewPosition ) ||
           this.neutronEnergyLevelNode.boundsProperty.value.dilated( BANConstants.PARTICLE_DIAMETER ).containsPoint( nucleonViewPosition );
  }

  /**
   * Add ParticleView for the given particle to the energyLevelLayer.
   */
  protected override addParticleView( particle: Particle ): void {
    this.energyLevelLayer.addChild( this.findParticleView( particle ) );
  }

  /**
   * In this screen, particles are only emitted from the miniAtom so use the miniAtomMVT to return an external position in model coordinates.
   */
  protected override getRandomExternalModelPosition(): Vector2 {
    return this.miniAtomMVT.viewToModelPosition( this.getRandomEscapePosition() );
  }

  /**
   * Removes a nucleon from the nucleus and animates it out of view.
   */
  public override emitNucleon( particleType: ParticleType, particleAtom: ParticleAtom ): void {
    this.isMiniAtomConnected = false;

    // Handle the animation for the mini ParticleAtom
    super.emitNucleon( particleType, this.model.miniParticleAtom );
    this.model.miniParticleAtom.reconfigureNucleus();

    // Fade away the nucleon in the ParticleNucleus
    this.fadeOutShellNucleon( particleType );

    this.isMiniAtomConnected = true;
  }

  /**
   * Fade away and remove a nucleon of a given particleType from the energy levels.
   */
  private fadeOutShellNucleon( particleType: ParticleType ): void {
    const shellNucleusNucleon = this.model.particleNucleus.extractParticle( particleType.particleTypeString );
    this.model.outgoingParticles.add( shellNucleusNucleon );
    const particleView = this.findParticleView( shellNucleusNucleon );
    particleView.inputEnabled = false;
    this.fadeAnimation( 0, particleView.opacityProperty, () => {
      this.removeParticle( shellNucleusNucleon );
    } );
  }

  /**
   * Given an opacity property, fade a particle to a given opacity property value. Fire an endedEmitter at the end of
   * the animation if a listener is passed in.
   */
  private fadeAnimation( fadeToNumber: number, particleViewOpacityProperty: TinyProperty<number>, endedEmitterListener?: () => void ): void {
    const fadeAnimation = new Animation( {
      property: particleViewOpacityProperty,
      to: fadeToNumber,
      duration: FADE_ANINIMATION_DURATION,
      easing: Easing.LINEAR
    } );
    endedEmitterListener && fadeAnimation.endedEmitter.addListener( endedEmitterListener );
    this.model.particleAnimations.push( fadeAnimation );
    fadeAnimation.start();
  }


  /**
   * Creates an alpha particle by removing the needed nucleons from the nucleus, arranging them, and then animates the
   * particle out of view. Also fades out the required particles in the energy levels.
   */
  protected override emitAlphaParticle(): AlphaParticle {
    this.isMiniAtomConnected = false;

    // animate mini particle atom
    const alphaParticle = super.emitAlphaParticle();
    this.model.miniParticleAtom.reconfigureNucleus();

    // animate nucleons in NucleonShellView
    _.times( AlphaParticle.NUMBER_OF_ALLOWED_PROTONS, () => this.fadeOutShellNucleon( ParticleType.PROTON ) );
    _.times( AlphaParticle.NUMBER_OF_ALLOWED_NEUTRONS, () => this.fadeOutShellNucleon( ParticleType.NEUTRON ) );

    this.isMiniAtomConnected = true;

    return alphaParticle;
  }

  /**
   * Changes the nucleon type of a particle in the atom and emits an electron or positron from behind that particle.
   */
  protected override betaDecay( betaDecayType: DecayType ): Particle {
    this.isMiniAtomConnected = false;

    // animate mini particleAtom
    const nucleonTypeToChange = betaDecayType === DecayType.BETA_MINUS_DECAY ? ParticleType.NEUTRON : ParticleType.PROTON;
    const particleToEmit = super.betaDecay( betaDecayType );
    this.createMiniParticleView( particleToEmit );

    // animate the shell view
    const newNucleonType = nucleonTypeToChange === ParticleType.PROTON ? ParticleType.NEUTRON : ParticleType.PROTON;
    this.fadeOutShellNucleon( nucleonTypeToChange );

    // create new nucleon particle
    const particle = this.createParticleFromStack( newNucleonType );

    // place particle right beside its destination so that animationEndedEmitter fires
    particle.positionProperty.value = particle.destinationProperty.value.plusXY( 0.000001, 0.000001 );
    const particleView = this.findParticleView( particle );
    particleView.opacityProperty.value = 0;
    this.fadeAnimation( 1, particleView.opacityProperty );

    this.isMiniAtomConnected = true;

    return particleToEmit;
  }

  /**
   * Create ParticleView for a given particle and add it to the particleAtomNode. Also adds a listener to the
   * disposeEmitter for when the given particle is disposed.
   */
  private createMiniParticleView( particle: Particle ): void {
    const particleView = new ParticleView( particle, this.miniAtomMVT, { inputEnabled: false } );
    this.particleViewMap[ particle.id ] = particleView;
    this.particleAtomNode.addParticleView( particle, this.particleViewMap[ particle.id ] );
    particle.disposeEmitter.addListener( () => {
      delete this.particleViewMap[ particle.id ];

      particleView.dispose();
    } );
  }
}

buildANucleus.register( 'ChartIntroScreenView', ChartIntroScreenView );
export default ChartIntroScreenView;
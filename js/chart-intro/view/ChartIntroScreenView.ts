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
import Multilink from '../../../../axon/js/Multilink.js';
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

// types
export type NuclideChartIntroScreenViewOptions = BANScreenViewOptions;

// constants
const CHART_VERTICAL_MARGINS = 10;
const FADE_ANINIMATION_DURATION = 1; // in seconds

class ChartIntroScreenView extends BANScreenView<ChartIntroModel> {

  private readonly periodicTableAndIsotopeSymbol: PeriodicTableAndIsotopeSymbol;
  private readonly protonEnergyLevelNode: NucleonShellView;
  private readonly neutronEnergyLevelNode: NucleonShellView;
  private readonly energyLevelLayer: Node;

  // If the miniAtom is connected to the main particleAtom (ParticleNucleus in the Chart Intro screen). When true the
  // mini ParticleAtom is kept in sync (false only for when decaying particles cause behavior differences in each
  // representation).
  private isMiniAtomConnected = true;
  private readonly miniAtomMVT: ModelViewTransform2;

  public constructor( model: ChartIntroModel, providedOptions?: NuclideChartIntroScreenViewOptions ) {

    const options = optionize<NuclideChartIntroScreenViewOptions, EmptySelfOptions, BANScreenViewOptions>()( {

      // centers particle atoms on energy levels
      particleViewPositionVector: new Vector2( 135, 245 - BANConstants.PARTICLE_RADIUS ) // top left corner of proton energy levels

    }, providedOptions );

    super( model, new Vector2( BANConstants.SCREEN_VIEW_ATOM_CENTER_X, 87 ), options );

    this.model = model;
    this.energyLevelLayer = new Node();

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

    // scale down to make nucleus 'mini' sized
    this.particleAtomNode.scale( 0.75 );
    this.particleAtomNode.center = particleAtomNodeCenter;

    // create and add the periodic table and symbol
    this.periodicTableAndIsotopeSymbol = new PeriodicTableAndIsotopeSymbol( model.particleAtom );
    this.periodicTableAndIsotopeSymbol.top = this.nucleonNumberPanel.top;
    this.periodicTableAndIsotopeSymbol.right = this.resetAllButton.right;
    this.addChild( this.periodicTableAndIsotopeSymbol );

    this.elementName.boundsProperty.link( () => {
      this.elementName.centerX = this.doubleArrowButtons.centerX;
      this.elementName.top = this.nucleonNumberPanel.top;
    } );

    this.nucleonNumberPanel.left = this.layoutBounds.left + 20;

    // create and add the 'Nuclear Shell Model' title
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
      textBackground.centerY = this.periodicTableAndIsotopeSymbol.bottom + 20;
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
      energyText.right + energyTextDistanceFromArrow, this.periodicTableAndIsotopeSymbol.bottom + 15, { tailWidth: 2 } );
    this.addChild( arrow );

    // add energy level node
    this.protonEnergyLevelNode = new NucleonShellView( ParticleType.PROTON, model.particleAtom.protonShellPositions,
      model.particleAtom.protonCountProperty, options.particleViewPositionVector );
    this.addChild( this.protonEnergyLevelNode );
    this.neutronEnergyLevelNode = new NucleonShellView( ParticleType.NEUTRON, model.particleAtom.neutronShellPositions,
      model.particleAtom.neutronCountProperty, options.particleViewPositionVector, {
        xOffset: BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS
      } );
    this.addChild( this.neutronEnergyLevelNode );

    // create and add dashed 'zoom' lines
    const dashedLineOptions = { stroke: BANColors.zoomInDashedLineStrokeColorProperty, lineDash: [ 6, 3 ] };

    const endLeft = this.particleAtomNode.emptyAtomCircle.center.x - ( BANConstants.PARTICLE_RADIUS * 2 );
    const endRight = this.particleAtomNode.emptyAtomCircle.center.x + ( BANConstants.PARTICLE_RADIUS * 2 );

    const leftDashedLine = new Line( this.protonEnergyLevelNode.left, arrow.top, endLeft,
      this.periodicTableAndIsotopeSymbol.centerY, dashedLineOptions );
    this.addChild( leftDashedLine );
    const rightDashedLine = new Line( this.neutronEnergyLevelNode.right, arrow.top, endRight,
      this.periodicTableAndIsotopeSymbol.centerY, dashedLineOptions );
    this.addChild( rightDashedLine );

    // Whether to show a special highlight for magic-numbered nuclides in the charts
    const showMagicNumbersProperty = new BooleanProperty( false );

    const nuclideChartAccordionBox = new NuclideChartAccordionBox( this.model.particleAtom.protonCountProperty,
      this.model.particleAtom.neutronCountProperty, this.periodicTableAndIsotopeSymbol.width,
      this.model.selectedNuclideChartProperty, this.model.decayEquationModel, this.decayAtom.bind( this ), showMagicNumbersProperty );

    nuclideChartAccordionBox.top = this.periodicTableAndIsotopeSymbol.bottom + CHART_VERTICAL_MARGINS;
    nuclideChartAccordionBox.left = this.periodicTableAndIsotopeSymbol.left;
    this.addChild( nuclideChartAccordionBox );

    const partialChartRadioButton = new RectangularRadioButtonGroup<SelectedChartType>( this.model.selectedNuclideChartProperty,
      [
        { value: 'partial', createNode: () => new CompleteNuclideChartIconNode() },
        { value: 'zoom', createNode: () => new ZoomInNuclideChartIconNode() }
      ], {
        left: nuclideChartAccordionBox.left,
        top: nuclideChartAccordionBox.bottom + CHART_VERTICAL_MARGINS,
        orientation: 'horizontal',
        radioButtonOptions: { baseColor: BANColors.chartRadioButtonsBackgroundColorProperty }
      } );
    this.addChild( partialChartRadioButton );

    const showMagicNumbersCheckbox = new Checkbox( showMagicNumbersProperty,
      new Text( BuildANucleusStrings.magicNumbersStringProperty, { font: BANConstants.LEGEND_FONT, maxWidth: 145 } ), {
        boxWidth: 15
      } );
    showMagicNumbersCheckbox.left = partialChartRadioButton.right + CHART_VERTICAL_MARGINS;
    showMagicNumbersCheckbox.top = nuclideChartAccordionBox.bottom + CHART_VERTICAL_MARGINS;
    this.addChild( showMagicNumbersCheckbox );

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

    // add the particleViewLayerNode after everything else so particles are in the top layer
    this.addChild( this.particleAtomNode );
    this.addChild( this.energyLevelLayer );

    // only show the emptyAtomCircle when there are zero nucleons
    Multilink.multilink( [ this.model.particleAtom.protonCountProperty, this.model.particleAtom.neutronCountProperty ],
      ( protonNumber: number, neutronNumber: number ) => {
        this.particleAtomNode.emptyAtomCircle.visible = ( protonNumber + neutronNumber ) === 0;
      } );

    this.pdomPlayAreaNode.pdomOrder = this.pdomPlayAreaNode.pdomOrder!.concat( [
      nuclideChartAccordionBox,
      partialChartRadioButton,
      showMagicNumbersCheckbox,
      fullChartTextButton
    ] );
  }

  /**
   * Returns whether the nucleon is within a rectangular capture radius defined by the left edge of the proton arrow
   * buttons, the right edge of the neutron arrow buttons, below the periodic table, and above the arrow buttons.
   */
  protected override isNucleonInCaptureArea( nucleon: Particle, atom: ParticleAtom ): boolean {
    const nucleonViewPosition = nucleon.positionProperty.value.plus(
      new Vector2( 135, 193 - BANConstants.PARTICLE_RADIUS ) // top left corner of proton energy levels
    );
    return this.protonEnergyLevelNode.boundsProperty.value.dilated( BANConstants.PARTICLE_RADIUS * 2 ).containsPoint( nucleonViewPosition ) ||
           this.neutronEnergyLevelNode.boundsProperty.value.dilated( BANConstants.PARTICLE_RADIUS * 2 ).containsPoint( nucleonViewPosition );
  }

  protected override addParticleView( particle: Particle ): void {
    this.energyLevelLayer.addChild( this.findParticleView( particle ) );
  }

  /**
   * In this screen, particles are only emitted from the miniAtom so use the miniAtomMVT to return an external position in model coordinates.
   */
  public override getRandomExternalModelPosition(): Vector2 {
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

  private fadeOutShellNucleon( particleType: ParticleType ): void {
    const shellNucleusNucleon = this.model.particleNucleus.extractParticle( particleType.particleTypeString );
    this.model.outgoingParticles.add( shellNucleusNucleon );
    const particleView = this.findParticleView( shellNucleusNucleon );
    particleView.inputEnabled = false;
    const fadeAnimation = new Animation( {
      property: particleView.opacityProperty,
      to: 0,
      duration: FADE_ANINIMATION_DURATION,
      easing: Easing.LINEAR
    } );
    fadeAnimation.endedEmitter.addListener( () => {
      this.removeParticle( shellNucleusNucleon );
    } );
    this.model.particleAnimations.push( fadeAnimation );
    fadeAnimation.start();
  }

  public override getParticleAtom(): ParticleAtom {
    return this.model.miniParticleAtom;
  }

  /**
   * Creates an alpha particle by removing the needed nucleons from the nucleus, arranging them, and then animates the
   * particle out of view.
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

    const particle = this.createParticleFromStack( newNucleonType );

    // place particle right beside its destination so that animationEndedEmitter fires
    particle.positionProperty.value = particle.destinationProperty.value.plusXY( 0.000001, 0.000001 );
    const particleView = this.findParticleView( particle );
    particleView.opacityProperty.value = 0;
    const fadeAnimation = new Animation( {
      property: particleView.opacityProperty,
      to: 1,
      duration: FADE_ANINIMATION_DURATION,
      easing: Easing.LINEAR
    } );
    this.model.particleAnimations.push( fadeAnimation );
    fadeAnimation.start();

    this.isMiniAtomConnected = true;

    return particleToEmit;
  }

  private createMiniParticleView( particle: Particle ): void {
    const particleView = new ParticleView( particle, this.miniAtomMVT, { inputEnabled: false } );
    this.particleViewMap[ particle.id ] = particleView;
    this.particleAtomNode.addParticleView( particle );
    particle.disposeEmitter.addListener( () => {
      delete this.particleViewMap[ particle.id ];

      particleView.dispose();
    } );
  }

  /**
   * We need to make sure that the shell position spots reserved for the incoming, animating particles, are cleared out
   * since the particle is no longer coming into the atom.
   */
  public override clearIncomingParticle( particle: Particle, particleType: ParticleType ): void {
    super.clearIncomingParticle( particle, particleType );

    // Not a full removeParticle() call because we never completed the animation into the particleAtom (but we did
    // count it in a shell position).
    this.model.particleAtom.removeParticleFromShell && this.model.particleAtom.removeParticleFromShell( particle );
  }
}

buildANucleus.register( 'ChartIntroScreenView', ChartIntroScreenView );
export default ChartIntroScreenView;
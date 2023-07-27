// Copyright 2022-2023, University of Colorado Boulder

/**
 * ScreenView for the 'Nuclide Chart Intro' screen.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import ChartIntroModel, { SelectedChartType } from '../model/ChartIntroModel.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import BANScreenView, { BANScreenViewOptions, BetaDecayReturnValues, EmitAlphaParticleValues } from '../../common/view/BANScreenView.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PeriodicTableAndIsotopeSymbol from './PeriodicTableAndIsotopeSymbol.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import { Line, Node, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
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

// types
export type NuclideChartIntroScreenViewOptions = BANScreenViewOptions;

// constants
const CHART_VERTICAL_MARGINS = 10;
const NUMBER_OF_PROTONS_IN_ALPHA_PARTICLE = 2;
const NUMBER_OF_NEUTRONS_IN_ALPHA_PARTICLE = 2;
const FADE_ANINIMATION_DURATION = 1; // in seconds

class ChartIntroScreenView extends BANScreenView<ChartIntroModel> {

  private readonly periodicTableAndIsotopeSymbol: PeriodicTableAndIsotopeSymbol;
  private readonly protonEnergyLevelNode: NucleonShellView;
  private readonly neutronEnergyLevelNode: NucleonShellView;
  private readonly energyLevelLayer: Node;
  private decaying = false; // TODO: LV and MK really hate this flag, https://github.com/phetsims/build-a-nucleus/issues/97
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
    // update nucleons in mini-particle as the particleAtom's nucleon count properties change
    const nucleonCountListener = ( nucleonCount: number, particleType: ParticleType ) => {
      const currentMiniAtomNucleonCount = particleType === ParticleType.PROTON ?
                                          model.miniParticleAtom.protonCountProperty.value :
                                          model.miniParticleAtom.neutronCountProperty.value;

      // difference between particleAtom's nucleon count and miniAtom's nucleon count
      const nucleonDelta = currentMiniAtomNucleonCount - nucleonCount;

      // add nucleons to miniAtom
      if ( nucleonDelta < 0 ) {
        // TODO: why not do the decaying check here? Investigate. https://github.com/phetsims/build-a-nucleus/issues/97
        _.times( nucleonDelta * -1, () => {
          const miniParticle = model.createMiniParticleModel( particleType );
          this.createMiniParticleView( miniParticle );
        } );
      }

      // remove nucleons from miniAtom
      else if ( nucleonDelta > 0 ) {
        _.times( nucleonDelta, () => {
          if ( !this.decaying ) {
            const particle = model.miniParticleAtom.extractParticle( particleType.particleTypeString );
            particle.dispose();
            assert && assert( !this.model.particles.includes( particle ),
              'Particle from mini atom should not be a part of the particles array when disposed.' );

            model.miniParticleAtom.reconfigureNucleus();
          }
        } );
      }
    };
    model.particleAtom.protonCountProperty.link( protonCount => nucleonCountListener( protonCount, ParticleType.PROTON ) );
    model.particleAtom.neutronCountProperty.link( neutronCount => nucleonCountListener( neutronCount, ParticleType.NEUTRON ) );
    const particleAtomNodeCenter = this.particleAtomNode.center;

    // scale down to make nucleus 'mini' sized
    this.particleAtomNode.scale( 0.75 );
    this.particleAtomNode.center = particleAtomNodeCenter;

    // create and add the periodic table and symbol
    this.periodicTableAndIsotopeSymbol = new PeriodicTableAndIsotopeSymbol( model.particleAtom );
    this.periodicTableAndIsotopeSymbol.top = this.nucleonCountPanel.top;
    this.periodicTableAndIsotopeSymbol.right = this.resetAllButton.right;
    this.addChild( this.periodicTableAndIsotopeSymbol );

    this.elementName.centerX = this.doubleArrowButtons.centerX;
    this.elementName.top = this.nucleonCountPanel.top;

    this.nucleonCountPanel.left = this.layoutBounds.left + 20;

    // Hook up update listeners.
    Multilink.multilink( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty, model.doesNuclideExistBooleanProperty ],
      ( protonCount: number, neutronCount: number, doesNuclideExist: boolean ) =>
        BANScreenView.updateElementName( this.elementName, protonCount, neutronCount, doesNuclideExist,
          this.doubleArrowButtons.centerX )
    );

    // create and add the 'Nuclear Shell Model' title
    const nuclearShellModelText = new RichText( BuildANucleusStrings.nuclearShellModelStringProperty, { font: BANConstants.REGULAR_FONT } );
    nuclearShellModelText.centerX = this.doubleArrowButtons.centerX;
    nuclearShellModelText.centerY = this.periodicTableAndIsotopeSymbol.bottom + 20;

    // create the 'highlight' text behind 'Nuclear Shell Model' text
    const nuclearShellModelTextHighlight = new Rectangle( nuclearShellModelText.bounds.dilateXY( 15, 5 ), {
      fill: BANColors.shellModelTextHighlightColorProperty,
      cornerRadius: 10
    } );
    nuclearShellModelTextHighlight.centerX = nuclearShellModelText.centerX;
    nuclearShellModelTextHighlight.centerY = nuclearShellModelText.centerY;

    // place highlight behind the text
    this.addChild( nuclearShellModelTextHighlight );
    this.addChild( nuclearShellModelText );

    // create and add the 'Energy' label
    const energyText = new RichText( BuildANucleusStrings.energyStringProperty, { font: BANConstants.REGULAR_FONT } );
    energyText.rotate( -Math.PI / 2 );
    energyText.left = this.nucleonCountPanel.left;
    energyText.centerY = this.layoutBounds.centerY + 20;
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

    // TODO: use align group to match width's of accordion box and periodic table https://github.com/phetsims/build-a-nucleus/issues/93
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
      minWidth: 80,
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
      ( protonCount: number, neutronCount: number ) => {
        this.particleAtomNode.emptyAtomCircle.visible = ( protonCount + neutronCount ) === 0;
      } );

    this.pdomPlayAreaNode.pdomOrder = this.pdomPlayAreaNode.pdomOrder!.concat( [
      nuclideChartAccordionBox,
      partialChartRadioButton
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

  protected getAtomNodeCenter(): Vector2 {
    // TODO: this most likely isn't doing anything, https://github.com/phetsims/build-a-nucleus/issues/97
    return this.particleAtomNode.localToGlobalPoint( this.particleAtomNode.emptyAtomCircle.center );
  }

  public getRandomExternalModelPosition(): Vector2 {
    return this.miniAtomMVT.viewToModelPosition( this.getRandomEscapePosition() );
  }

  private animateAndRemoveMiniAtomParticle( particle: Particle, destination?: Vector2 ): void {
    this.model.outgoingParticles.add( particle );
    const particleView = this.findParticleView( particle );
    particleView.inputEnabled = false;

    if ( destination ) {
      particle.destinationProperty.value = destination;

      particle.animationEndedEmitter.addListener( () => {
        this.model.removeDecayingMiniParticle( particle );
      } );
    }
    else {
      this.model.removeDecayingMiniParticle( particle );
    }
  }

  /**
   * Removes a nucleon from the nucleus and animates it out of view.
   */
  public override emitNucleon( particleType: ParticleType, fromDecay?: string ): Particle {
    this.decaying = true;

    // Handle the animation for the mini ParticleAtom
    const miniNucleon = this.model.miniParticleAtom.extractParticle( particleType.particleTypeString );

    // animate the particle to a random destination outside the model
    const destination = this.getRandomExternalModelPosition();
    const totalDistanceParticleTravels = miniNucleon.positionProperty.value.distance( destination );
    const animationDuration = totalDistanceParticleTravels / miniNucleon.animationVelocityProperty.value;

    this.model.miniParticleAtom.reconfigureNucleus();
    this.animateAndRemoveMiniAtomParticle( miniNucleon, destination );

    // Fade away the nucleon in the ParticleNucleus
    const shellNucleusNucleon = this.fadeOutShellNucleon( particleType, animationDuration, fromDecay );

    this.decaying = false;

    return shellNucleusNucleon;
  }

  private fadeOutShellNucleon( particleType: ParticleType, animationDuration: number, fromDecay?: string ): Particle {
    const shellNucleusNucleon = super.emitNucleon( particleType, fromDecay );
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

    return shellNucleusNucleon;
  }

  public override getParticleAtom(): ParticleAtom {
    return this.model.miniParticleAtom;
  }

  public override removeAlphaParticle( particle: Particle ): void {
    this.animateAndRemoveMiniAtomParticle( particle );
  }

  public override addOutgoingParticle( particle: Particle ): void {
    // no need to add the outgoing particle because that's done in a subclass
  }

  /**
   * Creates an alpha particle by removing the needed nucleons from the nucleus, arranging them, and then animates the
   * particle out of view.
   */
  protected override emitAlphaParticle(): EmitAlphaParticleValues {

    this.decaying = true;

    // animate mini particle atom
    const values = super.emitAlphaParticle();
    const animationDuration = values.animationDuration;
    this.model.miniParticleAtom.reconfigureNucleus();


    // animate nucleons in NucleonShellView
    _.times( NUMBER_OF_PROTONS_IN_ALPHA_PARTICLE, () => this.fadeOutShellNucleon( ParticleType.PROTON, animationDuration ) );
    _.times( NUMBER_OF_NEUTRONS_IN_ALPHA_PARTICLE, () => this.fadeOutShellNucleon( ParticleType.NEUTRON, animationDuration ) );

    this.decaying = false;

    return values;
  }

  protected override betaDecayMiniFunction( particle: Particle ): void {
    this.createMiniParticleView( particle );
  }

  /**
   * Changes the nucleon type of a particle in the atom and emits an electron or positron from behind that particle.
   */
  protected override betaDecay( betaDecayType: DecayType ): BetaDecayReturnValues {
    this.decaying = true;

    // animate mini particleAtom
    const values = super.betaDecay( betaDecayType );
    const particleToEmit = values.particleToEmit;
    const destination = values.destination;
    const closestParticle = values.closestParticle;
    const nucleonTypeToChange = values.nucleonTypeToChange;
    const newNucleonType = values.newNucleonType;

    // add the particle to the model to emit it, then change the nucleon type and remove the particle
    const initialColorChangeAnimation = this.model.miniParticleAtom.changeNucleonType( closestParticle, () => {

      // TODO: particle disappears inside devBounds, https://github.com/phetsims/build-a-nucleus/issues/97
      this.animateAndRemoveMiniAtomParticle( particleToEmit, destination );
      this.checkIfCreatorNodesShouldBeVisibleOrInvisible();
    } );
    this.model.particleAnimations.add( initialColorChangeAnimation );

    // animate the shell view
    const totalDistanceParticleTravels = particleToEmit.positionProperty.value.distance( destination );
    const animationDuration = totalDistanceParticleTravels / particleToEmit.animationVelocityProperty.value;
    this.fadeOutShellNucleon( nucleonTypeToChange, animationDuration, betaDecayType.name );

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

    this.decaying = false;

    return values;
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
}

buildANucleus.register( 'ChartIntroScreenView', ChartIntroScreenView );
export default ChartIntroScreenView;
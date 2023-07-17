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
import { Line, Node, Rectangle, RichText } from '../../../../scenery/js/imports.js';
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
import BANParticle from '../../common/model/BANParticle.js';

// types
export type NuclideChartIntroScreenViewOptions = BANScreenViewOptions;

// constants
const CHART_VERTICAL_MARGINS = 10;
const NUMBER_OF_PROTONS_IN_ALPHA_PARTICLE = 2;
const NUMBER_OF_NEUTRONS_IN_ALPHA_PARTICLE = 2;

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
            const particleView = this.findParticleView( particle );
            delete this.particleViewMap[ particleView.particle.id ];

            particleView.dispose();
            particle.dispose();
            model.miniParticleAtom.reconfigureNucleus();
          }
        } );
      }
    };
    model.particleAtom.protonCountProperty.link( protonCount => nucleonCountListener( protonCount, ParticleType.PROTON ) );
    model.particleAtom.neutronCountProperty.link( neutronCount => nucleonCountListener( neutronCount, ParticleType.NEUTRON ) );
    const particleAtomNodeCenter = this.particleAtomNode.center;
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
    const nuclearShellModelText = new RichText( BuildANucleusStrings.nuclearShellModel, { font: BANConstants.REGULAR_FONT } );
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
    const energyText = new RichText( BuildANucleusStrings.energy, { font: BANConstants.REGULAR_FONT } );
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

    // TODO: use align group to match width's of accordion box and periodic table https://github.com/phetsims/build-a-nucleus/issues/93
    const nuclideChartAccordionBox = new NuclideChartAccordionBox( this.model.particleAtom.protonCountProperty,
      this.model.particleAtom.neutronCountProperty, this.periodicTableAndIsotopeSymbol.width,
      this.model.selectedNuclideChartProperty, this.model.decayEquationModel, this.decayAtom.bind( this ) );
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

  private getRandomExternalModelPosition(): Vector2 {
    return this.miniAtomMVT.viewToModelPosition( this.getRandomEscapePosition() );
  }

  private removeMiniAtomParticle( miniNucleon: Particle, miniParticleView: ParticleView ): void {
    this.model.outgoingParticles.remove( miniNucleon );
    delete this.particleViewMap[ miniParticleView.particle.id ];

    miniParticleView.dispose();
    miniNucleon.dispose();
  }

  private animateAndRemoveMiniAtomParticle( miniNucleon: Particle, destination?: Vector2 ): void {
    this.model.outgoingParticles.add( miniNucleon );
    const miniParticleView = this.findParticleView( miniNucleon );
    miniParticleView.inputEnabled = false;

    if ( destination ) {
      miniNucleon.destinationProperty.value = destination;

      miniNucleon.animationEndedEmitter.addListener( () => {
        this.removeMiniAtomParticle( miniNucleon, miniParticleView );
      } );
    }
    else {
      this.removeMiniAtomParticle( miniNucleon, miniParticleView );
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
      duration: animationDuration,
      easing: Easing.LINEAR
    } );
    fadeAnimation.endedEmitter.addListener( () => {
      this.removeParticle( shellNucleusNucleon );
    } );
    this.model.particleAnimations.push( fadeAnimation );
    fadeAnimation.start();

    return shellNucleusNucleon;
  }

  /**
   * Creates an alpha particle by removing the needed nucleons from the nucleus, arranging them, and then animates the
   * particle out of view.
   */
  protected emitAlphaParticle(): void {

    this.decaying = true;

    // animate mini particle atom
    assert && assert( this.model.miniParticleAtom.protonCountProperty.value >= 2 &&
    this.model.miniParticleAtom.neutronCountProperty.value >= 2,
      'The particleAtom needs 2 protons and 2 neutrons to emit an alpha particle.' );

    // get the protons and neutrons closest to the center of the particleAtom
    const protonsToRemove = _.sortBy( [ ...this.model.miniParticleAtom.protons ], proton =>
      proton.positionProperty.value.distance( this.model.miniParticleAtom.positionProperty.value ) )
      .slice( 0, NUMBER_OF_PROTONS_IN_ALPHA_PARTICLE );
    const neutronsToRemove = _.sortBy( [ ...this.model.miniParticleAtom.neutrons ],
      neutron => neutron.positionProperty.value.distance( this.model.miniParticleAtom.positionProperty.value ) )
      .slice( 0, NUMBER_OF_NEUTRONS_IN_ALPHA_PARTICLE );

    // create and add the alpha particle node
    const alphaParticle = new ParticleAtom();

    // remove the obtained protons and neutrons from the particleAtom and add them to the alphaParticle
    [ ...protonsToRemove, ...neutronsToRemove ].forEach( nucleon => {
      this.model.miniParticleAtom.removeParticle( nucleon );
      alphaParticle.addParticle( nucleon );
    } );

    // ensure the creator nodes are visible since particles are being removed from the particleAtom
    alphaParticle.moveAllParticlesToDestination();
    this.checkIfCreatorNodesShouldBeVisible();

    alphaParticle.protons.forEach( proton => {
      this.findParticleView( proton ).inputEnabled = false;
    } );
    alphaParticle.neutrons.forEach( neutron => {
      this.findParticleView( neutron ).inputEnabled = false;
    } );

    // animate the particle to a random destination outside the model
    const destination = this.getRandomExternalModelPosition();
    const totalDistanceAlphaParticleTravels = alphaParticle.positionProperty.value.distance( destination );

    // ParticleAtom doesn't have the same animation, like Particle.animationVelocityProperty
    const animationDuration = totalDistanceAlphaParticleTravels / BANConstants.PARTICLE_ANIMATION_SPEED;

    const alphaParticleEmissionAnimation = new Animation( {
      property: alphaParticle.positionProperty,
      to: destination,
      duration: animationDuration,
      easing: Easing.LINEAR
    } );
    this.model.particleAnimations.push( alphaParticleEmissionAnimation );

    alphaParticleEmissionAnimation.finishEmitter.addListener( () => {
      alphaParticle.neutrons.forEach( neutron => {
        this.animateAndRemoveMiniAtomParticle( neutron );
      } );
      alphaParticle.protons.forEach( proton => {
        this.animateAndRemoveMiniAtomParticle( proton );
      } );
      alphaParticle.dispose();
    } );
    alphaParticleEmissionAnimation.start();
    this.model.miniParticleAtom.reconfigureNucleus();


    // animate nucleons in NucleonShellView
    _.times( NUMBER_OF_PROTONS_IN_ALPHA_PARTICLE, () => this.fadeOutShellNucleon( ParticleType.PROTON, animationDuration ) );
    _.times( NUMBER_OF_NEUTRONS_IN_ALPHA_PARTICLE, () => this.fadeOutShellNucleon( ParticleType.NEUTRON, animationDuration ) );

    this.decaying = false;
  }

  /**
   * Changes the nucleon type of a particle in the atom and emits an electron or positron from behind that particle.
   */
  protected betaDecay( betaDecayType: DecayType ): void {
    this.decaying = true;

    // animate mini particleAtom
    let particleArray;
    let particleToEmit: Particle;
    let nucleonTypeCountValue;
    let nucleonTypeToChange;
    let newNucleonType;
    if ( betaDecayType === DecayType.BETA_MINUS_DECAY ) {
      particleArray = this.model.miniParticleAtom.neutrons;
      particleToEmit = new BANParticle( ParticleType.ELECTRON.particleTypeString );
      nucleonTypeCountValue = this.model.miniParticleAtom.neutronCountProperty.value;
      nucleonTypeToChange = ParticleType.NEUTRON;
      newNucleonType = ParticleType.PROTON;
    }
    else {
      particleArray = this.model.miniParticleAtom.protons;
      particleToEmit = new BANParticle( ParticleType.POSITRON.particleTypeString );
      nucleonTypeCountValue = this.model.miniParticleAtom.protonCountProperty.value;
      nucleonTypeToChange = ParticleType.PROTON;
      newNucleonType = ParticleType.NEUTRON;
    }

    this.model.outgoingParticles.add( particleToEmit );
    this.createMiniParticleView( particleToEmit );
    assert && assert( nucleonTypeCountValue >= 1,
      'The particleAtom needs a ' + nucleonTypeToChange.name + ' for a ' + betaDecayType.name );

    // the particle that will change its nucleon type will be the one closest to the center of the atom
    const closestParticle = _.sortBy( [ ...particleArray ],
      closestParticle => closestParticle.positionProperty.value.distance( this.model.miniParticleAtom.positionProperty.value ) ).shift()!;

    // place the particleToEmit in the same position and behind the particle that is changing its nucleon type
    particleToEmit.positionProperty.value = closestParticle.positionProperty.value;
    particleToEmit.zLayerProperty.value = closestParticle.zLayerProperty.value + 1;

    const destination = this.getRandomExternalModelPosition();

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
    this.fadeOutShellNucleon( nucleonTypeToChange, animationDuration );

    const particle = this.createParticleFromStack( newNucleonType );

    // place particle right beside its destination so that animationEndedEmitter fires
    particle.positionProperty.value = particle.destinationProperty.value.plusXY( 0.000001, 0.000001 );
    const particleView = this.findParticleView( particle );
    particleView.opacityProperty.value = 0;
    const fadeAnimation = new Animation( {
      property: particleView.opacityProperty,
      to: 1,
      duration: animationDuration,
      easing: Easing.LINEAR
    } );
    this.model.particleAnimations.push( fadeAnimation );
    fadeAnimation.start();

    this.decaying = false;
  }

  private createMiniParticleView( miniParticle: Particle ): void {
    this.particleViewMap[ miniParticle.id ] = new ParticleView( miniParticle, this.miniAtomMVT, { inputEnabled: false } );
    this.particleAtomNode.addParticleView( miniParticle );
  }
}

buildANucleus.register( 'ChartIntroScreenView', ChartIntroScreenView );
export default ChartIntroScreenView;
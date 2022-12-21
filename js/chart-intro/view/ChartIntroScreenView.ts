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
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PeriodicTableAndIsotopeSymbol from './PeriodicTableAndIsotopeSymbol.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import { Color, Line, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import BANConstants from '../../common/BANConstants.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import BANColors from '../../common/BANColors.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import NuclideChartNode from './NuclideChartNode.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import NucleonShellView from './NucleonShellView.js';

// types
export type NuclideChartIntroScreenViewOptions = BANScreenViewOptions;

class ChartIntroScreenView extends BANScreenView<ChartIntroModel> {

  private readonly periodicTableAndIsotopeSymbol: PeriodicTableAndIsotopeSymbol;

  public constructor( model: ChartIntroModel, providedOptions?: NuclideChartIntroScreenViewOptions ) {

    const modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      new Vector2( BANConstants.SCREEN_VIEW_ATOM_CENTER_X, 388 ),
      1.0 );

    const options = optionize<NuclideChartIntroScreenViewOptions, EmptySelfOptions, BANScreenViewOptions>()( {

      particleViewMVT: ModelViewTransform2.createSinglePointScaleMapping( Vector2.ZERO, new Vector2( 140, 388 ), 1.0 ), // bottom left corner of proton energy levels
      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( model, modelViewTransform, options );

    this.model = model;

    // create and add the periodic table and symbol
    this.periodicTableAndIsotopeSymbol = new PeriodicTableAndIsotopeSymbol( model.particleAtom );
    this.periodicTableAndIsotopeSymbol.top = this.nucleonCountPanel.top;
    this.periodicTableAndIsotopeSymbol.right = this.resetAllButton.right;
    this.addChild( this.periodicTableAndIsotopeSymbol );

    // update the cloud size as the massNumber changes
    model.particleAtom.protonCountProperty.link( protonCount => this.updateCloudSize( protonCount, 0.65, 10, 20 ) );

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
    nuclearShellModelText.centerY = this.periodicTableAndIsotopeSymbol.bottom;

    // create the 'highlight' text behind 'Nuclear Shell Model' text
    const nuclearShellModelTextHighlight = new Rectangle( nuclearShellModelText.bounds.dilateXY( 15, 5 ), {
      fill: BANColors.shellModelTextHighlightColorProperty,
      centerX: this.doubleArrowButtons.centerX,
      centerY: this.periodicTableAndIsotopeSymbol.bottom,
      cornerRadius: 10
    } );

    // place highlight behind the text
    this.addChild( nuclearShellModelTextHighlight );
    this.addChild( nuclearShellModelText );

    // create and add the 'Energy' label
    const energyText = new RichText( BuildANucleusStrings.energy, { font: BANConstants.REGULAR_FONT } );
    energyText.rotate( -Math.PI / 2 );
    energyText.left = this.nucleonCountPanel.left;
    energyText.centerY = this.layoutBounds.centerY;
    this.addChild( energyText );

    // create and add the 'Energy' arrow
    const energyTextDistanceFromArrow = 10;
    const arrow = new ArrowNode( energyText.right + energyTextDistanceFromArrow, this.protonArrowButtons.top - 30,
      energyText.right + energyTextDistanceFromArrow, this.periodicTableAndIsotopeSymbol.bottom + 15, { tailWidth: 2 } );
    this.addChild( arrow );

    // create and add dashed 'zoom' lines
    // TODO: position based on the small atom
    const dashedLineOptions = { stroke: Color.BLACK, lineDash: [ 6, 3 ] };
    const leftDashedLine = new Line( this.protonArrowButtons.left, arrow.top, this.doubleArrowButtons.left,
      this.periodicTableAndIsotopeSymbol.centerY, dashedLineOptions );
    this.addChild( leftDashedLine );
    const rightDashedLine = new Line( this.neutronArrowButtons.right, arrow.top, this.doubleArrowButtons.right,
      this.periodicTableAndIsotopeSymbol.centerY, dashedLineOptions );
    this.addChild( rightDashedLine );

    // add energy level node
    const protonEnergyLevelNode = new NucleonShellView( model.particleAtom.protonShellPositions,
      { x: this.protonArrowButtons.left, y: arrow.top + 20 } );
    this.addChild( protonEnergyLevelNode );
    const neutronEnergyLevelNode = new NucleonShellView( model.particleAtom.neutronShellPositions,
      { x: this.protonArrowButtons.left + BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS, y: arrow.top + 20 } );
    this.addChild( neutronEnergyLevelNode );

    const nuclideChartNode = new NuclideChartNode( model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty );
    const nuclideChartNodeAccordionBox = new AccordionBox( nuclideChartNode, {
      titleNode: new Text( BuildANucleusStrings.partialNuclideChart, {
        font: BANConstants.REGULAR_FONT,
        maxWidth: 200
      } ),
      fill: Color.white,
      minWidth: this.periodicTableAndIsotopeSymbol.width,
      contentYSpacing: 0,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        sideLength: 18
      },
      titleAlignX: 'left',
      stroke: BANConstants.PANEL_STROKE,
      cornerRadius: BANConstants.PANEL_CORNER_RADIUS
    } );
    nuclideChartNodeAccordionBox.top = this.periodicTableAndIsotopeSymbol.bottom + 5;
    nuclideChartNodeAccordionBox.left = this.periodicTableAndIsotopeSymbol.left;
    this.addChild( nuclideChartNodeAccordionBox );

    // add the particleViewLayerNode after everything else so particles are in the top layer
    this.addChild( this.particleViewLayerNode );

    // only show the emptyAtomCircle when there are zero nucleons
    Multilink.multilink( [ this.model.particleAtom.protonCountProperty, this.model.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => {
        this.emptyAtomCircle.visible = ( protonCount + neutronCount ) === 0;
      } );
  }

  /**
   * Returns whether the nucleon is within a rectangular capture radius defined by the left edge of the proton arrow
   * buttons, the right edge of the neutron arrow buttons, below the periodic table, and above the arrow buttons.
   */
  // TODO: create Energy 'play area' node that would define bounds of capture area
  protected override isNucleonInCaptureArea( nucleon: Particle, atom: ParticleAtom ): boolean {
    const nucleonViewPosition = this.modelViewTransform.modelToViewPosition( nucleon.positionProperty.value );
    return nucleonViewPosition.y < ( this.doubleArrowButtons.top - 30 ) && // capture area is a bit above arrow buttons
           nucleonViewPosition.y > this.periodicTableAndIsotopeSymbol.bottom &&
           nucleonViewPosition.x > this.protonArrowButtons.left &&
           nucleonViewPosition.x < this.neutronArrowButtons.right;
  }
}

buildANucleus.register( 'ChartIntroScreenView', ChartIntroScreenView );
export default ChartIntroScreenView;
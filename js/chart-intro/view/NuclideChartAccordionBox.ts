// Copyright 2023, University of Colorado Boulder

/**
 * Node that holds Nuclide Chart and Zoom-in nuclide chart view.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import NuclideChartAndNumberLines from './NuclideChartAndNumberLines.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import NuclideChartLegendNode from './NuclideChartLegendNode.js';
import { SelectedChartType } from '../model/ChartIntroModel.js';
import BANConstants from '../../common/BANConstants.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Range from '../../../../dot/js/Range.js';
import FocusedNuclideChartNode from './FocusedNuclideChartNode.js';
import ZoomInNuclideChartNode from './ZoomInNuclideChartNode.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import DecayEquationNode from './DecayEquationNode.js';
import DecayEquationModel from '../model/DecayEquationModel.js';
import BANColors from '../../common/BANColors.js';
import DecayType from '../../common/model/DecayType.js';
import buildANucleus from '../../buildANucleus.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ReturnButton from '../../../../scenery-phet/js/buttons/ReturnButton.js';
import BANScreenView from '../../common/view/BANScreenView.js';

type NuclideChartAccordionBoxOptions = AccordionBoxOptions;

class NuclideChartAccordionBox extends AccordionBox {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      selectedNuclideChartProperty: TReadOnlyProperty<SelectedChartType>,
                      decayEquationModel: DecayEquationModel, decayAtom: ( decayType: DecayType | null ) => void,
                      showMagicNumbersProperty: TReadOnlyProperty<boolean>,
                      hasIncomingParticlesProperty: TReadOnlyProperty<boolean>,
                      undoDecay: VoidFunction,
                      providedOptions?: NuclideChartAccordionBoxOptions ) {

    const options =
      optionize<NuclideChartAccordionBoxOptions, EmptySelfOptions, AccordionBoxOptions>()( {
        titleNode: new Text( BuildANucleusStrings.partialNuclideChartStringProperty, {
          font: BANConstants.REGULAR_FONT,
          maxWidth: 200
        } ),
        fill: BANColors.chartAccordionBoxBackgroundColorProperty,
        contentYSpacing: 0,
        buttonXMargin: 10,
        buttonYMargin: 10,
        expandCollapseButtonOptions: {
          sideLength: 18
        },
        titleAlignX: 'left',
        stroke: BANColors.panelStrokeColorProperty,
        cornerRadius: BANConstants.PANEL_CORNER_RADIUS
      }, providedOptions );

    // Create the ChartTransform's for all 3 charts.
    const partialChartTransform = NuclideChartAccordionBox.getChartTransform( 18 );
    const focusedChartTransform = NuclideChartAccordionBox.getChartTransform( 10 );
    const zoomInChartTransform = NuclideChartAccordionBox.getChartTransform( 30 );

    // Create the 3 charts.
    const nuclideChartAndNumberLines = new NuclideChartAndNumberLines(
      protonCountProperty, neutronCountProperty, partialChartTransform, {
        nuclideChartNodeOptions: {
          showMagicNumbersProperty: showMagicNumbersProperty
        }
      } );
    const focusedNuclideChartNode = new FocusedNuclideChartNode(
      protonCountProperty, neutronCountProperty, focusedChartTransform, showMagicNumbersProperty );
    const zoomInNuclideChartNode = new ZoomInNuclideChartNode(
      protonCountProperty, neutronCountProperty, zoomInChartTransform, showMagicNumbersProperty );

    // Create the legend node.
    const nuclideChartLegendNode = new NuclideChartLegendNode();

    // Create the DecayEquationNode.
    const decayEquationNode = new DecayEquationNode( decayEquationModel, zoomInNuclideChartNode.width / 2 );

    // Create the 'Decay' button.
    const decayButton = new TextPushButton( BuildANucleusStrings.screen.decayStringProperty, {
      enabledProperty: new DerivedProperty( [
        decayEquationModel.currentCellModelProperty,
        hasIncomingParticlesProperty
      ], ( currentCellModel, hasIncomingParticles ) =>

        // Enable the decay button if there is a decay type for the given cell and there are no incoming particles.
        !!currentCellModel?.decayType && !hasIncomingParticles ),
      baseColor: BANColors.decayButtonColorProperty,
      textNodeOptions: {
        fontSize: 14
      },
      minWidth: 80,
      maxWidth: 115,
      listener: () => {

        // Do the given decay on the atom, if there is a decay.
        const decayType = decayEquationModel.currentCellModelProperty.value?.decayType;
        decayAtom( decayType || null );

        // Must be last so that if anything changes in the sim afterward, it is set to invisible again.
        undoDecayButton.visible = true;
      }
    } );

    // Create and add the undo decay button.
    const undoDecayButton = new ReturnButton( {
      iconOptions: { scale: 0.7 },
      visible: false,
      listener: () => {
        undoDecay();
      }
    } );
    BANScreenView.hideUndoButtonEmitter.addListener( () => { undoDecayButton.visible = false; } );

    // Position the focused chart and the decay button together.
    const focusedChartAndButtonVBox = new VBox( {
      children: [
        new HBox( { children: [ undoDecayButton, decayButton ], spacing: 5, excludeInvisibleChildrenFromBounds: false } ),
        focusedNuclideChartNode
      ],
      spacing: 10,
      align: 'center'
    } );

    // Update the view in the accordion box depending on the selectedNuclideChartProperty.
    selectedNuclideChartProperty.link( selectedNuclideChart => {

      zoomInNuclideChartNode.visible = selectedNuclideChart === 'zoom';
      focusedChartAndButtonVBox.visible = selectedNuclideChart === 'zoom';
      decayEquationNode.visible = selectedNuclideChart === 'zoom';

      nuclideChartAndNumberLines.visible = selectedNuclideChart === 'partial';
    } );

    const chartsHBox = new HBox( {
      children: [

        // It is important that the zoom in chart is the first child! Changing wisely only after seeing the positioning
        // done for the "Stable" text in the DecayEquationNode.
        zoomInNuclideChartNode,
        nuclideChartAndNumberLines,
        focusedChartAndButtonVBox
      ],
      spacing: 10,
      align: 'top',
      excludeInvisibleChildrenFromBounds: true
    } );
    const contentVBox = new VBox( {
      children: [
        decayEquationNode,
        chartsHBox,
        nuclideChartLegendNode
      ],

      // Left align is important! Change wisely only after seeing the positioning done for the "Stable" text in the
      // DecayEquationNode.
      align: 'left',
      spacing: 10,
      excludeInvisibleChildrenFromBounds: true
    } );

    super( contentVBox, options );
  }

  /**
   * Create and return a ChartTransform and scale its view using the given scaleFactor.
   */
  public static getChartTransform( scaleFactor: number ): ChartTransform {
    const modelXRange = new Range( BANConstants.CHART_MIN, BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS );
    const modelYRange = new Range( BANConstants.CHART_MIN, BANConstants.CHART_MAX_NUMBER_OF_PROTONS );
    return new ChartTransform( {
      viewWidth: modelXRange.getLength() * scaleFactor,
      modelXRange: modelXRange,
      viewHeight: modelYRange.getLength() * scaleFactor,
      modelYRange: modelYRange
    } );
  }

  public override reset(): void {
    super.reset();
    BANScreenView.hideUndoButtonEmitter.emit();
  }
}

buildANucleus.register( 'NuclideChartAccordionBox', NuclideChartAccordionBox );
export default NuclideChartAccordionBox;
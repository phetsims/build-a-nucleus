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
import { RichText } from '../../../../scenery/js/imports.js';
import BANConstants from '../../common/BANConstants.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';

// types
export type NuclideChartIntroScreenViewOptions = BANScreenViewOptions;

class ChartIntroScreenView extends BANScreenView<ChartIntroModel> {

  private readonly periodicTableAndIsotopeSymbol: PeriodicTableAndIsotopeSymbol;

  public constructor( model: ChartIntroModel, providedOptions?: NuclideChartIntroScreenViewOptions ) {

    const options = optionize<NuclideChartIntroScreenViewOptions, EmptySelfOptions, BANScreenViewOptions>()( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( model, options );

    this.model = model;

    // update the cloud size as the massNumber changes
    model.particleAtom.protonCountProperty.link( protonCount => this.updateCloudSize( protonCount, 0.65, 10, 20 ) );

    this.elementName.centerX = this.doubleArrowButtons.centerX;
    this.elementName.top = this.nucleonCountPanel.top;

    // Hook up update listeners.
    Multilink.multilink( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty, model.doesNuclideExistBooleanProperty ],
      ( protonCount: number, neutronCount: number, doesNuclideExist: boolean ) =>
        BANScreenView.updateElementName( this.elementName, protonCount, neutronCount, doesNuclideExist,
          this.doubleArrowButtons.centerX )
    );

    // create and add the periodic table and symbol
    this.periodicTableAndIsotopeSymbol = new PeriodicTableAndIsotopeSymbol( model.particleAtom );
    this.addChild( this.periodicTableAndIsotopeSymbol );

    // create and add the 'Energy' label
    const energyText = new RichText( BuildANucleusStrings.energy, { font: BANConstants.REGULAR_FONT } );
    energyText.rotate( -Math.PI / 2 );
    this.addChild( energyText );

    this.periodicTableAndIsotopeSymbol.top = this.nucleonCountPanel.top;
    this.periodicTableAndIsotopeSymbol.right = this.resetAllButton.right;

    this.nucleonCountPanel.left = this.layoutBounds.left + 20;
    energyText.left = this.nucleonCountPanel.left;
    energyText.centerY = this.layoutBounds.centerY;

    const energyTextDistanceFromArrow = 10;
    const arrow = new ArrowNode( energyText.right + energyTextDistanceFromArrow, this.protonArrowButtons.top - 30,
      energyText.right + energyTextDistanceFromArrow, this.periodicTableAndIsotopeSymbol.bottom + 15, { tailWidth: 2 } );
    this.addChild( arrow );

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
  // TODO: Remove atom if not used
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
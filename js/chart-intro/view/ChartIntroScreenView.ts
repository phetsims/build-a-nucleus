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
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ParticleType from '../../common/view/ParticleType.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PeriodicTableAndIsotopeSymbol from './PeriodicTableAndIsotopeSymbol.js';

// constants
const NUCLEON_CAPTURE_RADIUS = 100;

// types
export type NuclideChartIntroScreenViewOptions = BANScreenViewOptions;

class ChartIntroScreenView extends BANScreenView<ChartIntroModel> {

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
    const periodicTableAndIsotopeSymbol = new PeriodicTableAndIsotopeSymbol( model.particleAtom );
    this.addChild( periodicTableAndIsotopeSymbol );
    periodicTableAndIsotopeSymbol.top = this.nucleonCountPanel.top;
    periodicTableAndIsotopeSymbol.right = this.resetAllButton.right;

    this.nucleonCountPanel.left = this.layoutBounds.left + 20;

    // only show the emptyAtomCircle when there are zero nucleons
    Multilink.multilink( [ this.model.particleAtom.protonCountProperty, this.model.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => {
        this.emptyAtomCircle.visible = ( protonCount + neutronCount ) === 0;
      } );
  }

  /**
   * Define a function that will decide where to put nucleons.
   */
  protected override dragEndedListener( nucleon: Particle, atom: ParticleAtom ): void {
    // TODO: change to the energy level positioning
    const particleCreatorNodeCenter = nucleon.type === ParticleType.PROTON.name.toLowerCase() ?
                                      this.protonsCreatorNode.center : this.neutronsCreatorNode.center;

    if ( nucleon.positionProperty.value.distance( atom.positionProperty.value ) < NUCLEON_CAPTURE_RADIUS ||

         // if removing the nucleon will create a nuclide that does not exist, re-add the nucleon to the atom
         ( ( this.model.particleAtom.protonCountProperty.value + this.model.particleAtom.neutronCountProperty.value ) !== 0 &&
           !AtomIdentifier.doesExist( this.model.particleAtom.protonCountProperty.value, this.model.particleAtom.neutronCountProperty.value )
         )
    ) {
      atom.addParticle( nucleon );
    }

    // only animate the removal of a nucleon if it was dragged out of the creator node
    else if ( nucleon.positionProperty.value.distance( particleCreatorNodeCenter ) > 10 ) {
      this.animateAndRemoveParticle( nucleon, this.modelViewTransform.viewToModelPosition( particleCreatorNodeCenter ) );
    }
  }
}

buildANucleus.register( 'ChartIntroScreenView', ChartIntroScreenView );
export default ChartIntroScreenView;
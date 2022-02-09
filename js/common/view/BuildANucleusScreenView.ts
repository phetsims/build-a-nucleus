// Copyright 2022, University of Colorado Boulder

/**
 * ScreenView class that the 'Decay' and 'Nuclide Chart' will extend.
 *
 * @author Luisa Vargas
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusConstants from '../../common/BuildANucleusConstants.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BuildANucleusModel from '../model/BuildANucleusModel.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import { VBox } from '../../../../scenery/js/imports.js';
import BuildANucleusColors from '../BuildANucleusColors.js';
import NucleonCountPanel from './NucleonCountPanel.js';
import merge from '../../../../phet-core/js/merge.js';

// types
type BuildANucleusScreenViewSelfOptions = {};
export type BuildANucleusScreenViewOptions =
  BuildANucleusScreenViewSelfOptions
  & PhetioObjectOptions
  & Required<Pick<PhetioObjectOptions, 'tandem'>>;

class BuildANucleusScreenView extends ScreenView {

  constructor( model: BuildANucleusModel, providedOptions?: BuildANucleusScreenViewOptions ) {

    const options = optionize<BuildANucleusScreenViewOptions, BuildANucleusScreenViewSelfOptions, PhetioObjectOptions>( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

    const nucleonCountPanel = new NucleonCountPanel( model.protonCountProperty, model.neutronCountProperty );
    nucleonCountPanel.top = this.layoutBounds.minY + BuildANucleusConstants.SCREEN_VIEW_Y_MARGIN;
    nucleonCountPanel.left = this.layoutBounds.maxX - 200;
    this.addChild( nucleonCountPanel );

    // arrow button options
    const arrowButtonConfig = {
      arrowWidth: 14,  // empirically determined
      arrowHeight: 14, // empirically determined
      spacing: 7      // empirically determined
    };

    // create the arrow buttons, which change the value of protonCountProperty by -1 or +1
    const protonArrowButtonConfig = merge( arrowButtonConfig, { arrowFill: BuildANucleusColors.protonColorProperty } );
    const protonUpArrowButton = new ArrowButton( 'up', () => {
      model.protonCountProperty.value =
        Math.min( model.protonCountProperty.range!.max, model.protonCountProperty.value + 1 );
    }, protonArrowButtonConfig );
    const protonDownArrowButton = new ArrowButton( 'down', () => {
      model.protonCountProperty.value =
        Math.max( model.protonCountProperty.range!.min, model.protonCountProperty.value - 1 );
    }, protonArrowButtonConfig );
    const protonArrowButtons = new VBox( {
      children: [ protonUpArrowButton, protonDownArrowButton ],
      spacing: protonArrowButtonConfig.spacing
    } );
    protonArrowButtons.bottom = this.layoutBounds.maxY - BuildANucleusConstants.SCREEN_VIEW_Y_MARGIN;
    protonArrowButtons.left = this.layoutBounds.minX + 50;
    this.addChild( protonArrowButtons );

    // create the arrow buttons, which change the value of neutronCountProperty by -1 or +1
    const neutronArrowButtonConfig = merge( arrowButtonConfig, { arrowFill: BuildANucleusColors.neutronColorProperty } );
    const neutronUpArrowButton = new ArrowButton( 'up', () => {
      model.neutronCountProperty.value =
        Math.min( model.neutronCountProperty.range!.max, model.neutronCountProperty.value + 1 );
    }, neutronArrowButtonConfig );
    const neutronDownArrowButton = new ArrowButton( 'down', () => {
      model.neutronCountProperty.value =
        Math.max( model.neutronCountProperty.range!.min, model.neutronCountProperty.value - 1 );
    }, neutronArrowButtonConfig );
    const neutronArrowButtons = new VBox( {
      children: [ neutronUpArrowButton, neutronDownArrowButton ],
      spacing: neutronArrowButtonConfig.spacing
    } );
    neutronArrowButtons.bottom = this.layoutBounds.maxY - BuildANucleusConstants.SCREEN_VIEW_Y_MARGIN;
    neutronArrowButtons.left = ( this.layoutBounds.maxX - this.layoutBounds.minX ) / 2;
    this.addChild( neutronArrowButtons );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - BuildANucleusConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - BuildANucleusConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // disable the arrow buttons when the protonCountProperty or the neutronCountProperty values are at its min or max range
    const protonCountPropertyObserver = ( protonCount: number ) => {
      protonUpArrowButton.enabled = protonCount !== model.protonCountProperty.range!.max;
      protonDownArrowButton.enabled = protonCount !== model.protonCountProperty.range!.min;
    };
    model.protonCountProperty.link( protonCountPropertyObserver );
    const neutronCountPropertyObserver = ( neutronCount: number ) => {
      neutronUpArrowButton.enabled = neutronCount !== model.neutronCountProperty.range!.max;
      neutronDownArrowButton.enabled = neutronCount !== model.neutronCountProperty.range!.min;
    };
    model.neutronCountProperty.link( neutronCountPropertyObserver );
  }

  public reset(): void {
    //TODO
  }

  /**
   * @param {number} dt - time step, in seconds
   */
  public step( dt: number ): void {
    //TODO
  }
}

buildANucleus.register( 'BuildANucleusScreenView', BuildANucleusScreenView );
export default BuildANucleusScreenView;
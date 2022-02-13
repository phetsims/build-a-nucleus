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
import BANConstants from '../../common/BANConstants.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANModel from '../model/BANModel.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import { ProfileColorProperty, VBox } from '../../../../scenery/js/imports.js';
import BANColors from '../BANColors.js';
import NucleonCountPanel from './NucleonCountPanel.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';

// types
type BuildANucleusScreenViewSelfOptions = {};
export type BuildANucleusScreenViewOptions =
  BuildANucleusScreenViewSelfOptions
  & PhetioObjectOptions
  & Required<Pick<PhetioObjectOptions, 'tandem'>>;

class BANScreenView extends ScreenView {

  constructor( model: BANModel, providedOptions?: BuildANucleusScreenViewOptions ) {

    const options = optionize<BuildANucleusScreenViewOptions, BuildANucleusScreenViewSelfOptions, PhetioObjectOptions>( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

    const nucleonCountPanel = new NucleonCountPanel( model.protonCountProperty, model.neutronCountProperty );
    nucleonCountPanel.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    nucleonCountPanel.left = this.layoutBounds.maxX - 200;
    this.addChild( nucleonCountPanel );

    // function to create the arrow buttons, which change the value of the nucleonCountProperty by -1 or +1
    const createArrowButtons = ( nucleonCountProperty: NumberProperty, nucleonColorProperty: ProfileColorProperty ): VBox => {
      const arrowButtonConfig = {
        arrowWidth: 14,  // empirically determined
        arrowHeight: 14, // empirically determined
        spacing: 7,      // empirically determined
        arrowFill: nucleonColorProperty
      };
      const upArrowButton = new ArrowButton( 'up', () => {
        nucleonCountProperty.value =
          Math.min( nucleonCountProperty.range!.max, nucleonCountProperty.value + 1 );
      }, arrowButtonConfig );
      const downArrowButton = new ArrowButton( 'down', () => {
        nucleonCountProperty.value =
          Math.max( nucleonCountProperty.range!.min, nucleonCountProperty.value - 1 );
      }, arrowButtonConfig );
      return new VBox( {
        children: [ upArrowButton, downArrowButton ],
        spacing: arrowButtonConfig.spacing
      } );
    };

    // create the arrow buttons
    const protonArrowButtons = createArrowButtons( model.protonCountProperty, BANColors.protonColorProperty );
    protonArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    protonArrowButtons.left = this.layoutBounds.minX + 50;
    this.addChild( protonArrowButtons );
    const neutronArrowButtons = createArrowButtons( model.neutronCountProperty, BANColors.neutronColorProperty );
    neutronArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    neutronArrowButtons.left = ( this.layoutBounds.maxX - this.layoutBounds.minX ) / 2;
    this.addChild( neutronArrowButtons );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // function to create observers that disable the arrow buttons when the nucleonCountProperty values are at its min
    // or max range
    const nucleonCountPropertyObserver = ( nucleonCount: number, nucleonArrowButtons: VBox, nucleonCountProperty: NumberProperty ) => {
      // up arrow button
      nucleonArrowButtons.getChildAt( 0 ).enabled = nucleonCount !== nucleonCountProperty.range!.max;
      // down arrow button
      nucleonArrowButtons.getChildAt( 1 ).enabled = nucleonCount !== nucleonCountProperty.range!.min;
    };
    // create the observers to disable the arrow buttons, see the comment on the observer above
    model.protonCountProperty.link( protonCount => {
      nucleonCountPropertyObserver( protonCount, protonArrowButtons, model.protonCountProperty );
    } );
    model.neutronCountProperty.link( neutronCount => {
      nucleonCountPropertyObserver( neutronCount, neutronArrowButtons, model.neutronCountProperty );
    } );
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

buildANucleus.register( 'BANScreenView', BANScreenView );
export default BANScreenView;
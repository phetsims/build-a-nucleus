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
import { PhetioObjectOptions, RequiredTandem } from '../../../../tandem/js/PhetioObject.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANModel from '../model/BANModel.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import { ProfileColorProperty, VBox } from '../../../../scenery/js/imports.js';
import BANColors from '../BANColors.js';
import NucleonCountPanel from './NucleonCountPanel.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';

// types
type BuildANucleusScreenViewSelfOptions = {};
export type BuildANucleusScreenViewOptions =
  BuildANucleusScreenViewSelfOptions
  & PhetioObjectOptions
  & RequiredTandem;

class BANScreenView extends ScreenView {
  public readonly resetAllButton: ResetAllButton;
  public readonly nucleonCountPanel: NucleonCountPanel;

  constructor( model: BANModel, providedOptions?: BuildANucleusScreenViewOptions ) {

    const options = optionize<BuildANucleusScreenViewOptions, BuildANucleusScreenViewSelfOptions, PhetioObjectOptions>( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

    this.nucleonCountPanel = new NucleonCountPanel( model.protonCountProperty, model.neutronCountProperty );
    this.nucleonCountPanel.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.nucleonCountPanel.left = this.layoutBounds.maxX - 200;
    this.addChild( this.nucleonCountPanel );

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

    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( this.resetAllButton );

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

    // TODO: Fix issue with disabling arrows when moving from larger nuclides to smaller nuclides
    // TODO: Also fix issue when it gets stuck on certain nuclides due to disabling both 'up' arrows
    // function to prevent a user from creating nuclides that do not exist on the chart
    Property.multilink( [ model.protonCountProperty, model.neutronCountProperty ], ( protonCount, neutronCount ) => {
      if ( !AtomIdentifier.doesExist( protonCount, neutronCount ) ) {
        // if on a nuclide that does not exist, check if there are nuclides ahead (next isotones, or isotopes)
        const nextIsotope = AtomIdentifier.getNextExistingIsotope( protonCount, neutronCount );
        const nextIsotone = AtomIdentifier.getNextExistingIsotone( protonCount, neutronCount );

        // if the nextIsotone does not exist, disable the proton up arrow
        if ( !nextIsotone ) {
          protonArrowButtons.getChildAt( 0 ).enabled = false;
        }

        // if the nextIsotope does not exist, disable the neutron up arrow
        if ( !nextIsotope ) {
          neutronArrowButtons.getChildAt( 0 ).enabled = false;
        }
      }
      else {
        // re-enable the up arrow buttons on the nucleons
        protonArrowButtons.getChildAt( 0 ).enabled = protonCount !== model.protonCountProperty.range!.max;
        neutronArrowButtons.getChildAt( 0 ).enabled = neutronCount !== model.neutronCountProperty.range!.max;
      }
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
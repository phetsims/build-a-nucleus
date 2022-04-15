// Copyright 2022, University of Colorado Boulder

/**
 * ScreenView class that the 'Decay' and 'Nuclide Chart' will extend.
 *
 * @author Luisa Vargas
 */

import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANModel from '../model/BANModel.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import { ProfileColorProperty, VBox, Circle, RadialGradient } from '../../../../scenery/js/imports.js';
import BANColors from '../BANColors.js';
import NucleonCountPanel from './NucleonCountPanel.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import DoubleArrowButton, { DoubleArrowButtonDirection } from './DoubleArrowButton.js';
import merge from '../../../../phet-core/js/merge.js';


// empirically determined, from the ElectronCloudView radius
const MIN_NUCLEON_CLOUD_RADIUS = 42.5;
const MAX_NUCLEON_CLOUD_RADIUS = 130;
// types
export type BANScreenViewOptions = ScreenViewOptions & PickRequired<ScreenViewOptions, 'tandem'>;

class BANScreenView extends ScreenView {
  protected readonly electronCloud: Circle;
  static readonly MAX_NUCLEON_CLOUD_RADIUS: number = MAX_NUCLEON_CLOUD_RADIUS;
  static readonly MIN_NUCLEON_CLOUD_RADIUS: number = MIN_NUCLEON_CLOUD_RADIUS;
  public readonly resetAllButton: ResetAllButton;
  public readonly nucleonCountPanel: NucleonCountPanel;

  constructor( model: BANModel, providedOptions?: BANScreenViewOptions ) {

    const options = optionize<BANScreenViewOptions, {}, ScreenViewOptions>( {

      // phet-io options
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

    this.nucleonCountPanel = new NucleonCountPanel( model.protonCountProperty, model.neutronCountProperty );
    this.nucleonCountPanel.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.nucleonCountPanel.left = this.layoutBounds.maxX - 200;
    this.addChild( this.nucleonCountPanel );

    const arrowButtonSpacing = 7; // spacing between the 'up' arrow buttons and 'down' arrow buttons
    const arrowButtonOptions = {
      arrowWidth: 14,
      arrowHeight: 14
    };

    // function to create the listeners the increase or decrease the given nucleon count properties by a value of +1 or -1
    const createIncreaseNucleonCountListener = ( firstNucleonCountProperty: NumberProperty, secondNucleonCountProperty?: NumberProperty ) => {
      firstNucleonCountProperty.value = Math.min( firstNucleonCountProperty.range!.max, firstNucleonCountProperty.value + 1 );
      if ( secondNucleonCountProperty ) {
        secondNucleonCountProperty.value = Math.min( secondNucleonCountProperty.range!.max, secondNucleonCountProperty.value + 1 );
      }
    };
    const createDecreaseNucleonCountListener = ( firstNucleonCountProperty: NumberProperty, secondNucleonCountProperty?: NumberProperty ) => {
      firstNucleonCountProperty.value = Math.max( firstNucleonCountProperty.range!.min, firstNucleonCountProperty.value - 1 );
      if ( secondNucleonCountProperty ) {
        secondNucleonCountProperty.value = Math.max( secondNucleonCountProperty.range!.min, secondNucleonCountProperty.value - 1 );
      }
    };

    // function to create the single arrow buttons
    const createSingleArrowButtons = ( nucleonCountProperty: NumberProperty, nucleonColorProperty: ProfileColorProperty ): VBox => {
      const singleArrowButtonOptions = merge( { arrowFill: nucleonColorProperty }, arrowButtonOptions );
      const upArrowButton = new ArrowButton( 'up', () => createIncreaseNucleonCountListener( nucleonCountProperty ),
        singleArrowButtonOptions );
      const downArrowButton = new ArrowButton( 'down', () => createDecreaseNucleonCountListener( nucleonCountProperty ),
        singleArrowButtonOptions );
      return new VBox( {
        children: [ upArrowButton, downArrowButton ],
        spacing: arrowButtonSpacing
      } );
    };

    // create the single arrow buttons
    const protonArrowButtons = createSingleArrowButtons( model.protonCountProperty, BANColors.protonColorProperty );
    protonArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    protonArrowButtons.left = this.layoutBounds.minX + 50;
    this.addChild( protonArrowButtons );
    const neutronArrowButtons = createSingleArrowButtons( model.neutronCountProperty, BANColors.neutronColorProperty );
    neutronArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    neutronArrowButtons.left = ( this.layoutBounds.maxX - this.layoutBounds.minX ) / 1.75;
    this.addChild( neutronArrowButtons );

    // create and add the electron cloud
    this.electronCloud = new Circle( {
      radius: MIN_NUCLEON_CLOUD_RADIUS,
      fill: new RadialGradient( 0, 0, 0, 0, 0, MIN_NUCLEON_CLOUD_RADIUS )
        .addColorStop( 0, 'rgba( 116, 208, 246, 200 )' )
        .addColorStop( 0.9, 'rgba( 116, 208, 246, 0 )' )
    } );
    this.electronCloud.centerX = 335;
    this.electronCloud.centerY = ( this.layoutBounds.maxY - this.layoutBounds.minY ) / 2 + 30; // empirically determined
    this.addChild( this.electronCloud );

    // function to create the double arrow buttons
    const createDoubleArrowButtons = ( direction: DoubleArrowButtonDirection ): DoubleArrowButton => {
      return new DoubleArrowButton( direction,
        direction === 'up' ?
        () => createIncreaseNucleonCountListener( model.protonCountProperty, model.neutronCountProperty ) :
        () => createDecreaseNucleonCountListener( model.protonCountProperty, model.neutronCountProperty ),
        merge( {
          leftArrowFill: BANColors.protonColorProperty,
          rightArrowFill: BANColors.neutronColorProperty
        }, arrowButtonOptions )
      );
    };

    // create the double arrow buttons
    const doubleArrowButtons = new VBox( {
      children: [ createDoubleArrowButtons( 'up' ), createDoubleArrowButtons( 'down' ) ],
      spacing: arrowButtonSpacing
    } );
    doubleArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    doubleArrowButtons.centerX = protonArrowButtons.right + ( neutronArrowButtons.left - protonArrowButtons.right ) / 2;
    this.addChild( doubleArrowButtons );

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

    // function to create observers that disable the single arrow buttons when the nucleonCountProperty values are at its min
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

    // function to prevent a user from creating nuclides that do not exist on the chart
    Property.multilink( [ model.protonCountProperty, model.neutronCountProperty ], ( protonCount, neutronCount ) => {

      // observers that disable the double arrow buttons when the protonCountProperty and the neutronCountProperty are at
      // its max or min range
      doubleArrowButtons.getChildAt( 0 ).enabled = protonCount !== model.protonCountProperty.range!.max &&
                                                   neutronCount !== model.neutronCountProperty.range!.max;
      doubleArrowButtons.getChildAt( 1 ).enabled = protonCount !== model.protonCountProperty.range!.min &&
                                                   neutronCount !== model.neutronCountProperty.range!.min;

      // if on a nuclide that does not exist, check if there are nuclides ahead (next isotones, or isotopes)
      if ( !model.doesNuclideExistBooleanProperty.value ) {

        // TODO: disable all buttons once the nucleons are added
        const nextIsotope = AtomIdentifier.getNextExistingIsotope( protonCount, neutronCount );
        const nextIsotone = AtomIdentifier.getNextExistingIsotone( protonCount, neutronCount );

        // if the nextIsotone does not exist, disable the proton up arrow
        if ( !nextIsotone ) {
          protonArrowButtons.getChildAt( 0 ).enabled = false;
          doubleArrowButtons.getChildAt( 0 ).enabled = false;
        }

        // if the nextIsotope does not exist, disable the neutron up arrow
        if ( !nextIsotope ) {
          neutronArrowButtons.getChildAt( 0 ).enabled = false;
          doubleArrowButtons.getChildAt( 0 ).enabled = false;
        }
      }
      else {

        // re-enable the up arrow buttons on the nucleons
        protonArrowButtons.getChildAt( 0 ).enabled = protonCount !== model.protonCountProperty.range!.max;
        neutronArrowButtons.getChildAt( 0 ).enabled = neutronCount !== model.neutronCountProperty.range!.max;

        // If removing a neutron forms an isotope that does not exist, then disable the neutron down arrow button
        if ( AtomIdentifier.doesPreviousIsotopeExist( protonCount, neutronCount ) ) {
          // re-enable the neutron down arrow button
          neutronArrowButtons.getChildAt( 1 ).enabled = neutronCount !== model.neutronCountProperty.range!.min;
        }
        else {
          neutronArrowButtons.getChildAt( 1 ).enabled = false;
        }

        // If removing a proton forms an isotope that does not exist, then disable the proton down arrow button
        if ( AtomIdentifier.doesPreviousIsotoneExist( protonCount, neutronCount ) ) {
          // re-enable the proton down arrow button
          protonArrowButtons.getChildAt( 1 ).enabled = protonCount !== model.protonCountProperty.range!.min;
        }
        else {
          protonArrowButtons.getChildAt( 1 ).enabled = false;
        }
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
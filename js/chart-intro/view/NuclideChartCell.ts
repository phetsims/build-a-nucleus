// Copyright 2023-2025, University of Colorado Boulder

/**
 * Node that represents the background of a single cell in the nuclide chart. The view of the NuclideChartCellModel.
 *
 * @author Luisa Vargas
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Rectangle, { RectangleOptions } from '../../../../scenery/js/nodes/Rectangle.js';
import TPaint from '../../../../scenery/js/util/TPaint.js';
import buildANucleus from '../../buildANucleus.js';
import BANColors from '../../common/BANColors.js';
import NuclideChartCellModel from '../model/NuclideChartCellModel.js';

type SelfOptions = EmptySelfOptions;

type NuclideChartCellOptions = SelfOptions & RectangleOptions;

class NuclideChartCell extends Rectangle {

  // Public to help color the cell's label text background color.
  public readonly decayBackgroundColor: TPaint;

  public readonly cellModel: NuclideChartCellModel;

  public constructor( cellLength: number, cellModel: NuclideChartCellModel, providedOptions?: NuclideChartCellOptions ) {

    const options =
      optionize<NuclideChartCellOptions, SelfOptions, RectangleOptions>()( {
        stroke: BANColors.nuclideChartBorderColorProperty,
        fill: cellModel.colorProperty
      }, providedOptions );

    super( 0, 0, cellLength, cellLength, 0, 0, options );

    this.decayBackgroundColor = options.fill;
    this.cellModel = cellModel;
  }

  /**
   * Make cell more opaque to de-emphasize the cell.
   */
  public makeOpaque( protonDelta: number, neutronDelta: number ): void {
    this.opacity = protonDelta > 2 || neutronDelta > 2 ? 0.65 : 1;
  }
}

buildANucleus.register( 'NuclideChartCell', NuclideChartCell );
export default NuclideChartCell;
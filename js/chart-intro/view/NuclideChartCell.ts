// Copyright 2023, University of Colorado Boulder

/**
 * Node that represents the background of a single cell in the nuclide chart.
 *
 * @author Luisa Vargas
 */

import { Color, Rectangle, RectangleOptions, TPaint } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

type SelfOptions = EmptySelfOptions;

type NuclideChartCellOptions = SelfOptions & RectangleOptions;

class NuclideChartCell extends Rectangle {

  public readonly protonNumber: number;
  public readonly neutronNumber: number;
  public readonly decayType: string;
  public readonly decayBackgroundColor: TPaint;

  public constructor( cellLength: number, protonNumber: number, neutronNumber: number,
                      decayType: string, providedOptions: NuclideChartCellOptions ) {

    const options = optionize<NuclideChartCellOptions, SelfOptions, RectangleOptions>()( {
      stroke: Color.GRAY,
      fill: Color.GRAY
    }, providedOptions );

    super( 0, 0, cellLength, cellLength, 0, 0, options );

    this.protonNumber = protonNumber;
    this.neutronNumber = neutronNumber;
    this.decayBackgroundColor = options.fill;

    // TODO: why not store the decayType as the enumeration and not the string?
    this.decayType = decayType;
  }

  // make cell more opaque to de-emphasize the cell
  public makeOpaque( protonDelta: number, neutronDelta: number ): void {
    this.opacity = protonDelta > 2 || neutronDelta > 2 ? 0.65 : 1;
  }
}

buildANucleus.register( 'NuclideChartCell', NuclideChartCell );
export default NuclideChartCell;
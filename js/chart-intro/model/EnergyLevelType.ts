// Copyright 2023, University of Colorado Boulder

/**
 * EnergyLevelType identifies constant conditions for the energy levels.
 *
 * Models energy levels for a Nucleon Shell Model, see https://en.wikipedia.org/wiki/Nuclear_shell_model.
 * We only model the first 3 energy levels, signifying n=0, n=1, and n=2
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import buildANucleus from '../../buildANucleus.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';

class EnergyLevelType extends EnumerationValue {

  public static readonly N_ZERO = new EnergyLevelType( 0, 0, 2 );

  public static readonly N_ONE = new EnergyLevelType( 0, 1, 6 );

  // Though n2 has an actual capacity of 12, we are "hollywooding" for this screen, and don't need the extra space.
  public static readonly N_TWO = new EnergyLevelType( 0, 2, 6 );

  public static readonly enumeration = new Enumeration( EnergyLevelType );

  public constructor( public readonly xPosition: number, public readonly yPosition: number, public readonly capacity: number ) {
    super();
  }
}

buildANucleus.register( 'EnergyLevelType', EnergyLevelType );
export default EnergyLevelType;
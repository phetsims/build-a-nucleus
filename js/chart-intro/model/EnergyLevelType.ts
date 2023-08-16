// Copyright 2023, University of Colorado Boulder

/**
 * EnergyLevelType identifies constant conditions for the energy levels.
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import buildANucleus from '../../buildANucleus.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';

class EnergyLevelType extends EnumerationValue {

  public static readonly NONE = new EnergyLevelType( 0, 0 );

  public static readonly FIRST = new EnergyLevelType( 0, 1 );

  public static readonly SECOND = new EnergyLevelType( 0, 2 );

  public static readonly enumeration = new Enumeration( EnergyLevelType );

  public readonly xPosition: number;
  public readonly yPosition: number;

  public constructor( xPosition: number, yPosition: number ) {
    super();

    this.xPosition = xPosition;
    this.yPosition = yPosition;
  }
}

buildANucleus.register( 'EnergyLevelType', EnergyLevelType );
export default EnergyLevelType;
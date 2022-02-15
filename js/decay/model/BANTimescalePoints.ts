// Copyright 2022, University of Colorado Boulder

/**
 * BANTimescalePoints identifies meaningful sets of points on a timescale with seconds as the unit of time.
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import buildANucleus from '../../buildANucleus.js';
import buildANucleusStrings from '../../buildANucleusStrings.js';

const SECONDS_IN_A_YEAR = 365 * 24 * 60 * 60; // 365 days x 24 hrs/day x 60 min/hr x 60 sec/min

class BANTimescalePoints extends EnumerationValue {

  static TIME_FOR_LIGHT_TO_CROSS_A_NUCLEUS = new BANTimescalePoints( buildANucleusStrings.timeForLightToCrossANucleus,
    Math.pow( 10, -23 ) );

  static TIME_FOR_LIGHT_TO_CROSS_AN_ATOM = new BANTimescalePoints( buildANucleusStrings.timeForLightToCrossAnAtom,
    Math.pow( 10, -19 ) );

  static CHEMICAL_REACTION_DURATION = new BANTimescalePoints( buildANucleusStrings.chemicalReactionDuration, 2.5e-15 );

  static TIME_FOR_SOUND_TO_TRAVEL_ONE_MILLIMETER = new BANTimescalePoints( buildANucleusStrings.timeForSoundToTravelOneMillimeter,
    2e-6 );

  static A_BLINK_OF_AN_EYE = new BANTimescalePoints( buildANucleusStrings.aBlinkOfAnEye, 1 / 3 );

  static ONE_MINUTE = new BANTimescalePoints( buildANucleusStrings.oneMinute, 60 );

  static ONE_YEAR = new BANTimescalePoints( buildANucleusStrings.oneYear, SECONDS_IN_A_YEAR );

  static AVERAGE_HUMAN_LIFESPAN = new BANTimescalePoints( buildANucleusStrings.averageHumanLifespan, 72.6 * SECONDS_IN_A_YEAR );

  static AGE_OF_THE_UNIVERSE = new BANTimescalePoints( buildANucleusStrings.ageOfTheUniverse, 13.77e9 * SECONDS_IN_A_YEAR );

  static LIFETIME_OF_LONGEST_LIVED_STARS = new BANTimescalePoints( buildANucleusStrings.lifetimeOfLongestLivedStars, 450e18 );

  static enumeration = new Enumeration( BANTimescalePoints );

  public readonly timescaleItem: string;
  public readonly numberOfSeconds: number;

  constructor( timescaleItem: string, numberOfSeconds: number ) {
    super();

    this.timescaleItem = timescaleItem;
    this.numberOfSeconds = numberOfSeconds;
  }
}

buildANucleus.register( 'BANTimescalePoints', BANTimescalePoints );
export default BANTimescalePoints;

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
const TIME_FOR_LIGHT_TO_CROSS_AN_ATOM = Math.pow( 10, -19 );

class BANTimescalePoints extends EnumerationValue {

  public static TIME_FOR_LIGHT_TO_CROSS_A_NUCLEUS = new BANTimescalePoints(
    buildANucleusStrings.A + buildANucleusStrings.timeForLightToCrossANucleus, Math.pow( 10, -23 ) );

  public static TIME_FOR_LIGHT_TO_CROSS_AN_ATOM = new BANTimescalePoints(
    buildANucleusStrings.B + buildANucleusStrings.timeForLightToCrossAnAtom, TIME_FOR_LIGHT_TO_CROSS_AN_ATOM );

  public static TIME_FOR_LIGHT_TO_CROSS_ONE_THOUSAND_ATOMS = new BANTimescalePoints(
    buildANucleusStrings.C + buildANucleusStrings.timeForLightToCrossOneThousandAtoms,
    TIME_FOR_LIGHT_TO_CROSS_AN_ATOM * 1000 );

  public static TIME_FOR_SOUND_TO_TRAVEL_ONE_MILLIMETER = new BANTimescalePoints(
    buildANucleusStrings.D + buildANucleusStrings.timeForSoundToTravelOneMillimeter, 2e-6 );

  public static A_BLINK_OF_AN_EYE = new BANTimescalePoints(
    buildANucleusStrings.E + buildANucleusStrings.aBlinkOfAnEye, 1 / 3 );

  public static ONE_MINUTE = new BANTimescalePoints(
    buildANucleusStrings.F + buildANucleusStrings.oneMinute, 60 );

  public static ONE_YEAR = new BANTimescalePoints(
    buildANucleusStrings.G + buildANucleusStrings.oneYear, SECONDS_IN_A_YEAR );

  public static AVERAGE_HUMAN_LIFESPAN = new BANTimescalePoints(
    buildANucleusStrings.H + buildANucleusStrings.averageHumanLifespan, 72.6 * SECONDS_IN_A_YEAR );

  public static AGE_OF_THE_UNIVERSE = new BANTimescalePoints(
    buildANucleusStrings.I + buildANucleusStrings.ageOfTheUniverse, 13.77e9 * SECONDS_IN_A_YEAR );

  public static LIFETIME_OF_LONGEST_LIVED_STARS = new BANTimescalePoints(
    buildANucleusStrings.J + buildANucleusStrings.lifetimeOfLongestLivedStars, 450e18 );

  public static enumeration = new Enumeration( BANTimescalePoints );

  public readonly timescaleItem: string;
  public readonly numberOfSeconds: number;

  public constructor( timescaleItem: string, numberOfSeconds: number ) {
    super();

    this.timescaleItem = timescaleItem;
    this.numberOfSeconds = numberOfSeconds;
  }
}

buildANucleus.register( 'BANTimescalePoints', BANTimescalePoints );
export default BANTimescalePoints;

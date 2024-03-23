// Copyright 2022-2024, University of Colorado Boulder

/**
 * BANTimescalePoints identifies meaningful sets of points on a timescale with seconds as the unit of time.
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

const SECONDS_IN_A_YEAR = 365 * 24 * 60 * 60; // 365 days x 24 hrs/day x 60 min/hr x 60 sec/min
const TIME_FOR_LIGHT_TO_CROSS_AN_ATOM = Math.pow( 10, -19 );

class BANTimescalePoints extends EnumerationValue {

  public static readonly TIME_FOR_LIGHT_TO_CROSS_A_NUCLEUS = new BANTimescalePoints(
    BuildANucleusStrings.AStringProperty,
    BuildANucleusStrings.timeForLightToCrossANucleusStringProperty,
    Math.pow( 10, -23 )
  );

  public static readonly TIME_FOR_LIGHT_TO_CROSS_AN_ATOM = new BANTimescalePoints(
    BuildANucleusStrings.BStringProperty,
    BuildANucleusStrings.timeForLightToCrossAnAtomStringProperty,
    TIME_FOR_LIGHT_TO_CROSS_AN_ATOM
  );

  public static readonly TIME_FOR_LIGHT_TO_CROSS_ONE_THOUSAND_ATOMS = new BANTimescalePoints(
    BuildANucleusStrings.CStringProperty,
    BuildANucleusStrings.timeForLightToCrossOneThousandAtomsStringProperty,
    TIME_FOR_LIGHT_TO_CROSS_AN_ATOM * 1000 );

  public static readonly TIME_FOR_SOUND_TO_TRAVEL_ONE_MILLIMETER = new BANTimescalePoints(
    BuildANucleusStrings.DStringProperty,
    BuildANucleusStrings.timeForSoundToTravelOneMillimeterStringProperty,
    2e-6
  );

  public static readonly A_BLINK_OF_AN_EYE = new BANTimescalePoints(
    BuildANucleusStrings.EStringProperty,
    BuildANucleusStrings.aBlinkOfAnEyeStringProperty,
    1 / 3
  );

  public static readonly ONE_MINUTE = new BANTimescalePoints(
    BuildANucleusStrings.FStringProperty,
    BuildANucleusStrings.oneMinuteStringProperty,
    60
  );

  public static readonly ONE_YEAR = new BANTimescalePoints(
    BuildANucleusStrings.GStringProperty,
    BuildANucleusStrings.oneYearStringProperty,
    SECONDS_IN_A_YEAR
  );

  public static readonly AVERAGE_HUMAN_LIFESPAN = new BANTimescalePoints(
    BuildANucleusStrings.HStringProperty,
    BuildANucleusStrings.averageHumanLifespanStringProperty,
    72.6 * SECONDS_IN_A_YEAR
  );

  public static readonly AGE_OF_THE_UNIVERSE = new BANTimescalePoints(
    BuildANucleusStrings.IStringProperty,
    BuildANucleusStrings.ageOfTheUniverseStringProperty,
    13.77e9 * SECONDS_IN_A_YEAR
  );

  public static readonly LIFETIME_OF_LONGEST_LIVED_STARS = new BANTimescalePoints(
    BuildANucleusStrings.JStringProperty,
    BuildANucleusStrings.lifetimeOfLongestLivedStarsStringProperty,
    450e18
  );

  public static readonly enumeration = new Enumeration( BANTimescalePoints );

  public constructor(
    public readonly timescaleMarkerStringProperty: TReadOnlyProperty<string>,
    public readonly timescaleDescriptionStringProperty: TReadOnlyProperty<string>,
    public readonly numberOfSeconds: number
  ) {
    super();
  }
}

buildANucleus.register( 'BANTimescalePoints', BANTimescalePoints );
export default BANTimescalePoints;
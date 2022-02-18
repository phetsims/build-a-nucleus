// Copyright 2022, University of Colorado Boulder
// @ts-nocheck TODO-TS: TypeScript checking is turned off because shred is not in TypeScript, causing all strings to fail

/**
 * NuclideIdentifier is an object that identifies various things about a nuclide, given its proton number and/or neutron
 * number, such as its name, chemical symbol, stability, and half-life.
 *
 * TODO: A large part of this file is duplicated from AtomIdentifier in shred, we may consider merging the two together.
 * See https://github.com/phetsims/build-a-nucleus/issues/9.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../buildANucleus.js';
import shredStrings from '../../../shred/js/shredStrings.js';
import HalfLifeConstants from '../decay/model/HalfLifeConstants.js';

const hydrogenString = shredStrings.hydrogen;
const heliumString = shredStrings.helium;
const lithiumString = shredStrings.lithium;
const berylliumString = shredStrings.beryllium;
const boronString = shredStrings.boron;
const carbonString = shredStrings.carbon;
const nitrogenString = shredStrings.nitrogen;
const oxygenString = shredStrings.oxygen;
const fluorineString = shredStrings.fluorine;
const neonString = shredStrings.neon;
const sodiumString = shredStrings.sodium;
const magnesiumString = shredStrings.magnesium;
const aluminumString = shredStrings.aluminum;
const siliconString = shredStrings.silicon;
const phosphorusString = shredStrings.phosphorus;
const sulfurString = shredStrings.sulfur;
const chlorineString = shredStrings.chlorine;
const argonString = shredStrings.argon;
const potassiumString = shredStrings.potassium;
const calciumString = shredStrings.calcium;
const scandiumString = shredStrings.scandium;
const titaniumString = shredStrings.titanium;
const vanadiumString = shredStrings.vanadium;
const chromiumString = shredStrings.chromium;
const manganeseString = shredStrings.manganese;
const ironString = shredStrings.iron;
const cobaltString = shredStrings.cobalt;
const nickelString = shredStrings.nickel;
const copperString = shredStrings.copper;
const zincString = shredStrings.zinc;
const galliumString = shredStrings.gallium;
const germaniumString = shredStrings.germanium;
const arsenicString = shredStrings.arsenic;
const seleniumString = shredStrings.selenium;
const bromineString = shredStrings.bromine;
const kryptonString = shredStrings.krypton;
const rubidiumString = shredStrings.rubidium;
const strontiumString = shredStrings.strontium;
const yttriumString = shredStrings.yttrium;
const zirconiumString = shredStrings.zirconium;
const niobiumString = shredStrings.niobium;
const molybdenumString = shredStrings.molybdenum;
const technetiumString = shredStrings.technetium;
const rutheniumString = shredStrings.ruthenium;
const rhodiumString = shredStrings.rhodium;
const palladiumString = shredStrings.palladium;
const silverString = shredStrings.silver;
const cadmiumString = shredStrings.cadmium;
const indiumString = shredStrings.indium;
const tinString = shredStrings.tin;
const antimonyString = shredStrings.antimony;
const telluriumString = shredStrings.tellurium;
const iodineString = shredStrings.iodine;
const xenonString = shredStrings.xenon;
const cesiumString = shredStrings.cesium;
const bariumString = shredStrings.barium;
const lanthanumString = shredStrings.lanthanum;
const ceriumString = shredStrings.cerium;
const praseodymiumString = shredStrings.praseodymium;
const neodymiumString = shredStrings.neodymium;
const promethiumString = shredStrings.promethium;
const samariumString = shredStrings.samarium;
const europiumString = shredStrings.europium;
const gadoliniumString = shredStrings.gadolinium;
const terbiumString = shredStrings.terbium;
const dysprosiumString = shredStrings.dysprosium;
const holmiumString = shredStrings.holmium;
const erbiumString = shredStrings.erbium;
const thuliumString = shredStrings.thulium;
const ytterbiumString = shredStrings.ytterbium;
const lutetiumString = shredStrings.lutetium;
const hafniumString = shredStrings.hafnium;
const tantalumString = shredStrings.tantalum;
const tungstenString = shredStrings.tungsten;
const rheniumString = shredStrings.rhenium;
const osmiumString = shredStrings.osmium;
const iridiumString = shredStrings.iridium;
const platinumString = shredStrings.platinum;
const goldString = shredStrings.gold;
const mercuryString = shredStrings.mercury;
const thalliumString = shredStrings.thallium;
const leadString = shredStrings.lead;
const bismuthString = shredStrings.bismuth;
const poloniumString = shredStrings.polonium;
const astatineString = shredStrings.astatine;
const radonString = shredStrings.radon;
const franciumString = shredStrings.francium;
const radiumString = shredStrings.radium;
const actiniumString = shredStrings.actinium;
const thoriumString = shredStrings.thorium;
const protactiniumString = shredStrings.protactinium;
const uraniumString = shredStrings.uranium;
const neptuniumString = shredStrings.neptunium;
const plutoniumString = shredStrings.plutonium;
const americiumString = shredStrings.americium;
const curiumString = shredStrings.curium;
const berkeliumString = shredStrings.berkelium;
const californiumString = shredStrings.californium;
const einsteiniumString = shredStrings.einsteinium;
const fermiumString = shredStrings.fermium;
const mendeleviumString = shredStrings.mendelevium;
const nobeliumString = shredStrings.nobelium;
const lawrenciumString = shredStrings.lawrencium;
const rutherfordiumString = shredStrings.rutherfordium;
const dubniumString = shredStrings.dubnium;
const seaborgiumString = shredStrings.seaborgium;
const bohriumString = shredStrings.bohrium;
const hassiumString = shredStrings.hassium;
const meitneriumString = shredStrings.meitnerium;
const darmstadtiumString = shredStrings.darmstadtium;
const roentgeniumString = shredStrings.roentgenium;
const coperniciumString = shredStrings.copernicium;
const nihoniumString = shredStrings.nihonium;
const fleroviumString = shredStrings.flerovium;
const moscoviumString = shredStrings.moscovium;
const livermoriumString = shredStrings.livermorium;
const tennessineString = shredStrings.tennessine;
const oganessonString = shredStrings.oganesson;

const nameTable = [
  '', // No element
  hydrogenString,
  heliumString,
  lithiumString,
  berylliumString,
  boronString,
  carbonString,
  nitrogenString,
  oxygenString,
  fluorineString,
  neonString,
  sodiumString,
  magnesiumString,
  aluminumString,
  siliconString,
  phosphorusString,
  sulfurString,
  chlorineString,
  argonString,
  potassiumString,
  calciumString,
  scandiumString,
  titaniumString,
  vanadiumString,
  chromiumString,
  manganeseString,
  ironString,
  cobaltString,
  nickelString,
  copperString,
  zincString,
  galliumString,
  germaniumString,
  arsenicString,
  seleniumString,
  bromineString,
  kryptonString,
  rubidiumString,
  strontiumString,
  yttriumString,
  zirconiumString,
  niobiumString,
  molybdenumString,
  technetiumString,
  rutheniumString,
  rhodiumString,
  palladiumString,
  silverString,
  cadmiumString,
  indiumString,
  tinString,
  antimonyString,
  telluriumString,
  iodineString,
  xenonString,
  cesiumString,
  bariumString,
  lanthanumString,
  ceriumString,
  praseodymiumString,
  neodymiumString,
  promethiumString,
  samariumString,
  europiumString,
  gadoliniumString,
  terbiumString,
  dysprosiumString,
  holmiumString,
  erbiumString,
  thuliumString,
  ytterbiumString,
  lutetiumString,
  hafniumString,
  tantalumString,
  tungstenString,
  rheniumString,
  osmiumString,
  iridiumString,
  platinumString,
  goldString,
  mercuryString,
  thalliumString,
  leadString,
  bismuthString,
  poloniumString,
  astatineString,
  radonString,
  franciumString,
  radiumString,
  actiniumString,
  thoriumString,
  protactiniumString,
  uraniumString,
  neptuniumString,
  plutoniumString,
  americiumString,
  curiumString,
  berkeliumString,
  californiumString,
  einsteiniumString,
  fermiumString,
  mendeleviumString,
  nobeliumString,
  lawrenciumString,
  rutherfordiumString,
  dubniumString,
  seaborgiumString,
  bohriumString,
  hassiumString,
  meitneriumString,
  darmstadtiumString,
  roentgeniumString,
  coperniciumString,
  nihoniumString,
  fleroviumString,
  moscoviumString,
  livermoriumString,
  tennessineString,
  oganessonString
];

const symbolTable = [
  '-', // 0, NO ELEMENT
  'H', // 1, HYDROGEN
  'He', // 2, HELIUM
  'Li', // 3, LITHIUM
  'Be', // 4, BERYLLIUM
  'B', // 5, BORON
  'C', // 6, CARBON
  'N', // 7, NITROGEN
  'O', // 8, OXYGEN
  'F', // 9, FLUORINE
  'Ne', // 10, NEON
  'Na', // 11, SODIUM
  'Mg', // 12, MAGNESIUM
  'Al', // 13, ALUMINUM
  'Si', // 14, SILICON
  'P', // 15, PHOSPHORUS
  'S', // 16, SULFUR
  'Cl', // 17, CHLORINE
  'Ar', // 18, ARGON
  'K', // 19, POTASSIUM
  'Ca', // 20, CALCIUM
  'Sc', // 21, SCANDIUM
  'Ti', // 22, TITANIUM
  'V', // 23, VANADIUM
  'Cr', // 24, CHROMIUM
  'Mn', // 25, MANGANESE
  'Fe', // 26, IRON
  'Co', // 27, COBALT
  'Ni', // 28, NICKEL
  'Cu', // 29, COPPER
  'Zn', // 30, ZINC
  'Ga', // 31, GALLIUM
  'Ge', // 32, GERMANIUM
  'As', // 33, ARSENIC
  'Se', // 34, SELENIUM
  'Br', // 35, BROMINE
  'Kr', // 36, KRYPTON
  'Rb', // 37, RUBIDIUM
  'Sr', // 38, STRONTIUM
  'Y', // 39, YTTRIUM
  'Zr', // 40, ZIRCONIUM
  'Nb', // 41, NIOBIUM
  'Mo', // 42, MOLYBDENUM
  'Tc', // 43, TECHNETIUM
  'Ru', // 44, RUTHENIUM
  'Rh', // 45, RHODIUM
  'Pd', // 46, PALLADIUM
  'Ag', // 47, SILVER
  'Cd', // 48, CADMIUM
  'In', // 49, INDIUM
  'Sn', // 50, TIN
  'Sb', // 51, ANTIMONY
  'Te', // 52, TELLURIUM
  'I', // 53, IODINE
  'Xe', // 54, XENON
  'Cs', // 55, CAESIUM
  'Ba', // 56, BARIUM
  'La', // 57, LANTHANUM
  'Ce', // 58, CERIUM
  'Pr', // 59, PRASEODYMIUM
  'Nd', // 60, NEODYMIUM
  'Pm', // 61, PROMETHIUM
  'Sm', // 62, SAMARIUM
  'Eu', // 63, EUROPIUM
  'Gd', // 64, GADOLINIUM
  'Tb', // 65, TERBIUM
  'Dy', // 66, DYSPROSIUM
  'Ho', // 67, HOLMIUM
  'Er', // 68, ERBIUM
  'Tm', // 69, THULIUM
  'Yb', // 70, YTTERBIUM
  'Lu', // 71, LUTETIUM
  'Hf', // 72, HAFNIUM
  'Ta', // 73, TANTALUM
  'W', // 74, TUNGSTEN
  'Re', // 75, RHENIUM
  'Os', // 76, OSMIUM
  'Ir', // 77, IRIDIUM
  'Pt', // 78, PLATINUM
  'Au', // 79, GOLD
  'Hg', // 80, MERCURY
  'Tl', // 81, THALLIUM
  'Pb', // 82, LEAD
  'Bi', // 83, BISMUTH
  'Po', // 84, POLONIUM
  'At', // 85, ASTATINE
  'Rn', // 86, RADON
  'Fr', // 87, FRANCIUM
  'Ra', // 88, RADIUM
  'Ac', // 89, ACTINIUM
  'Th', // 90, THORIUM
  'Pa', // 91, PROTACTINIUM
  'U', // 92, URANIUM
  'Np', // 93, NEPTUNIUM
  'Pu', // 94, PLUTONIUM
  'Am', // 95, AMERICIUM
  'Cm', // 96, CURIUM
  'Bk', // 97, BERKELIUM
  'Cf', // 98, CALIFORNIUM
  'Es', // 99, EINSTEINIUM
  'Fm', // 100, FERMIUM
  'Md', // 101, MENDELEVIUM
  'No', // 102, NOBELIUM
  'Lr', // 103, LAWRENCIUM
  'Rf', // 104, RUTHERFORDIUM
  'Db', // 105, DUBNIUM
  'Sg', // 106, SEABORGIUM
  'Bh', // 107, BOHRIUM
  'Hs', // 108, HASSIUM
  'Mt', // 109, MEITNERIUM
  'Ds', // 110, DARMSTADTIUM
  'Rg', // 111, ROENTGENIUM
  'Cn', // 112, COPERNICIUM
  'Nh', // 113, NIHONIUM
  'Fl', // 114, FLEROVIUM
  'Mc', // 115, MOSCOVIUM
  'Lv', // 116, LIVERMORIUM
  'Ts', // 117, TENNESSINE
  'Og'  // 118, OGANESSON

];

// Table of stable elements, indexed by atomic number to a list of viable numbers of neutrons.
const stableElementTable = [
  // No element
  [],
  // Hydrogen
  [ 0, 1 ],
  // Helium
  [ 1, 2 ],
  // Lithium
  [ 3, 4 ],
  // Beryllium
  [ 5 ],
  // Boron
  [ 5, 6 ],
  // Carbon
  [ 6, 7 ],
  // Nitrogen
  [ 7, 8 ],
  // Oxygen
  [ 8, 9, 10 ],
  // Fluorine
  [ 10 ],
  // Neon
  [ 10, 11, 12 ],
  // Sodium
  [ 12 ],
  // Magnesium
  [ 12, 13, 14 ],
  //Aluminum
  [ 14 ],
  // Silicon
  [ 14, 15, 16 ],
  // Phosphorous
  [ 16 ],
  // Sulfur
  [ 16, 17, 18, 20 ],
  // Chlorine
  [ 18, 20 ],
  // Argon
  [ 18, 20, 22 ],
  [ 20, 22 ],
  [ 20, 22, 23, 24, 26 ],
  [ 24 ],
  [ 24, 25, 26, 27, 28 ],
  [ 28 ],
  [ 28, 29, 30 ],
  [ 30 ],
  [ 28, 30, 31, 32 ],
  [ 32 ],
  [ 30, 32, 33, 34, 36 ],
  [ 34, 36 ],
  [ 34, 36, 37, 38 ],
  [ 38, 40 ],
  [ 38, 40, 41, 42, 44 ],
  [ 42 ],
  [ 40, 42, 43, 44, 46 ],
  [ 44, 46 ],
  [ 42, 44, 46, 47, 48, 50 ],
  [ 48 ],
  [ 46, 48, 49, 50 ],
  [ 50 ],
  [ 50, 51, 52, 54 ],
  [ 52 ],
  [ 50, 52, 53, 54, 55, 56 ],
  [ 52, 54, 55, 56, 57, 58, 60 ],
  [ 58 ],
  [ 56, 58, 59, 60, 62, 64 ],
  [ 60, 62 ],
  [ 58, 60, 62, 63, 64, 66 ],
  [ 64 ],
  [ 62, 64, 65, 66, 67, 68, 69, 70, 72, 74 ],
  [ 70, 72 ],
  [ 68, 70, 72, 73, 74 ],
  [ 74 ],
  [ 72, 74, 75, 76, 77, 78 ],
  [ 78 ],
  [ 74, 78, 79, 80, 81, 82 ],
  [ 82 ],
  [ 78, 82 ],
  [ 82 ],
  [ 82, 83, 85, 86, 88 ],
  [ 82, 87, 88, 90, 92 ],
  [ 90 ],
  [ 90, 91, 92, 93, 94, 96 ],
  [ 94 ],
  [ 90, 92, 94, 95, 96, 97, 98 ],
  [ 98 ],
  [ 94, 96, 98, 99, 100, 102 ],
  [ 100 ],
  [ 98, 100, 101, 102, 103, 104, 106 ],
  [ 104 ],
  [ 104, 105, 106, 107, 108 ],
  [ 108 ],
  [ 108, 110, 112 ],
  [ 110 ],
  [ 111, 112, 113, 114, 116 ],
  [ 114, 116 ],
  [ 114, 116, 117, 118, 120 ],
  [ 118 ],
  [ 116, 118, 119, 120, 121, 122, 124 ],
  [ 122, 124 ],
  [ 124, 125, 126 ]
];

const NuclideIdentifier = {

  // Get the chemical symbol for an atom with the specified number of protons.
  getSymbol: ( numProtons: number ): string => {
    return symbolTable[ numProtons ];
  },

  // Get the internationalized element name for an atom with the specified number of protons.
  getName: ( numProtons: number ): string => {
    return nameTable[ numProtons ];
  },

  // Identifies whether a given atomic nucleus is stable.
  isStable: ( numProtons: number, numNeutrons: number ): boolean => {
    const tableEntry = stableElementTable[ numProtons ];
    if ( !tableEntry ) {
      return false;
    }
    return tableEntry.includes( numNeutrons );
  },

  // Get the half-life of a nuclide with the specified number of protons and neutrons.
  getNuclideHalfLife: ( numProtons: number, numNeutrons: number ): number | undefined | null => {
    return HalfLifeConstants[ numProtons ][ numNeutrons ];
  },

  // Identifies whether a given nuclide exists
  doesExist: ( numProtons: number, numNeutrons: number ): boolean => {
    const isStable = NuclideIdentifier.isStable( numProtons, numNeutrons );
    const halfLife = NuclideIdentifier.getNuclideHalfLife( numProtons, numNeutrons );
    return !( !isStable && halfLife === undefined );
  },

  // Get the next isotope for the given nuclide that exists, if there is one, otherwise return false
  getNextExistingIsotope: ( numProtons: number, numNeutrons: number ): number[] | boolean => {
    let increaseNeutrons = 0;
    while ( increaseNeutrons <= 2 && NuclideIdentifier.getNuclideHalfLife( numProtons, numNeutrons + increaseNeutrons ) === undefined ) {
      increaseNeutrons++;
    }
    if ( NuclideIdentifier.getNuclideHalfLife( numProtons, numNeutrons + increaseNeutrons ) !== undefined ) {
      return [ numProtons, numNeutrons + increaseNeutrons ];
    }
    return false;
  },

  // Get the next isotone for the given nuclide that exists, if there is one, otherwise return false
  getNextExistingIsotone: ( numProtons: number, numNeutrons: number ): number[] | boolean => {
    let increaseProtons = 0;
    while ( increaseProtons <= 2 && NuclideIdentifier.getNuclideHalfLife( numProtons + increaseProtons, numNeutrons ) === undefined ) {
      increaseProtons++;
    }
    if ( NuclideIdentifier.getNuclideHalfLife( numProtons + increaseProtons, numNeutrons ) !== undefined ) {
      return [ numProtons + increaseProtons, numNeutrons ];
    }
    return false;
  }
};

buildANucleus.register( 'NuclideIdentifier', NuclideIdentifier );
export default NuclideIdentifier;
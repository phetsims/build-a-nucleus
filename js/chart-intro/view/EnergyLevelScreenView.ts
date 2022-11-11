// Copyright 2022, University of Colorado Boulder

import buildANucleus from '../../buildANucleus.js';
import EnergyLevelModel from '../model/EnergyLevelModel.js';

class EnergyLevelScreenView {

  private model: EnergyLevelModel;

  public constructor( model: EnergyLevelModel ) {

    this.model = model;

  }
}

buildANucleus.register( 'EnergyLevelScreenView', EnergyLevelScreenView );
export default EnergyLevelScreenView;
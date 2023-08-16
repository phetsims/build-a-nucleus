# Build a Nucleus - Implementation notes

@author Luisa Vargas

This document contains notes related to the implementation of Build a Nucleus.

The model is driven by the protonCountProperty and neutronCountProperty in the ParticleAtom. These count properties
drive the simulation. The half-life number, the symbol, mass number, available decays, nuclide, element, and nucleon
counter all depend on these count properties.

## Terminology

- ParticleAtom: A way of representing an atom in the model. It contains and manages references to constituent particles.
- ParticleNucleus: A subtype of ParticleAtom. This manages the positions and motion of all particles in the nucleus
  on the Chart Intro screen.
- ParticleAtomNode: Node that holds the ParticleView's from ParticleAtom. Rearranges particles in different node layers
  and has a blue electron cloud.
- Particle: The model for a particle. It contains information about the particle type, id, color, position, and
  destination, among others.
- ParticleNode: An icon for a particle, just a circle node with a color gradient.
- ParticleView: Tracks a particle in the view, the 'view' portion for the Particle model.

Since there are particles located in various parts throughout the sim, on the way to the atom, away from the atom,
and in the atom, there are various arrays to keep track of the particles. If a particle is not visibly in the
ParticleAtom, which is in the nucleus in the Decay screen and in the energy levels in the Chart Intro screen, then it
is not considered as a part of the ParticleAtom particles.

- particles: Array of all particles existing in the model, including the ParticleAtom particles, except for the
  mini-atom particles.
- outgoingParticles: Array of all particles that are not in the ParticleAtom and will be removed, they are sent away
  from the ParticleAtom.
- incomingProtons: Array of all protons sent on the way to the ParticleAtom.
- incomingNeutrons: Array of all neutrons sent on the way to the ParticleAtom.
- userControlledProtons: Array of all protons currently being dragged by the user, as such, these are not a part of the
  ParticleAtom particles.
- userControlledNeutrons: Array of all neutrons currently being dragged by the user, as such, these are not a part of
  the ParticleAtom particles.
- protonShellPositions: Array to keep track of where a proton particle can be placed in the energy levels. This array
  exists only in the ParticleNucleus.
- neutronShellPositions: Array to keep track of where a neutron particle can be placed in the energy levels. This array
  exists only in the ParticleNucleus.

The ParticleView's of the model particles are kept track of in the _particleViewMap_, a lookup map which uses the
particle's id as a key. All ParticleView's are stored in the map, including the mini-atom ParticleView's.

#### Chart Intro screen

The Chart Intro screen features a main nuclide chart, the NuclideChartNode which has two subtypes.

- NuclideChartNode: The main nuclide chart node which goes up to 10 protons and 12 neutrons. Chart is made of
  NuclideChartCell's.
  - Visible by default in the first scene of the Partial Nuclide Chart accordion box.
- ZoomInNuclideChartNode: Subtype of NuclideChartNode which shows a chart of 5x5 NuclideChartCell's
  - Visible on the left side of the 'zoom-in' scene in the Partial Nuclide Chart accordion box.
- FocusedNuclideChartNode: Subtype of NuclideChartNode which also goes up to 10 protons and 12 neutrons, however, it 
  highlights the current nuclide through 'graying out' cells too far away from the current nuclide.
  - Visible on the right side of the 'zoom-in' scene in the Partial Nuclide Chart accordion box.

## General functioning

#### General particle lifespan

- A particle is created from either the NucleonCreatorNode or from the createParticleFromStack() function. The created
  particle is added to the _particles_ array (unless it is a mini-atom particle).
- The particle then moves on from the _incoming_ or _userControlled_ arrays to becoming a part of the ParticleAtom's
  particles if it reaches its destination in the ParticleAtom or is let go of within the play area.
- A particle is removed using returnParticleToStack() and / or animateAndRemoveParticle().
    - Each particle deals with its disposal of its ParticleView through a disposeEmitter called when the Particle is
      disposed, this is typically the last step after removal of the particle from all necessary arrays.

#### Important notes

The proton and neutron count properties change the model of the sim through the interaction with the spinner buttons and
through clicking and dragging of particles. However, these properties can also change through decays, which depending
on the decay type, can create or remove particles. Note, the beta decay type is special because it can also change the
nucleon type of a nucleon particle.

It's important to note that in the Chart Intro screen, an _incoming_ particle holds a position in the _ShellPositions_
before it reaches its destination to become a part of the ParticleNucleus' particles.

#### ModelViewTransform's

There are various MVT uses throughout the model to help in positioning of the particle's, the particle atom and the
energy levels.
- ParticleTransform is a single point scaling transformation that defines (0,0) as the center of the atom in the Decay
  screen, and the top left corner of the proton energy levels in the Chart Intro screen. Also used in:
  - the creation of ParticleView's to determine their corresponding ParticleNode's radius
  - centering the pointer in the center of draggable particles
  - setting the destination for particles when animating them
- NUCLEON_ENERGY_LEVEL_ARRAY_MVT is a constant and used in positioning the energy level Line's and the particles in the
  Chart Intro screen.
- miniAtomMVT also is a single point scaling transformation defining (0,0) as the center of the miniParticleAtom in the 
  Chart Intro screen. As such, it is only used in positioning mini-atom particles.

#### ChartTransform's

The simulation has various charts and number lines throughout both screens. Though the Decay screen only has number
lines. ChartTransform's were used to aid in the creation of these.

*Decay screen*
- HalfLifeNumberLineNode uses a ChartTransform to create the number line. Visually, this looks like a log scale number
  line of values with the base power of 10. However, this was done by mapping the number line width to the range of the
  *exponents* in the number line.

*Chart Intro screen*

There is a function *getChartTransform* in the NuclideChartAccordionBox that creates individual ChartTransform's to be
used in all three NuclideChartNode's and both nuclide chart icon nodes.
- partialChartTransform: used in creating the PartialNuclideChart and its NucleonNumberLine's.
  - responsible for the cell's position and size, and for the decay arrow's position and direction.
- focusedChartTransform: used in creating the FocusedNuclideChart.
  - responsible for the highlightRectangle position and movement, and opaquing of cells too far away from current
    nuclide
- zoomInChartTransform: used in creating the ZoomInNuclideChart. No additional responsibilities.
- smallChartTransform's: created and used in CompleteNuclideChartIconNode and ZoomInNuclideChartIconNode in the radio
  buttons.
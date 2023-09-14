# Build a Nucleus - Implementation notes

@author Luisa Vargas

This document contains notes related to the implementation of Build a Nucleus.

The model is driven by the protonCountProperty and neutronCountProperty in the ParticleAtom. These count properties
drive the simulation. The half-life number, the symbol, mass number, available decays, nuclide, element, and nucleon
counter all depend on these count properties.

## Terminology

- __ParticleAtom__: A way of representing an atom in the model. It contains and manages references to constituent
  particles.
- __ShellModelNucleus__: A subtype of ParticleAtom. This manages the positions and motion of all particles in the
  nucleus on the Chart Intro screen.
- __ParticleAtomNode__: Node that holds the ParticleView instances from ParticleAtom. Rearranges particles in
  different  
  node layers and has a blue electron cloud.
- __Particle__: The model for a particle. It contains information about the particle type, id, color, position, and
  destination, among others.
- __ParticleNode__: An icon for a particle, just a circle node with a color gradient.
- __ParticleView__: Tracks a particle in the view, the 'view' portion for the Particle model.

Since there are particles located in various parts throughout the sim, on the way to the atom, away from the atom, and
in the atom, there are various arrays to keep track of the particles. If a particle is not visible in the ParticleAtom,
which is in the nucleus in the Decay screen and in the energy levels in the Chart Intro screen, then it is not
considered as a part of the ParticleAtom particles.

- __particles__: Array of all particles existing in the model, including the ParticleAtom particles, except for the
  mini-atom particles.
- __outgoingParticles__: Array of all particles that are not in the ParticleAtom and will be removed, they are sent away
  from the ParticleAtom.
- __incomingProtons__: Array of all protons sent on the way to the ParticleAtom.
- __incomingNeutrons__: Array of all neutrons sent on the way to the ParticleAtom.
- __userControlledProtons__: Array of all protons currently being dragged by the user, as such, these are not a part of
  the ParticleAtom particles.
- __userControlledNeutrons__: Array of all neutrons currently being dragged by the user, as such, these are not a part
  of the ParticleAtom particles.
- __protonShellPositions__: Array to keep track of where a proton particle can be placed in the energy levels. This
  array exists only in the ShellModelNucleus.
- __neutronShellPositions__: Array to keep track of where a neutron particle can be placed in the energy levels. This
  array exists only in the ShellModelNucleus.

The ParticleViews of the model particles are kept track of in the `particleViewMap`, a lookup map which uses the
particles id as a key. All ParticleView instances are stored in the map, including the mini-atom ParticleViews.

#### Chart Intro screen

The Chart Intro screen features a main nuclide chart, the `NuclideChartNode` which has two subtypes.

- __NuclideChartNode__: The main nuclide chart node which goes up to 10 protons and 12 neutrons. The chart is made of
  NuclideChartCells.
  - Visible by default in the first scene of the Partial Nuclide Chart accordion box.
- __ZoomInNuclideChartNode__: Subtype of NuclideChartNode which shows a chart of 5x5 NuclideChartCells.
  - Visible on the left side of the 'zoom-in' scene in the Partial Nuclide Chart accordion box.
- __FocusedNuclideChartNode__: Subtype of NuclideChartNode which also goes up to 10 protons and 12 neutrons, however, it
  highlights the current nuclide through 'graying out' cells too far away from the current nuclide.
  - Visible on the right side of the 'zoom-in' scene in the Partial Nuclide Chart accordion box.

## General functioning

#### General particle lifespan and note on disposal

- A particle is created from either the `NucleonCreatorNode` or from `createParticleFromStack()`. The created particle
  is added to the _particles_ array (unless it is a mini-atom particle).
- The particle then moves on from the _incoming_ or _userControlled_ arrays to becoming a part of the particles in the
  ParticleAtom if it reaches its destination in the ParticleAtom or is let go of within the play area.
- A particle is removed using `returnParticleToStack()` and / or `animateAndRemoveParticle()`.
  - Each particle deals with its disposal of its ParticleView through a disposeEmitter called when the Particle is
    disposed, this is typically the last step after removal of the particle from all necessary arrays.
  - `particles` is the main list of particles and once a Particle is removed from there, the Particle goes through the
    disposal process above.


- Other than particles, everything else stays around for the lifetime of the sim and therefore doesn't need to be
  unlinked or disposed.

#### Important notes

The proton and neutron count properties change the model of the sim through the interaction with the spinner buttons and
through clicking and dragging of particles. However, these properties can also change through decays, which depending on
the decay type, can create or remove particles. Note, the beta decay type is special because it can also change the
nucleon type of a nucleon particle.

It's important to note that in the Chart Intro screen, an _incoming_ particle holds a position in the _ShellPositions_
before it reaches its destination to become a part of the ShellModelNucleus particles.

#### ModelViewTransforms

There are various MVT uses throughout the model to help in positioning of the particles, the particle atom and the
energy levels.

- `particleTransform` is a single point scaling transformation that defines (0,0) as the center of the atom in the Decay
  screen, and the top left corner of the proton energy levels in the Chart Intro screen. Also used in:
  - the creation of ParticleViews to determine their corresponding ParticleNodes radius
  - centering the pointer in the center of draggable particles
  - setting the destination for particles when animating them
- `PARTICLE_POSITIONING_TRANSFORM` is an inverted Y mapping type of transform and used in positioning the energy level
  Line instances and the large particles in the Chart Intro screen.
  - This is the main MVT in the Chart Intro screen though it doesn't do any scaling, rather it maps from arbitrary
    grid-like positions (see `ALLOWED_PARTICLE_POSITIONS` in `ShellModelNucleus`) into model / view positions.
- `miniAtomMVT` also is a single point scaling transformation defining (0,0) as the center of the miniParticleAtom in
  the Chart Intro screen. As such, it is only used in positioning mini-atom particles.

#### ChartTransforms

The simulation has various charts and number lines throughout both screens, though the Decay screen only has number
lines. ChartTransforms were used to aid in the creation of these.

*Decay screen*

- `HalfLifeNumberLineNode` uses a `ChartTransform` to create the number line. Visually, this looks like a log scale
  number line of values with the base power of 10. However, this was done by mapping the number line width to the range
  of the
  *exponents* in the number line.

*Chart Intro screen*

There is a function `getChartTransform` in the NuclideChartAccordionBox that creates individual `ChartTransform`s to be
used in all three NuclideChartNodes and both nuclide chart icon nodes.

- __partialChartTransform__: used in creating the PartialNuclideChart and its NucleonNumberLines.
  - responsible for the cells position and size, and for the decay arrows position and direction.
- __focusedChartTransform__: used in creating the FocusedNuclideChart.
  - responsible for the highlightRectangle position and movement, and opaquing of cells too far away from current
    nuclide
- __zoomInChartTransform__: used in creating the ZoomInNuclideChart. No additional responsibilities.
- __smallChartTransforms__: created and used in CompleteNuclideChartIconNode and ZoomInNuclideChartIconNode in the radio
  buttons.

## Data

The half-life and decay data comes from the [Relational ENSDF](https://www-nds.iaea.org/relnsd/NdsEnsdf/QueryForm.html)
from 2022. The values in this database from experimental data which is then manually hard-coded into AtomIdentifier.
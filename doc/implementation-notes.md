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
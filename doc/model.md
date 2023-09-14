# Build a Nucleus - Model description

@author Luisa Vargas

This document describes the model for the Build a Nucleus simulation.<br>

## Terminology

An atom is made up of protons, neutrons, and electrons. A nucleus is made up of _nucleons_, which is the general term
for protons and neutrons.

- __Nuclide__: an atomic species defined by the number of protons and neutrons it has in its nucleus.
- __Half-life__: the amount of time it takes for one-half of the radioactive isotope to decay.
- __Decay__: is the process by which an unstable atomic nucleus loses energy by radiation. A material containing
  unstable nuclei is considered radioactive.
- __Chart of the nuclides__: chart of all isotopes of all elements color coded based on the decay a nuclide would most
  likely undergo.
- __Nuclear Shell Model__: model describing the nucleus using energy levels.
- __Energy level / shell__: a definite fixed energy that a particle or atom can have.
  - _Lowest energy level / shell_ has lowest amount of energy and vice versa.
  - __Energy levels__ can hold a certain *even*
    number of nucleons before they fill up. For example,
    - the first energy level can hold a maximum of 2 nucleons
    - the second energy level can hold a maximum of 6 nucleons
    - the third energy level can hold a maximum of 12 nucleons
- __Magic number__: a number of nucleons that completes a nucleon energy level. Nuclides with magic numbers have
  increased stability. For example, the first couple magic numbers are:
  - 2
  - 8 ( 2 + 6 )
  - 20 ( 2 + 6 + 12 )
- __Singly magic__: a nuclide where only their proton or neutron number is magic. Ex. Helium-3 (2p, 1n)
- __Doubly magic__: a nuclide where both the proton and neutron number is magic. Ex. Helium-4 (2p, 2n)
- __(Subatomic) particle__: a particle smaller than an atom. Such as a proton, neutron, electron, or positron.

## Overview

In the Build a Nucleus simulation, a user can build a nuclide from protons and neutrons. The nuclide is assumed to be
neutral since the electron cloud contains as many electrons as there are protons.

The user can place neutrons and protons into the play area by using the spinners next to the nucleons. The spinner
between the protons and neutrons places both a proton and neutron into the nucleus simultaneously. Nucleons can also be
placed by dragging them into the nucleus in the **Decay screen**, or dragging them into the energy levels play area in
the **Chart Intro screen**. If a nucleon particle is placed outside the play area, it will return to its creator.

As the number of nucleons in the nucleus changes, the sim updates the nuclide species name (eg. Helium-5) and the
readout of nucleon numbers. Only nuclides that exist on Earth can be built, this is done through the disabling of
arrows, as well through briefly displaying "{{nuclide name}} does not form" when a nuclide that does not exist is built,
then the nucleus rearranges itself back to the last formed nuclide.

Five decay types are represented within the simulation: α decay, β<sup>+</sup> decay, β<sup>-</sup> decay, proton
emission, and neutron emission. Unstable nuclides decay into stable nuclides through one of these decay paths.

### Model caveats
* The particles are not at all to scale and neither is the placement of particles exactly scientifically accurate. This
  was done to make it so that the particles could be easily seen and manipulated by the users.
* The electron cloud size is based on experimental data of the atomic radii of elements but it's tweaked to make the 
  electron cloud appear our desired size.

## Decay screen

The Decay screen allows building of nuclides up to 94 protons and 146 neutrons.

If the electron cloud is visible, then an atom is being built, but if the electron cloud is not visible, then a nucleus
is built.

Changing the number of nucleons in the nucleus updates the half-life of this species, whether this species is stable or
unstable, the symbol display, and the available decays.

Available decays will be indicated by the button labelled with decay being active. If an available decay is pressed, the
decay will be animated (for instance a proton ejected from the nucleus) and all the various readouts will update
(symbol, half-life, nucleon counter, available decays). Animations of particles ejected will go off at a random angle
away from the nucleus.

Pressing the “info” button near the half-life readout will bring up a dialog with an expanded timeline. The expanded
timescale is overall static, but the half-life readout is dynamic and will correspond to the current nuclide species
half-life.

## Chart Intro screen

The Chart Intro screen allows building of nuclides up to 10 protons and 12 neutrons but a full chart with all the
nuclides is also linked here.

A _mini-atom_ is displayed at the top of the screen, similar to the main atom in the **Decay screen**, however this
mini-atom is not interactive. Rather, nucleons in this screen are placed on the energy levels that make up the nucleus.
(Hence, the 'zoom-in' dashed lines on the nucleus.) The color of the energy level demonstrates an energy level filling
up to its alloted amount through changing shades closer to its respective nucleon color.

Nucleons are 'bound' to their current energy level when all the particles on a given level are close to each other.
Bound nucleons are not interactive.

Changing the number of nucleons in the shell model updates the symbol, the element position in the periodic table, the
nuclide position in the chart of the nuclides, and the decay equation.

In the Partial Nuclide Chart, a smaller version of the Chart of the Nuclides is shown with the nucleon number lines
highlighting the current nuclide position using the respective nucleon colors. For example, for Hydrogen-1, the label
for position '1' on the proton axis is highlighted in orange while the label for position '0' is highlighted in gray on
the neutron axis.

The zoomed in view of the chart shows the decay equation of the most likely decay to occur for the current nuclide
built. It also shows the percent likelihood of this decay happening. There is also a decay button beside the equation to
visibly see the decay occur on the nucleus. In the shell model however, particles only fade in / fade out of the energy
levels for simplification purposes. The decay direction is also seen in the zoomed-in chart through a white arrow.

The magic numbers checkbox highlights the rows on the chart that have magic numbers, which is only the rows with 2 and 8
nucleons in this screen.

## Hollywood!

To write well-behaved programs, it's not always possible to be physically accurate. This section summarizes where we
"Hollywooded" things to provide close approximations and convincing behavior.

* Beryllium - 6 (4p 2n) can undergo an alpha decay where only 2 protons remain in the nucleus afterward. A nuclide with
  2 protons does not exist so the 2 protons are shown in the "{{nuclide name}} does not form" case format and then
  forcibly emitted as well.
* 0 protons and 0 neutrons is the base case and an acceptable state for the simulation to exist in even though such a
  nuclide does not exist.
* The nucleon energy levels and the number of nucleons they each can hold, based on the
  [nuclear shell model](https://en.wikipedia.org/wiki/Nuclear_shell_model), is:
  * n = 0 holds 2 nucleons
  * n = 1 holds 6 nucleons
  * n = 2 holds 12 nucleons
  However, since there is a limited space for particles in the last energy level in the simulation, we model the n = 2 
  energy level as if it can only hold 6 nucleons before getting full.
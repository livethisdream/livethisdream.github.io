---
layout: lesson
course: ece444
title: "L1 — Course Introduction"
order: 1
module: 1
week: 1
date: 2026-08-24
deck: /assets/ece444/decks/01-course-intro.md
---

## Learning outcomes

By the end of this lesson, you will be able to:

- State in plain language what an antenna is and what it does in a radio system.
- Explain why antennas matter to operators and engineers in the Air Force mission set (comms, radar, EW, SATCOM, GPS).
- Identify the five modules of ECE 444 and how they build toward the final capstone.
- Recognize several real antennas by sight and connect their geometry to the job they do.

## Welcome & introductions

_Instructor and student introductions — background, career interests, prior exposure to RF or radar._

## What is an antenna?

An antenna is the **transducer between a guided electromagnetic wave** (a signal traveling on a cable or waveguide) **and a freely propagating wave** (a signal traveling through space). Every wireless system on Earth has at least one on each end of the link.

Two ideas we'll keep coming back to:

1. Antennas are **reciprocal** — the same antenna transmits and receives with the same pattern.
2. Antennas do **not create energy** — they shape *where* the energy goes.

## Why this matters to you

Antennas are the front door of every RF system the Air Force fields. If the antenna is wrong, nothing downstream can fix it.

- **Communications** — HF/VHF/UHF/SATCOM links, tactical radios, data links.
- **Radar** — surveillance, tracking, targeting, weather, altimeters.
- **Electronic warfare** — direction finding, jamming, protection.
- **Navigation** — GPS, TACAN, ILS, IFF.
- **ISR** — SIGINT payloads, synthetic aperture radar.

By the end of this course you will have designed, measured, and steered real antennas — the same class of hardware sitting on the aircraft, satellite, or ground station you may one day operate or specify.

## Course roadmap

Five modules, forty-one lessons, culminating in an integrated beamforming + radar capstone:

| Module | Focus |
| :-: | :- |
| 1 | Foundations of Electromagnetics and Antennas |
| 2 | Antenna Types, Simulation, and Measurement |
| 3 | Arrays and ADALM-PHASER Beamforming |
| 4 | Radar Fundamentals and FMCW |
| 5 | Final Capstone Project |

See the [syllabus]({{ '/ece444/syllabus/' | relative_url }}) for the full schedule and both project descriptions.

## Show & tell — real antennas + SDR

_Bring in a set of physical antennas (dipole, monopole, patch, horn, Yagi, small array) and demonstrate reception with an SDR (RTL-SDR / HackRF / Phaser) tuned to a live signal. Discuss what students see on the spectrum as antennas are swapped._

_Hardware checklist:_ `_TBD_`

## Demo — acoustic beam pattern

_Live demonstration of a small speaker array driven by a multi-channel audio interface, showing how phasing multiple sources produces a directional acoustic beam. Serves as an audible, tangible analog for the phased-array behavior we'll formalize in Module 3._

See the [acoustic antenna simulator concept]({{ '/ece444/materials/' | relative_url }}) for the build plan.

## Preparing for L2

Read the assigned sections on **field regions** before the next class — we'll formalize the boundary between the reactive near field, radiating near field, and far field, and connect these regions to how (and where) antennas are actually measured.

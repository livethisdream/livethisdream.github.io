---
title: "Syllabus"
order: 0
permalink: /ece444/syllabus/
---

## Course

**ECE 444 — Antennas, Phased Arrays, and Radar Systems**
Fall 2026

## Instructor

- **Dr. Neil Rogers**
- Office hours: _TBD_
- Contact: _TBD_

## Meeting time & location

- _TBD_

## Course overview

This course progresses from fundamental electromagnetics and antenna theory
through antenna measurement, phased-array beamforming with the ADALM-PHASER
platform, and FMCW radar concepts. Students combine theory and hands-on
laboratories culminating in a capstone project integrating beamforming and
radar signal processing.

## Learning outcomes

By the end of the course, students will be able to:

1. Describe fundamental antenna properties (gain, directivity, polarization,
   impedance) and connect them to system-level radio performance.
2. Model, simulate, and measure common antenna types using industry-standard
   tools and lab equipment.
3. Apply phased-array theory (array factor, beam steering, tapering, null
   steering) using the ADALM-PHASER platform.
4. Analyze radar performance using the radar equation, detection theory, and
   FMCW signal processing (range, Doppler, CFAR).
5. Integrate array beamforming and radar signal processing into a working
   demonstration of tracking a moving target while suppressing a jammer.

## Grading

| Component | Weight |
| :- | :-: |
| Homework | _TBD_ |
| Labs | _TBD_ |
| Midterm | _TBD_ |
| Capstone project | _TBD_ |
| Final exam | _TBD_ |

## Policies

_Placeholder — academic integrity, attendance, late work, accommodations, etc._

## Schedule

Lessons link to notes on the [course home]({{ '/ece444/' | relative_url }}).
Labs are marked **LAB**.

### Module 1 — Foundations of Electromagnetics and Antennas

1. Introduction to Antennas and Field Regions — reactive near-field, radiating near-field, far-field
2. Basic Properties and Terminology — gain, directivity, effective area, beamwidth, boresight, lobes
3. Polarization and Bandwidth
4. Impedance, Feeding, and Baluns
5. Radiation Integrals

### Module 2 — Antenna Types, Simulation, and Measurement

6. Simple Resonant Antennas — isotropic radiators, half-wave dipoles
7. Dipole Simulation Lab **(LAB)**
8. Loop and Monopole Antennas
9. Patch, Slot, and Horn Antennas
10. High-Gain Antennas — reflectors, Yagi-Uda, arrays
11. Pattern Measurement Theory — anechoic chambers, near-field / far-field transformations, standard gain horns
12. Measurement Lab Part 1 — Impedance and S-parameters **(LAB)**
13. Measurement Lab Part 2 — Radiation Patterns **(LAB)**

### Module 3 — Arrays and ADALM-PHASER Beamforming

14. Aperture Distributions and Efficiency
15. The Array Factor and Pattern Multiplication
16. Introduction to Phased Array Hardware — ADALM-PHASER, SDR control
17. Beam Steering Theory
18. Beam Steering Lab **(LAB)**
19. Array Factor and Beamwidth Theory
20. Array Factor Lab **(LAB)**
21. Antenna Pattern Theory — true pattern vs. array factor
22. Antenna Pattern Lab **(LAB)** — AUT measurement using Phaser
23. Sidelobes and Tapering Theory
24. Tapering Lab **(LAB)**
25. Beam Squint and Quantization
26. Null Steering Theory
27. Null Steering Lab **(LAB)**

### Module 4 — Radar Fundamentals and FMCW

28. The Radar Equation, Path Loss, and Radar Cross Section (RCS)
29. Range, Resolution, Doppler Effect, and Radar Types
30. Radar Detection Theory — PD, FAR, dwell time
31. Introduction to FMCW on Phaser
32. Range Calculations Lab **(LAB)**
33. Range Waterfall Lab **(LAB)**
34. Range-Doppler Lab **(LAB)**
35. Moving Target Indication (MTI) Lab **(LAB)**
36. CFAR Processing Theory
37. CFAR Processing Lab **(LAB)**

### Module 5 — Final Capstone Project

**Scenario:** Track a moving target while suppressing a static jammer.

38. Final Project Kickoff
39. Phase 1 — Array Optimization: design beam-steering weights, implement null-steering weights, evaluate array performance
40. Phase 2 — Radar Integration and Demonstration: integrate FMCW radar processing, perform Doppler target tracking, overlay radar tracking results onto the optimized antenna array pattern

## Textbooks & materials

See the [materials page]({{ '/ece444/materials/' | relative_url }}).

## Software & hardware

- ADALM-PHASER
- Antenna simulation software _(TBD)_
- Vector network analyzer (VNA) — for measurement labs
- Anechoic chamber — for pattern measurement labs

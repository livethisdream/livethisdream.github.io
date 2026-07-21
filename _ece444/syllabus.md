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

## Projects

Two graded projects anchor the course:

- **Midterm Project — Antenna Pattern Measurement.** Introduced at Lesson 11, due at Lesson 20. Students design and execute a pattern-measurement campaign on an antenna under test, reduce the data, and report gain, beamwidth, sidelobe level, and polarization behavior against expectations.
- **Final Project — Combined Beamforming + Radar.** Track a moving target while suppressing a static jammer using the ADALM-PHASER. Runs across Lessons 39–41 (Module 5).

## Schedule

Lessons link to notes on the [course home]({{ '/ece444/' | relative_url }}).
Labs are marked **LAB**.

### Module 1 — Foundations of Electromagnetics and Antennas

1. Course Introduction — what an antenna is, why it matters to Air Force operators, course roadmap, SDR + acoustic-beam demos
2. Field Regions — reactive near-field, radiating near-field, far-field
3. Basic Properties and Terminology — gain, directivity, effective area, beamwidth, boresight, lobes
4. Polarization and Bandwidth
5. Impedance, Feeding, and Baluns
6. Radiation Integrals

### Module 2 — Antenna Types, Simulation, and Measurement

7. Simple Resonant Antennas — isotropic radiators, half-wave dipoles
8. Dipole Simulation Lab **(LAB)**
9. Loop and Monopole Antennas
10. Patch, Slot, and Horn Antennas
11. High-Gain Antennas — reflectors, Yagi-Uda, arrays &nbsp; · &nbsp; **Midterm project introduced**
12. Pattern Measurement Theory — anechoic chambers, near-field / far-field transformations, standard gain horns
13. Measurement Lab Part 1 — Impedance and S-parameters **(LAB)**
14. Measurement Lab Part 2 — Radiation Patterns **(LAB)**

### Module 3 — Arrays and ADALM-PHASER Beamforming

15. Aperture Distributions and Efficiency
16. The Array Factor and Pattern Multiplication
17. Introduction to Phased Array Hardware — ADALM-PHASER, SDR control
18. Beam Steering Theory
19. Beam Steering Lab **(LAB)**
20. Array Factor and Beamwidth Theory &nbsp; · &nbsp; **Midterm project due**
21. Array Factor Lab **(LAB)**
22. Antenna Pattern Theory — true pattern vs. array factor
23. Antenna Pattern Lab **(LAB)** — AUT measurement using Phaser
24. Sidelobes and Tapering Theory
25. Tapering Lab **(LAB)**
26. Beam Squint and Quantization
27. Null Steering Theory
28. Null Steering Lab **(LAB)**

### Module 4 — Radar Fundamentals and FMCW

29. The Radar Equation, Path Loss, and Radar Cross Section (RCS)
30. Range, Resolution, Doppler Effect, and Radar Types
31. Radar Detection Theory — PD, FAR, dwell time
32. Introduction to FMCW on Phaser
33. Range Calculations Lab **(LAB)**
34. Range Waterfall Lab **(LAB)**
35. Range-Doppler Lab **(LAB)**
36. Moving Target Indication (MTI) Lab **(LAB)**
37. CFAR Processing Theory
38. CFAR Processing Lab **(LAB)**

### Module 5 — Final Capstone Project

**Scenario:** Track a moving target while suppressing a static jammer.

39. Final Project Kickoff
40. Phase 1 — Array Optimization: design beam-steering weights, implement null-steering weights, evaluate array performance
41. Phase 2 — Radar Integration and Demonstration: integrate FMCW radar processing, perform Doppler target tracking, overlay radar tracking results onto the optimized antenna array pattern

## Textbooks & materials

See the [materials page]({{ '/ece444/materials/' | relative_url }}).

## Software & hardware

- ADALM-PHASER
- Antenna simulation software _(TBD)_
- Vector network analyzer (VNA) — for measurement labs
- Anechoic chamber — for pattern measurement labs

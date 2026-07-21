# ECE 444
## Antennas, Phased Arrays, and Radar Systems

Lesson 1 — Course Introduction

Fall 2026 · Dr. Neil Rogers

---

## Welcome

- Who I am
- Who you are
- What this course is going to ask of you

Note:
Instructor bio; ask each student for name, background, one thing they hope to learn.

---

## What is an antenna?

An antenna is a **transducer** —

it converts a **guided wave** on a cable or waveguide

into a **radiating wave** in free space,

and vice versa.

Note:
Reciprocity: same antenna, same pattern, transmit or receive.
Antennas do not create energy — they shape where the energy goes.

---

## Every wireless system has one

<!-- add block diagram: transmitter → feedline → antenna → free space → antenna → feedline → receiver -->

If the antenna is wrong,
nothing downstream can fix it.

---

## Why you should care — the AF mission

- **Comms** — HF/VHF/UHF/SATCOM, tactical radios, data links
- **Radar** — surveillance, tracking, targeting, weather
- **EW** — direction finding, jamming, protection
- **Nav** — GPS, TACAN, ILS, IFF
- **ISR** — SIGINT, synthetic aperture radar

---

## Course roadmap

1. Foundations of EM and antennas
2. Antenna types, simulation, measurement
3. Arrays and ADALM-PHASER beamforming
4. Radar fundamentals and FMCW
5. Capstone — beamforming + radar

<small>41 lessons, ~15 labs, 2 projects.</small>

---

## Two projects

**Midterm** — Antenna Pattern Measurement
<small>introduced L11 · due L20</small>

**Final** — Combined Beamforming + Radar
<small>track a moving target while suppressing a static jammer</small>

---

## Show & tell

Real antennas + a software-defined radio.

<!-- physical antennas laid out on bench:
     dipole · monopole · patch · horn · Yagi · small array -->

<!-- SDR (RTL-SDR / HackRF / Phaser) tuned to a live signal;
     swap antennas and observe the spectrum change -->

Note:
Have students predict which antenna will work best for which signal,
then show them the result on the SDR waterfall.

---

## Demo — acoustic beam

Phased array, but audible.

<!-- multi-channel audio interface + Class-D amp
     driving a small speaker line array;
     sweep steering angle so students hear the null / peak -->

Note:
This is our stand-in for phased-array intuition
until we get to Module 3 with the Phaser.

---

## For next time

Read: **Field Regions** — reactive near, radiating near, far.

We'll answer: *how far away is "far enough" to measure an antenna?*

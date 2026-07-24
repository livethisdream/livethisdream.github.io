---
title: "Materials"
order: 1
permalink: /ece448/materials/
---

## Primary references

This is a hands-on course, so the "textbooks" are two curated web references
that we'll work through in parallel with in-class flowgraph exercises.

- **[GNU Radio Tutorials](https://wiki.gnuradio.org/index.php/Tutorials)** — official GNU Radio wiki tutorials. Primary reference for GRC, flowgraph construction, and out-of-tree module development.
- **[PySDR — A Guide to SDR and DSP using Python](https://pysdr.org/)** (Marc Lichtman) — free online textbook covering SDR fundamentals, DSP basics, and hands-on examples with PlutoSDR, RTL-SDR, and USRP.

## Hardware & software

- **GNURadio** with **GNU Radio Companion (GRC)** — install instructions posted before Lesson 3.
- **RTL-SDR** — introductory receive-only SDR (25 MHz – 1.75 GHz).
- **HackRF One** — half-duplex Tx/Rx SDR (1 MHz – 6 GHz).
- **PlutoSDR / ADALM-PLUTO** — full-duplex Tx/Rx SDR (325 MHz – 3.8 GHz, extendable).
- **ADALM-PHASER** — phased-array SDR platform (shared with ECE 444).
- **Directional antennas** (Yagi / log-periodic) — for the Lesson 20 fox hunt.

## Legacy slide decks

Prior-year Beamer PDFs are posted here as reference until the corresponding
lessons are ported to the live reveal.js format. Each lesson page also links
to its legacy PDF where one exists.

- [L2 — Noise Figure & Link Budget]({{ '/assets/ece448/legacy-slides/L02-noise-figure-link-budget.pdf' | relative_url }})
- [L3 — Signal Space]({{ '/assets/ece448/legacy-slides/L03-signal-space.pdf' | relative_url }})
- [L14 — ASCII/PAM]({{ '/assets/ece448/legacy-slides/L14-ascii-pam.pdf' | relative_url }})
- [L16 — Final Project Intro]({{ '/assets/ece448/legacy-slides/L16-final-project-intro.pdf' | relative_url }})
- [L22 — DTMF]({{ '/assets/ece448/legacy-slides/L22-dtmf.pdf' | relative_url }})
- [L24 — HD Radio]({{ '/assets/ece448/legacy-slides/L24-hd-radio.pdf' | relative_url }})
- [L35 — ADS-B]({{ '/assets/ece448/legacy-slides/L35-adsb.pdf' | relative_url }})
- [L36 — AIS]({{ '/assets/ece448/legacy-slides/L36-ais.pdf' | relative_url }})

## Supplemental references

Third-party technical documents referenced by specific lessons.

- [ADS-B Decoding Guide]({{ '/assets/ece448/legacy-slides/refs/adsb-decode-guide.pdf' | relative_url }}) — companion reference for L35.
- [1090 MHz Riddle]({{ '/assets/ece448/legacy-slides/refs/1090_Riddle.pdf' | relative_url }}) — Mode-S ES background reading for L35.
- [ADS-B / Magazu (USAF)]({{ '/assets/ece448/legacy-slides/refs/adsb_magazu_usaf.pdf' | relative_url }}) — additional ADS-B reference.
- [NRSC-1011s HD Radio spec]({{ '/assets/ece448/legacy-slides/refs/nrsc-1011s_hd-radio.pdf' | relative_url }}) — companion reference for L24.
- [Differential Encoding Tutorial]({{ '/assets/ece448/legacy-slides/refs/differential-encoding-tutorial.pdf' | relative_url }}) — companion reference for L27–L28 (mPSK).

## Additional resources

_TBD — application notes, videos, and links will be added here as they are pulled into lessons._

# livethisdream.github.io

Personal site of Neil Rogers — RF Field Applications Engineer at Analog Devices,
teaching antennas and SDRs at USAFA. Live at
<https://livethisdream.github.io>.

This is the **umbrella site** — a card-grid front door, patterned on
[usafa-ece.org](https://usafa-ece.org/), that links out to the standalone
course books:

- **ECE 444** — Antennas, Phased Arrays, and Radar Systems ·
  <https://livethisdream.github.io/ece444/> ·
  [livethisdream/ece444](https://github.com/livethisdream/ece444)
- **ECE 448** — Software Defined Radios ·
  <https://livethisdream.github.io/ece448/> ·
  [livethisdream/ece448](https://github.com/livethisdream/ece448)

and hosts personal pages inline (CV, writeups, wishlist, vCard QR utility).

## Stack

- Vite + React + TypeScript
- react-router-dom v7 with BrowserRouter (+ GH Pages 404 fallback)
- @mdx-js/rollup for long-form pages (CV, GRCon25 CTF writeup)
- CSS palette + hero/card system shared with the two course books

Everything under [web/](web/). Build with `npm run build`; serve locally with
`npm run dev`.

## Deploy

`.github/workflows/pages-deploy.yml` builds `web/dist` and publishes via
`actions/deploy-pages@v4` on push to `main`.

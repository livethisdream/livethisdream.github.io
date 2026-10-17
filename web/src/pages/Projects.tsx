import { Link } from 'react-router-dom'

interface Writeup {
  to: string
  // Static pages under public/ (e.g. slide decks) sit outside the router.
  external?: boolean
  title: string
  blurb: string
  date: string
}

const writeups: Writeup[] = [
  {
    to: '/slides/grcon26-ctf/',
    external: true,
    title: 'GRCon 26 CTF Walkthrough Slides (spoilers)',
    blurb:
      'Step-by-step solution deck for the 2026 GNURadio Conference CTF — SigID, CDMA gold codes, ' +
      'HD Radio, drone telemetry, LoRa and more. Flag values are redacted. Press P to present.',
    date: '2026-09-28',
  },
  {
    to: '/posts/grcon25-ctf',
    title: 'GRCon 25 CTF Challenges (spoilers)',
    blurb:
      'Walkthrough of every 2025 GNURadio Conference CTF challenge — ATSC video, FSK audio subcarriers, ' +
      'CW decoding, APRS, and a handful of custom signal-identification puzzles.',
    date: '2025-09-30',
  },
]

export default function Projects() {
  return (
    <div className="article">
      <h1>Writeups &amp; Projects</h1>

      <p>
        Long-form technical notes — CTF walkthroughs, teardowns, projects that
        would rather be a blog post than a repo README.
      </p>

      <div className="block-grid" style={{ marginTop: 24 }}>
        {writeups.map((w) => {
          const body = (
            <>
              <h3>{w.title}</h3>
              <p>{w.blurb}</p>
              <footer>{w.date}</footer>
            </>
          )
          return w.external ? (
            <a key={w.to} href={w.to} className="block-card">{body}</a>
          ) : (
            <Link key={w.to} to={w.to} className="block-card">{body}</Link>
          )
        })}
      </div>
    </div>
  )
}

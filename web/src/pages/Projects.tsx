import { Link } from 'react-router-dom'

interface Writeup {
  to: string
  title: string
  blurb: string
  date: string
}

const writeups: Writeup[] = [
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
        {writeups.map((w) => (
          <Link key={w.to} to={w.to} className="block-card">
            <h3>{w.title}</h3>
            <p>{w.blurb}</p>
            <footer>{w.date} · Read →</footer>
          </Link>
        ))}
      </div>
    </div>
  )
}

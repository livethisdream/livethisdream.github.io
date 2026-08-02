export default function Courses() {
  return (
    <>
      <section className="hero">
        <p className="hero-eyebrow">Teaching</p>
        <h1 className="hero-title">Courses</h1>
        <p className="hero-lede">
          Course sites for the classes I teach at USAFA. Each links to a full Jupyter
          Book with syllabus, lessons, reveal.js decks, and practice problems.
        </p>
      </section>

      <section className="block-grid" aria-label="Courses">
        <a className="block-card" href="/ece444/">
          <h3>ECE 444 — Antennas, Phased Arrays, and Radar</h3>
          <p>Fall 2026 · five modules and a capstone.</p>
          <footer>Open course →</footer>
        </a>

        <a className="block-card" href="/ece448/">
          <h3>ECE 448 — Software Defined Radios</h3>
          <p>Spring 2026 · GNURadio, live-signal decoding, self-defined final project.</p>
          <footer>Open course →</footer>
        </a>
      </section>
    </>
  )
}

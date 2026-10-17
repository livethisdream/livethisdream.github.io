export default function Courses() {
  return (
    <div className="article">
      <section className="hero">
        <p className="hero-eyebrow">Teaching</p>
        <h1 className="hero-title">Courses</h1>
        <p className="hero-lede">
          Undergraduate classes I teach.
        </p>
      </section>

      <section className="block-grid" aria-label="Courses">
        <a className="block-card" href="/ece343/">
          <h3>ECE 343 — Intro to Electromagnetics</h3>
          <p>Spring 2027 · A hands-on, interactive approach to dynamic field propagation.</p>
        </a>

        <a className="block-card" href="/ece444/">
          <h3>ECE 444 — Antennas, Phased Arrays, and Radar</h3>
          <p>Fall 2026 · Antenna theory and real-world applications.</p>
        </a>

        <a className="block-card" href="/ece448/">
          <h3>ECE 448 — Software Defined Radios</h3>
          <p>Spring 2026 · Learning communications through GNURadio and practical signals.</p>
        </a>
      </section>
    </div>
  )
}

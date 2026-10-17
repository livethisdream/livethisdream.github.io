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
          <span className="card-code">ECE 343</span>
          <h3>Intro to Electromagnetics</h3>
        </a>

        <a className="block-card" href="/ece444/">
          <span className="card-code">ECE 444</span>
          <h3>Antennas, Phased Arrays, and Radar</h3>
        </a>

        <a className="block-card" href="/ece448/">
          <span className="card-code">ECE 448</span>
          <h3>Software Defined Radios</h3>
        </a>
      </section>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="hero-eyebrow">
          RF Field Applications Engineer, Analog Devices · Erdle Chair, Department of ECE, USAFA
        </p>
        <h1 className="hero-title">Neil Rogers, PhD</h1>
        <p className="hero-lede">
          Demystifying and improving RF hardware — for the customers who build it
          and the students who are learning it.
        </p>
      </section>

      <section className="block-grid" aria-label="Sections">
        <a className="block-card" href="/courses">
          <h3>Courses</h3>
          <p>ECE 343, 444, and 448 at USAFA.</p>
        </a>

        <a className="block-card" href="/projects">
          <h3>Projects</h3>
          <p>Writeups and side projects.</p>
        </a>

        <a className="block-card" href="/cv">
          <h3>CV</h3>
          <p>Work history, education, and publications.</p>
        </a>
      </section>
    </>
  )
}

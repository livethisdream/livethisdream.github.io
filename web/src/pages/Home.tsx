export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="hero-eyebrow">RF Field Applications Engineer · Analog Devices, Inc.</p>
        <h1 className="hero-title">Neil Rogers</h1>
        <p className="hero-lede">
          Making RF hardware easier to use — for the customers who build it, and the
          students who are learning how. Currently teaching antennas, phased arrays,
          and radar at USAFA.
        </p>
      </section>

      <section className="block-grid" aria-label="Sections">
        <a className="block-card" href="/cv">
          <span className="num">CV</span>
          <h3>Curriculum Vitae</h3>
          <p>Work history, education, publications, and the projects along the way.</p>
          <footer>Read →</footer>
        </a>

        <a className="block-card" href="/ece444/">
          <span className="num">444</span>
          <h3>ECE 444 — Antennas, Phased Arrays, and Radar</h3>
          <p>Fall 2026 · Five modules, 40 lessons, and a capstone that puts hardware in your hands.</p>
          <footer>Open course →</footer>
        </a>

        <a className="block-card" href="/ece448/">
          <span className="num">448</span>
          <h3>ECE 448 — Software Defined Radios</h3>
          <p>Spring 2026 · GNURadio flowgraphs, live-signal decoding, and a self-defined final project.</p>
          <footer>Open course →</footer>
        </a>

        <a className="block-card" href="/projects">
          <span className="num">✍</span>
          <h3>Writeups &amp; Projects</h3>
          <p>Long-form technical notes — CTF walkthroughs, teardowns, side projects.</p>
          <footer>Browse →</footer>
        </a>

        <a className="block-card" href="/qr">
          <span className="num">QR</span>
          <h3>vCard QR</h3>
          <p>Point a camera at the QR on the back of my business card and land here.</p>
          <footer>Open →</footer>
        </a>

        <a className="block-card" href="/wishlist">
          <span className="num">★</span>
          <h3>Wishlist</h3>
          <p>Ideas I want to build. Some are looking for collaborators.</p>
          <footer>Browse →</footer>
        </a>
      </section>
    </>
  )
}

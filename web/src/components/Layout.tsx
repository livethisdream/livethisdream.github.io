import { NavLink, Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="site">
      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand">N. Rogers</Link>
          <nav aria-label="Primary">
            <NavLink to="/cv">CV</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/ece444/" reloadDocument>ECE 444</NavLink>
            <NavLink to="/ece448/" reloadDocument>ECE 448</NavLink>
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <span>&copy; {new Date().getFullYear()} Neil Rogers</span>
          <span>
            <a href="https://github.com/livethisdream">GitHub</a>
            {' · '}
            <a href="https://www.linkedin.com/in/neil-rogers/">LinkedIn</a>
          </span>
        </div>
      </footer>
    </div>
  )
}

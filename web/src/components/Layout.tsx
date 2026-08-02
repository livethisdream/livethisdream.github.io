import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  const [q, setQ] = useState('')

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const query = q.trim()
    if (!query) return
    const url =
      'https://www.google.com/search?q=' +
      encodeURIComponent('site:livethisdream.github.io ' + query)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="site">
      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand" aria-label="Neil Rogers — home">
            <img src="/nr-logo.png" alt="Neil Rogers" className="brand-logo" />
          </Link>
          <form
            className="header-search"
            role="search"
            onSubmit={onSearchSubmit}
          >
            <label htmlFor="site-search" className="visually-hidden">
              Search this site
            </label>
            <input
              id="site-search"
              type="search"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
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

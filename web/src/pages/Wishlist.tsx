import { useCallback, useEffect, useState } from 'react'
import '../styles/link-preview.css'

/*
 * Content: /wishlist.json, generated at build time from pages/nr-wishlist.md
 * (synced one-way from Obsidian via Gitea) by scripts/build-wishlist.mjs.
 * Marks: the wishlist-marks Cloudflare Worker (worker/). If VITE_WISHLIST_API
 * isn't set, the list renders read-only.
 */

type Item = { id: string; title: string; description: string; url: string; image: string | null; host: string }
type Wishlist = { updated: string | null; sections: { name: string; items: Item[] }[] }
type Marks = Record<string, { at: number | null }>
type Undo = Record<string, { token: string; at: number }>

const API = (import.meta.env.VITE_WISHLIST_API as string | undefined)?.replace(/\/+$/, '')
const UNDO_MS = 10 * 60_000
const UNDO_KEY = 'wishlist-undo'
const HIDE_KEY = 'wishlist-hide-marks'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function omit<T>(obj: Record<string, T>, key: string): Record<string, T> {
  const next = { ...obj }
  delete next[key]
  return next
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode etc. — undo just won't survive a reload */
  }
}

export default function WishlistPage() {
  const [list, setList] = useState<Wishlist | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [marks, setMarks] = useState<Marks>({})
  const [undo, setUndo] = useState<Undo>(() => load(UNDO_KEY, {}))
  const [hide, setHide] = useState<boolean>(() => load(HIDE_KEY, false))
  const [busy, setBusy] = useState<string | null>(null)
  const [, tick] = useState(0)

  const refreshMarks = useCallback(async () => {
    if (!API) return
    try {
      const res = await fetch(`${API}/marks`)
      if (res.ok) setMarks(((await res.json()) as { marks: Marks }).marks)
    } catch {
      /* marks are best-effort; the list still renders */
    }
  }, [])

  useEffect(() => {
    fetch('/wishlist.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setList)
      .catch(() => setError('Could not load the wishlist.'))
    refreshMarks()
  }, [refreshMarks])

  // Re-render each 30s so undo buttons disappear when their window closes.
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  const updateUndo = (next: Undo) => {
    setUndo(next)
    save(UNDO_KEY, next)
  }

  async function markBought(item: Item) {
    if (!API || !confirm(`Mark "${item.title}" as bought? Everyone visiting this page will see it.`)) return
    setBusy(item.id)
    try {
      const res = await fetch(`${API}/marks/${item.id}`, { method: 'POST' })
      if (res.status === 201) {
        const { token, at } = (await res.json()) as { token: string; at: number }
        updateUndo({ ...undo, [item.id]: { token, at } })
        setMarks({ ...marks, [item.id]: { at } })
      } else if (res.status === 409) {
        alert('Someone already marked this one as bought.')
        await refreshMarks()
      } else if (res.status === 429) {
        alert('Too many marks from this network — try again later.')
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch {
      alert('Could not reach the server. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  async function undoMark(item: Item) {
    const u = undo[item.id]
    if (!API || !u) return
    setBusy(item.id)
    try {
      const res = await fetch(`${API}/marks/${item.id}`, { method: 'DELETE', headers: { 'x-undo-token': u.token } })
      if (res.ok) {
        setMarks(omit(marks, item.id))
      } else {
        alert('The undo window has closed for this item.')
      }
      updateUndo(omit(undo, item.id))
    } finally {
      setBusy(null)
    }
  }

  const toggleHide = () => {
    setHide(!hide)
    save(HIDE_KEY, !hide)
  }

  return (
    <article className="article">
      <h1>Neil's Wishlist</h1>
      {list?.updated && (
        <p>
          <em>Last updated: {list.updated}</em>
        </p>
      )}
      {API && (
        <p className="wishlist-help">
          Bought something? Tap <strong>I bought this</strong> so nobody doubles up.{' '}
          <button type="button" className="wishlist-linkbtn" onClick={toggleHide}>
            {hide ? 'Show bought marks' : 'Hide bought marks (for Neil)'}
          </button>
        </p>
      )}
      {error && <p>{error}</p>}
      {!list && !error && <p>Loading…</p>}

      {list?.sections.map((section) => (
        <section key={section.name}>
          <h2>{section.name}</h2>
          {section.items.map((item) => {
            const bought = !hide && Boolean(marks[item.id])
            const u = undo[item.id]
            const canUndo = !hide && u && Date.now() - u.at < UNDO_MS
            return (
              <div key={item.id} className={`link-preview-card${bought ? ' is-bought' : ''}`}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.image && (
                    <div className="link-preview-image" style={{ backgroundImage: `url('${item.image}')` }} />
                  )}
                  <div className="link-preview-content">
                    <h4 className="link-preview-title">
                      {item.title}
                      {bought && <span className="wishlist-badge">Bought</span>}
                    </h4>
                    {item.description && <p className="link-preview-description">{item.description}</p>}
                    <span className="link-preview-url">{item.host}</span>
                  </div>
                </a>
                {API && !hide && (!bought || canUndo) && (
                  <div className="wishlist-actions">
                    {!bought && (
                      <button type="button" disabled={busy === item.id} onClick={() => markBought(item)}>
                        I bought this
                      </button>
                    )}
                    {canUndo && bought && (
                      <button type="button" disabled={busy === item.id} onClick={() => undoMark(item)}>
                        Undo
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </section>
      ))}
    </article>
  )
}

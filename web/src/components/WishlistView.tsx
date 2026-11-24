import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import '../styles/wishlist.css'
import { API } from '../lib/wishlist'

/*
 * Shared wishlist grid + "I bought this" marks. Used by Neil's list
 * (pages/Wishlist.tsx, built from the Obsidian note) and the web-managed
 * lists (pages/ListPage.tsx, stored by the Worker). Marks go to the
 * wishlist-marks Cloudflare Worker (worker/); without VITE_WISHLIST_API the
 * grid renders read-only.
 */

export type Item = { id: string; title: string; description: string; url: string | null; image: string | null; host: string | null }
export type Wishlist = { title?: string; updated: string | null; sections: { name: string; items: Item[] }[] }
type Marks = Record<string, { at: number | null }>
type Undo = Record<string, { token: string; at: number }>

const UNDO_MS = 10 * 60_000
const UNDO_KEY = 'wishlist-undo'
const HIDE_KEY = 'wishlist-hide-marks'
// Short-link hosts shown as the store people recognize.
const STORE_NAMES: Record<string, string> = { 'a.co': 'amazon.com', 'amzn.to': 'amazon.com', 'amzn.com': 'amazon.com' }

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

export default function WishlistView({ title, owner, list, error }: { title: string; owner: string; list: Wishlist | null; error: string | null }) {
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

  const total = list?.sections.reduce((n, s) => n + s.items.length, 0) ?? 0
  const updated =
    list?.updated && !Number.isNaN(Date.parse(list.updated))
      ? new Date(list.updated).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : list?.updated

  return (
    <article className="article wl">
      <header className="wl-hero">
        <Link className="wl-back" to="/wishlist">
          ← All wishlists
        </Link>
        <h1>{title}</h1>
        {list && (
          <p className="wl-meta">
            {total} {total === 1 ? 'idea' : 'ideas'}
            {updated && <> · updated {updated}</>}
          </p>
        )}
        {API && (
          <div className="wl-help">
            <p>
              Bought something? Tap <strong>I bought this</strong> so nobody doubles up.
            </p>
            <button type="button" className="wl-toggle" aria-pressed={hide} onClick={toggleHide}>
              {hide ? 'Show bought marks' : `Hide bought marks (for ${owner})`}
            </button>
          </div>
        )}
      </header>

      {error && <p>{error}</p>}
      {!list && !error && <p className="wl-loading">Loading…</p>}

      {list?.sections.map((section) => (
        <section key={section.name} className="wl-section">
          <h2 className="wl-section-title">
            {section.name}
            <span className="wl-count">{section.items.length}</span>
          </h2>
          <ul className="wl-grid">
            {section.items.map((item) => (
              <Card
                key={item.id}
                item={item}
                bought={!hide && Boolean(marks[item.id])}
                canUndo={!hide && Boolean(undo[item.id]) && Date.now() - undo[item.id].at < UNDO_MS}
                showActions={Boolean(API) && !hide}
                busy={busy === item.id}
                onBuy={() => markBought(item)}
                onUndo={() => undoMark(item)}
              />
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}

function Card(props: {
  item: Item
  bought: boolean
  canUndo: boolean
  showActions: boolean
  busy: boolean
  onBuy: () => void
  onUndo: () => void
}) {
  const { item, bought, canUndo, showActions, busy, onBuy, onUndo } = props
  const [imgOk, setImgOk] = useState(true)
  const host = item.host?.replace(/^www\./, '') ?? null
  const store = host && (STORE_NAMES[host] ?? host)
  const initial = (store ?? item.title).charAt(0).toUpperCase()

  return (
    <li className={`wl-card${bought ? ' is-bought' : ''}${item.url ? '' : ' is-plain'}`}>
      <Media url={item.url}>
        {item.image && imgOk ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="wl-monogram" aria-hidden="true">
            {initial}
          </span>
        )}
        {bought && <span className="wl-ribbon">Bought</span>}
      </Media>
      <div className="wl-body">
        <h3 className="wl-title">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </h3>
        {item.description && <p className="wl-desc">{item.description}</p>}
        <div className="wl-foot">
          <span className="wl-store">{store ?? 'Any store'}</span>
          {showActions && !bought && (
            <button type="button" className="wl-btn" disabled={busy} onClick={onBuy}>
              I bought this
            </button>
          )}
          {showActions && bought && canUndo && (
            <button type="button" className="wl-btn is-ghost" disabled={busy} onClick={onUndo}>
              Undo
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

// The picture area links to the product when there is one.
function Media({ url, children }: { url: string | null; children: ReactNode }) {
  return url ? (
    <a className="wl-media" href={url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
      {children}
    </a>
  ) : (
    <div className="wl-media">{children}</div>
  )
}

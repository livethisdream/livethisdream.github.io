import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Wishlist } from '../components/WishlistView'
import { API, LISTS, type ListRef } from '../lib/wishlist'
import '../styles/wishlist.css'

/* /wishlist: a card per person's list (see LISTS in lib/wishlist.ts). */

type Summary = { title: string; count: number; updated: string | null; images: string[] } | 'missing' | null

async function load(ref: ListRef): Promise<Summary> {
  const url = ref.source === 'static' ? '/wishlist.json' : API ? `${API}/lists/${ref.slug}` : null
  if (!url) return 'missing'
  const r = await fetch(url)
  if (!r.ok) return 'missing'
  const data = (await r.json()) as Wishlist
  const items = data.sections.flatMap((s) => s.items)
  return {
    title: data.title || `${ref.name}'s Wishlist`,
    count: items.length,
    updated: data.updated,
    images: items.map((i) => i.image).filter((i): i is string => Boolean(i)).slice(0, 4),
  }
}

const fmt = (iso: string | null) =>
  iso && !Number.isNaN(Date.parse(iso))
    ? new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : null

export default function WishlistIndex() {
  const [summaries, setSummaries] = useState<Record<string, Summary>>({})

  useEffect(() => {
    for (const ref of LISTS) {
      load(ref)
        .then((s) => setSummaries((prev) => ({ ...prev, [ref.slug]: s })))
        .catch(() => setSummaries((prev) => ({ ...prev, [ref.slug]: 'missing' })))
    }
  }, [])

  return (
    <article className="article wl">
      <header className="wl-hero">
        <h1>Our Wishlists</h1>
        <p className="wl-meta">Pick a person to see their ideas. Tap “I bought this” on anything you get so nobody doubles up.</p>
      </header>
      <ul className="wli-grid">
        {LISTS.map((ref) => {
          const s = summaries[ref.slug]
          if (s === 'missing') return null
          return (
            <li key={ref.slug}>
              <Link className="wli-card" to={`/wishlist/${ref.slug}`}>
                <span className={`wli-mosaic n${s?.images.length ?? 0}`} aria-hidden="true">
                  {s && s.images.length > 0 ? (
                    s.images.map((src) => <img key={src} src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.display = 'none')} />)
                  ) : (
                    <span className="wl-monogram">{ref.name.charAt(0)}</span>
                  )}
                </span>
                <span className="wli-body">
                  <span className="wli-title">{s?.title ?? `${ref.name}'s Wishlist`}</span>
                  <span className="wli-meta">
                    {s ? (
                      <>
                        {s.count} {s.count === 1 ? 'idea' : 'ideas'}
                        {fmt(s.updated) && <> · updated {fmt(s.updated)}</>}
                      </>
                    ) : (
                      'Loading…'
                    )}
                  </span>
                  <span className="wli-go">View list →</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

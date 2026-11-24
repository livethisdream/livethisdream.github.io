import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API, ownerName } from '../lib/wishlist'
import '../styles/wishlist.css'

/*
 * Editor for a web-managed list: /wishlist/<name>/edit#key=<secret>.
 * The secret edit link is the only credential. It's also remembered in this
 * browser so reopening /wishlist/<name>/edit works without the hash.
 * Bought marks are deliberately never loaded here.
 */

type EItem = {
  id: string
  title: string
  url: string | null
  image: string | null
  description: string
  host: string | null
  received: boolean
}
type EList = { title: string; updated?: string; sections: { name: string; items: EItem[] }[] }
type Status = 'idle' | 'saving' | 'saved' | 'error'

const keyStore = (slug: string) => `wishlist-edit-key:${slug}`
function readKey(slug: string) {
  const fromHash = new URLSearchParams(window.location.hash.slice(1)).get('key')
  if (fromHash) {
    try {
      localStorage.setItem(keyStore(slug), fromHash)
    } catch {
      /* fine: the hash still works */
    }
    return fromHash
  }
  try {
    return localStorage.getItem(keyStore(slug))
  } catch {
    return null
  }
}

async function urlId(url: string) {
  const u = new URL(url)
  const norm = (u.host.replace(/^www\./, '') + u.pathname.replace(/\/+$/, '') + u.search).toLowerCase()
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm))
  return [...new Uint8Array(buf)].slice(0, 6).map((b) => b.toString(16).padStart(2, '0')).join('')
}
const randomId = () => [...crypto.getRandomValues(new Uint8Array(6))].map((b) => b.toString(16).padStart(2, '0')).join('')

function normalizeUrl(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`)
    return u.hostname.includes('.') ? u.href : null
  } catch {
    return null
  }
}

export default function ListEditor() {
  const { slug = '' } = useParams()
  const owner = ownerName(slug)
  const [key, setKey] = useState<string | null>(() => readKey(slug))
  const [list, setList] = useState<EList | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'claimable' | 'nokey' | 'badkey' | 'missing' | 'error'>('loading')
  const [status, setStatus] = useState<Status>('idle')
  const [justClaimed, setJustClaimed] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!API) return setState('error')
    const headers: Record<string, string> = key ? { 'x-edit-key': key } : {}
    fetch(`${API}/lists/${encodeURIComponent(slug)}`, { headers })
      .then(async (r) => {
        if (r.status === 404) {
          const b = (await r.json().catch(() => ({}))) as { claimable?: boolean }
          return setState(b.claimable ? 'claimable' : 'missing')
        }
        if (r.status === 403) return setState('badkey')
        if (!r.ok) return setState('error')
        if (!key) return setState('nokey')
        setList((await r.json()) as EList)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [slug, key])

  const persist = useCallback(
    (next: EList) => {
      if (!API || !key) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      setStatus('saving')
      saveTimer.current = setTimeout(async () => {
        try {
          const r = await fetch(`${API}/lists/${encodeURIComponent(slug)}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json', 'x-edit-key': key },
            body: JSON.stringify(next),
          })
          setStatus(r.ok ? 'saved' : 'error')
        } catch {
          setStatus('error')
        }
      }, 700)
    },
    [key, slug],
  )

  // Warn before leaving with an unsaved change.
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (status === 'saving' || status === 'error') e.preventDefault()
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [status])

  const update = (fn: (draft: EList) => void) => {
    if (!list) return
    const next: EList = structuredClone(list)
    fn(next)
    setList(next)
    persist(next)
  }

  async function claim() {
    if (!API) return
    const r = await fetch(`${API}/lists/${encodeURIComponent(slug)}/claim`, { method: 'POST' })
    if (!r.ok) {
      alert(r.status === 409 ? 'This list was already set up. Use your private edit link.' : 'Could not set up the list.')
      return
    }
    const { key: k, list: l } = (await r.json()) as { key: string; list: EList }
    window.history.replaceState(null, '', `#key=${k}`)
    try {
      localStorage.setItem(keyStore(slug), k)
    } catch {
      /* hash still works */
    }
    setKey(k)
    setList(l)
    setJustClaimed(true)
    setState('ready')
  }

  const publicUrl = `${window.location.origin}/wishlist/${slug}`
  const editUrl = key ? `${window.location.origin}/wishlist/${slug}/edit#key=${key}` : ''

  if (state === 'loading') return <article className="article wl"><p className="wl-loading">Loading…</p></article>
  if (state === 'claimable')
    return (
      <article className="article wl wle">
        <h1>Set up {owner}'s Wishlist</h1>
        <p>This creates the list and gives you a private link for editing it. Only someone with that link can make changes.</p>
        <button type="button" className="wl-btn wle-big" onClick={claim}>
          Create my list
        </button>
      </article>
    )
  if (state !== 'ready' || !list)
    return (
      <article className="article wl wle">
        <h1>Edit {owner}'s Wishlist</h1>
        <p>
          {state === 'nokey' || state === 'badkey'
            ? 'This page needs your private edit link. Open the link you saved when the list was set up.'
            : state === 'missing'
              ? 'There’s no list here.'
              : 'Could not load the list. Please try again.'}
        </p>
        <p>
          <Link to={`/wishlist/${slug}`}>View the list →</Link>
        </p>
      </article>
    )

  const active = list.sections.map((s, si) => ({ ...s, si, items: s.items.map((it, ii) => ({ it, ii })).filter(({ it }) => !it.received) }))
  const received = list.sections.flatMap((s, si) => s.items.map((it, ii) => ({ it, si, ii })).filter(({ it }) => it.received))

  return (
    <article className="article wl wle">
      <header className="wle-head">
        <div>
          <h1>Edit wishlist</h1>
          <p className="wl-meta">
            <SaveStatus status={status} />
          </p>
        </div>
        <div className="wle-head-links">
          <a className="wl-toggle" href={publicUrl} target="_blank" rel="noopener noreferrer">
            View ↗
          </a>
          <CopyButton text={publicUrl} label="Copy share link" />
        </div>
      </header>

      {justClaimed && (
        <div className="wle-note">
          <strong>Bookmark this page now.</strong> Its address is your private edit link. Anyone with it can change
          your list, so don't share it. Share the public link instead.
          <div className="wle-note-actions">
            <CopyButton text={editUrl} label="Copy my edit link" />
          </div>
        </div>
      )}

      <label className="wle-field">
        <span>List title</span>
        <input
          value={list.title}
          maxLength={80}
          onChange={(e) => update((d) => void (d.title = e.target.value))}
          placeholder={`${owner}'s Wishlist`}
        />
      </label>

      <AddItem
        sections={list.sections.map((s) => s.name)}
        slug={slug}
        editKey={key ?? ''}
        existing={new Set(list.sections.flatMap((s) => s.items.map((i) => i.id)))}
        onAdd={(item, si) => update((d) => void d.sections[si].items.unshift(item))}
      />

      {active.map((s) => (
        <section key={s.name + s.si} className="wl-section">
          <h2 className="wl-section-title">
            {s.name}
            <span className="wl-count">{s.items.length}</span>
          </h2>
          {s.items.length === 0 && <p className="wle-empty">Nothing here yet.</p>}
          <ul className="wle-list">
            {s.items.map(({ it, ii }, pos) => (
              <Row
                key={it.id}
                item={it}
                sections={list.sections.map((x) => x.name)}
                sectionIndex={s.si}
                first={pos === 0}
                last={pos === s.items.length - 1}
                onChange={(patch) => update((d) => void Object.assign(d.sections[s.si].items[ii], patch))}
                onMove={(dir) =>
                  update((d) => {
                    const items = d.sections[s.si].items
                    const visible = items.map((x, i) => ({ x, i })).filter(({ x }) => !x.received)
                    const target = visible[pos + dir]
                    if (target) [items[ii], items[target.i]] = [items[target.i], items[ii]]
                  })
                }
                onSection={(to) =>
                  update((d) => {
                    const [moved] = d.sections[s.si].items.splice(ii, 1)
                    d.sections[to].items.unshift(moved)
                  })
                }
                onReceived={() => update((d) => void (d.sections[s.si].items[ii].received = true))}
                onDelete={() => {
                  if (confirm(`Delete "${it.title}"?`)) update((d) => void d.sections[s.si].items.splice(ii, 1))
                }}
              />
            ))}
          </ul>
        </section>
      ))}

      {received.length > 0 && (
        <details className="wle-received">
          <summary>
            Received <span className="wl-count">{received.length}</span>
          </summary>
          <ul className="wle-list">
            {received.map(({ it, si, ii }) => (
              <li key={it.id} className="wle-row is-received">
                <Thumb item={it} />
                <div className="wle-row-main">
                  <span className="wle-row-title">{it.title}</span>
                </div>
                <div className="wle-row-actions">
                  <button type="button" className="wle-mini" onClick={() => update((d) => void (d.sections[si].items[ii].received = false))}>
                    Put back
                  </button>
                  <button
                    type="button"
                    className="wle-mini is-danger"
                    onClick={() => {
                      if (confirm(`Delete "${it.title}"?`)) update((d) => void d.sections[si].items.splice(ii, 1))
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  )
}

function SaveStatus({ status }: { status: Status }) {
  if (status === 'saving') return <>Saving…</>
  if (status === 'saved') return <>All changes saved ✓</>
  if (status === 'error') return <span className="wle-error">Couldn't save. Check your connection; your next change will retry.</span>
  return <>Changes save automatically.</>
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="wl-toggle"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          setTimeout(() => setDone(false), 1800)
        } catch {
          prompt('Copy this link:', text)
        }
      }}
    >
      {done ? 'Copied ✓' : label}
    </button>
  )
}

function Thumb({ item }: { item: Pick<EItem, 'image' | 'title' | 'host'> }) {
  const [ok, setOk] = useState(true)
  return (
    <span className="wle-thumb" aria-hidden="true">
      {item.image && ok ? (
        <img src={item.image} alt="" referrerPolicy="no-referrer" onError={() => setOk(false)} />
      ) : (
        <span>{(item.host?.replace(/^www\./, '') ?? item.title).charAt(0).toUpperCase()}</span>
      )}
    </span>
  )
}

function AddItem(props: {
  sections: string[]
  slug: string
  editKey: string
  existing: Set<string>
  onAdd: (item: EItem, sectionIndex: number) => void
}) {
  const { sections, slug, editKey, existing, onAdd } = props
  const [link, setLink] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [section, setSection] = useState(0)
  const [looking, setLooking] = useState(false)
  const [looked, setLooked] = useState('')

  async function lookUp(raw: string) {
    const url = normalizeUrl(raw)
    if (!url || !API || url === looked) return
    setLooked(url)
    setLooking(true)
    try {
      const r = await fetch(`${API}/lists/${encodeURIComponent(slug)}/preview?url=${encodeURIComponent(url)}`, {
        headers: { 'x-edit-key': editKey },
      })
      if (r.ok) {
        const p = (await r.json()) as { title: string; image: string | null; description: string }
        setTitle((t) => t || p.title)
        setDescription((d) => d || p.description)
        setImage(p.image)
      }
    } finally {
      setLooking(false)
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const url = link.trim() ? normalizeUrl(link) : null
    if (link.trim() && !url) return alert('That link doesn’t look right.')
    const name = title.trim()
    if (!name) return alert('Give it a name.')
    const id = url ? await urlId(url) : randomId()
    if (existing.has(id)) return alert('That link is already on your list.')
    onAdd({ id, title: name, url, image, description: description.trim(), host: url ? new URL(url).host : null, received: false }, section)
    setLink('')
    setTitle('')
    setDescription('')
    setImage(null)
    setLooked('')
  }

  return (
    <form className="wle-add" onSubmit={add} noValidate>
      <h2>Add something</h2>
      <label className="wle-field">
        <span>Link (optional)</span>
        <input
          type="text"
          autoCapitalize="off"
          autoCorrect="off"
          inputMode="url"
          placeholder="Paste a product link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onPaste={(e) => {
            const t = e.clipboardData.getData('text')
            setTimeout(() => lookUp(t), 0)
          }}
          onBlur={() => lookUp(link)}
        />
      </label>
      {(image || looking) && (
        <div className="wle-preview">
          {looking ? <span className="wl-meta">Looking it up…</span> : image && <img src={image} alt="" referrerPolicy="no-referrer" />}
        </div>
      )}
      <label className="wle-field">
        <span>Name</span>
        <input value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wool socks, size M" />
      </label>
      <label className="wle-field">
        <span>Note (optional)</span>
        <textarea value={description} maxLength={400} rows={2} onChange={(e) => setDescription(e.target.value)} placeholder="Color, size, anything helpful" />
      </label>
      <div className="wle-add-row">
        <label className="wle-field wle-inline">
          <span>Priority</span>
          <select value={section} onChange={(e) => setSection(Number(e.target.value))}>
            {sections.map((n, i) => (
              <option key={n + i} value={i}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="wl-btn wle-add-btn" disabled={looking}>
          Add to list
        </button>
      </div>
    </form>
  )
}

function Row(props: {
  item: EItem
  sections: string[]
  sectionIndex: number
  first: boolean
  last: boolean
  onChange: (patch: Partial<EItem>) => void
  onMove: (dir: -1 | 1) => void
  onSection: (to: number) => void
  onReceived: () => void
  onDelete: () => void
}) {
  const { item, sections, sectionIndex, first, last, onChange, onMove, onSection, onReceived, onDelete } = props
  const [open, setOpen] = useState(false)
  return (
    <li className={`wle-row${open ? ' is-open' : ''}`}>
      <Thumb item={item} />
      <button type="button" className="wle-row-main" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="wle-row-title">{item.title}</span>
        <span className="wle-row-sub">{item.host?.replace(/^www\./, '') ?? 'No link'}</span>
      </button>
      <div className="wle-row-actions">
        <button type="button" className="wle-mini" onClick={() => onMove(-1)} disabled={first} aria-label="Move up">
          ↑
        </button>
        <button type="button" className="wle-mini" onClick={() => onMove(1)} disabled={last} aria-label="Move down">
          ↓
        </button>
        <button type="button" className="wle-mini is-good" onClick={onReceived}>
          Received
        </button>
      </div>
      {open && (
        <div className="wle-row-edit">
          <label className="wle-field">
            <span>Name</span>
            <input value={item.title} maxLength={200} onChange={(e) => onChange({ title: e.target.value })} />
          </label>
          <label className="wle-field">
            <span>Link</span>
            <input
              type="text"
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              defaultValue={item.url ?? ''}
              placeholder="https://…"
              onBlur={(e) => {
                const url = e.target.value.trim() ? normalizeUrl(e.target.value) : null
                if (e.target.value.trim() && !url) return alert('That link doesn’t look right.')
                onChange({ url, host: url ? new URL(url).host : null })
              }}
            />
          </label>
          <label className="wle-field">
            <span>Note</span>
            <textarea value={item.description} maxLength={400} rows={2} onChange={(e) => onChange({ description: e.target.value })} />
          </label>
          <div className="wle-add-row">
            <label className="wle-field wle-inline">
              <span>Priority</span>
              <select value={sectionIndex} onChange={(e) => onSection(Number(e.target.value))}>
                {sections.map((n, i) => (
                  <option key={n + i} value={i}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="wle-mini is-danger" onClick={onDelete}>
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

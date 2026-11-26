// Web-managed wishlists (for people without Obsidian). Stored in KV:
//   list:<slug>     -> the list JSON
//   listkey:<slug>  -> sha256 of the secret edit key
//
//   GET  /lists/<slug>            public view (received items hidden);
//                                 with X-Edit-Key: the full list for editing
//   POST /lists/<slug>/claim      one time per slug in ALLOWED_LISTS:
//                                 creates the list and returns { key }
//   PUT  /lists/<slug>            X-Edit-Key: replace the list
//   GET  /lists/<slug>/preview?url=...   X-Edit-Key: title/photo for a link
import { json, sha256, rateLimited, clientIp } from './util.js'
import { preview } from './preview.js'

const SLUG = /^[a-z0-9][a-z0-9-]{0,31}$/
const ID = /^[0-9a-f]{12}$/
const MAX_ITEMS = 300
const DEFAULT_SECTIONS = ['High', 'Medium', 'Low']
// Names the site uses for other pages; never claimable as web lists.
const RESERVED = new Set(['nr', 'new', 'edit', 'index'])

const allowedSlugs = (env) =>
  (env.ALLOWED_LISTS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s && !RESERVED.has(s))

function newKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function keyOk(env, slug, key) {
  if (!key) return false
  const stored = await env.MARKS.get(`listkey:${slug}`)
  if (!stored) return false
  const given = await sha256(key)
  let diff = given.length ^ stored.length
  for (let i = 0; i < Math.min(given.length, stored.length); i++) diff |= given.charCodeAt(i) ^ stored.charCodeAt(i)
  return diff === 0
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
function httpUrl(v, max = 2000) {
  if (typeof v !== 'string' || !v.trim() || v.length > max) return null
  try {
    const u = new URL(v.trim())
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null
  } catch {
    return null
  }
}

// Accept only the shape the editor produces; drop anything else.
export function sanitize(doc) {
  if (!doc || typeof doc !== 'object' || !Array.isArray(doc.sections)) throw new Error('bad list')
  let count = 0
  const seen = new Set()
  const sections = doc.sections.slice(0, 12).map((s) => ({
    name: str(s?.name, 40) || 'List',
    items: (Array.isArray(s?.items) ? s.items : [])
      .filter((i) => {
        if (!i || !ID.test(i.id) || seen.has(i.id) || count >= MAX_ITEMS) return false
        seen.add(i.id)
        count++
        return true
      })
      .map((i) => {
        const url = httpUrl(i.url)
        const image = httpUrl(i.image)
        return {
          id: i.id,
          title: str(i.title, 200) || (url ? new URL(url).host : 'Untitled'),
          url,
          image: image && image.startsWith('https:') ? image : null,
          description: str(i.description, 400),
          host: url ? new URL(url).host : null,
          received: i.received === true,
        }
      }),
  }))
  return { title: str(doc.title, 80), sections, updated: new Date().toISOString() }
}

const publicView = (doc) => ({
  title: doc.title,
  updated: doc.updated,
  sections: doc.sections
    .map((s) => ({ name: s.name, items: s.items.filter((i) => !i.received).map(({ received, ...rest }) => (void received, rest)) }))
    .filter((s) => s.items.length),
})

// Every item ID across all web lists (for validating bought marks).
export async function allListItemIds(env) {
  const ids = []
  let cursor
  do {
    const page = await env.MARKS.list({ prefix: 'list:', cursor })
    for (const k of page.keys) {
      const doc = await env.MARKS.get(k.name, 'json')
      for (const s of doc?.sections ?? []) for (const i of s.items) if (!i.received) ids.push(i.id)
    }
    cursor = page.list_complete ? undefined : page.cursor
  } while (cursor)
  return ids
}

export async function handleLists(req, env, cors, originOk, path) {
  const m = path.match(/^\/lists\/([^/]+)(\/claim|\/preview)?$/)
  if (!m) return json({ error: 'not found' }, 404, cors)
  const slug = decodeURIComponent(m[1]).toLowerCase()
  const action = m[2]
  if (!SLUG.test(slug)) return json({ error: 'not found' }, 404, cors)
  const key = req.headers.get('x-edit-key') ?? ''
  const noStore = { ...cors, 'cache-control': 'no-store' }

  if (!action && req.method === 'GET') {
    const doc = await env.MARKS.get(`list:${slug}`, 'json')
    if (!doc) {
      const claimable = allowedSlugs(env).includes(slug) && !(await env.MARKS.get(`listkey:${slug}`))
      return json({ error: 'not found', claimable }, 404, noStore)
    }
    if (key) {
      if (!(await keyOk(env, slug, key))) return json({ error: 'wrong edit link' }, 403, noStore)
      return json(doc, 200, noStore)
    }
    return json(publicView(doc), 200, noStore)
  }

  if (!originOk) return json({ error: 'forbidden' }, 403, cors)

  if (action === '/claim' && req.method === 'POST') {
    if (!allowedSlugs(env).includes(slug)) return json({ error: 'not found' }, 404, cors)
    if (await rateLimited(env, 'claim', clientIp(req), 5)) return json({ error: 'slow down' }, 429, cors)
    if (await env.MARKS.get(`listkey:${slug}`)) return json({ error: 'already set up' }, 409, cors)
    const k = newKey()
    await env.MARKS.put(`listkey:${slug}`, await sha256(k))
    // Display name from the site (e.g. "Avi", "KMR"); default: capitalized slug.
    const sent = await req.json().catch(() => ({}))
    const name = str(sent?.name, 40).replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N} .'-]/gu, '').trim() || slug.charAt(0).toUpperCase() + slug.slice(1)
    const doc = sanitize({ title: `${name}'s Wishlist`, sections: DEFAULT_SECTIONS.map((n) => ({ name: n, items: [] })) })
    await env.MARKS.put(`list:${slug}`, JSON.stringify(doc))
    return json({ key: k, list: doc }, 201, noStore)
  }

  if (!(await keyOk(env, slug, key))) return json({ error: 'wrong edit link' }, 403, cors)

  if (!action && req.method === 'PUT') {
    if (await rateLimited(env, 'save', `${slug}`, 600)) return json({ error: 'slow down' }, 429, cors)
    const body = await req.text()
    if (body.length > 200_000) return json({ error: 'list too big' }, 413, cors)
    let doc
    try {
      doc = sanitize(JSON.parse(body))
    } catch {
      return json({ error: 'bad list' }, 400, cors)
    }
    await env.MARKS.put(`list:${slug}`, JSON.stringify(doc))
    return json(doc, 200, noStore)
  }

  if (action === '/preview' && req.method === 'GET') {
    if (await rateLimited(env, 'preview', slug, 120)) return json({ error: 'slow down' }, 429, cors)
    const url = httpUrl(new URL(req.url).searchParams.get('url'))
    if (!url) return json({ error: 'not a link' }, 400, cors)
    return json(await preview(url), 200, noStore)
  }

  return json({ error: 'method not allowed' }, 405, cors)
}

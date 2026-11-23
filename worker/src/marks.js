// "Someone bought this" marks, shared by Neil's list (wishlist.json on the
// site) and the web-managed lists in KV. Anyone with the link can mark an
// item; the browser that marked it gets an undo token for UNDO_MINUTES.
//
//   GET    /marks        -> { marks: { <id>: { at } } }
//   POST   /marks/<id>   -> { token, at }      (409 if already marked)
//   DELETE /marks/<id>   header X-Undo-Token   (within the undo window)
import { json, sha256, rateLimited, clientIp } from './util.js'
import { allListItemIds } from './lists.js'

const UNDO_MINUTES = 10
const MARKS_PER_HOUR = 10

// IDs that may be marked: Neil's published list plus every web list, so the
// store can't be filled with junk. Neil's list is cached 5 min at the edge.
async function knownIds(env) {
  const res = await fetch(env.WISHLIST_URL, { cf: { cacheTtl: 300, cacheEverything: true } })
  if (!res.ok) throw new Error('wishlist fetch failed')
  const data = await res.json()
  const ids = new Set(data.sections.flatMap((s) => s.items.map((i) => i.id)))
  for (const id of await allListItemIds(env)) ids.add(id)
  return ids
}

export async function handleMarks(req, env, cors, originOk, path) {
  if (req.method === 'GET' && path === '/marks') {
    const marks = {}
    let cursor
    do {
      const page = await env.MARKS.list({ prefix: 'mark:', cursor })
      for (const k of page.keys) marks[k.name.slice(5)] = { at: k.metadata?.at ?? null }
      cursor = page.list_complete ? undefined : page.cursor
    } while (cursor)
    // Items received (checked off / removed) drop out of the lists; forget
    // their marks too so the store doesn't grow forever.
    const known = await knownIds(env).catch(() => null)
    if (known) {
      for (const id of Object.keys(marks)) {
        if (!known.has(id)) {
          delete marks[id]
          await env.MARKS.delete(`mark:${id}`)
        }
      }
    }
    return json({ marks }, 200, { ...cors, 'cache-control': 'no-store' })
  }

  const m = path.match(/^\/marks\/([0-9a-f]{12})$/)
  if (!m) return json({ error: 'not found' }, 404, cors)
  const id = m[1]
  const key = `mark:${id}`

  if (req.method === 'POST') {
    if (!originOk) return json({ error: 'forbidden' }, 403, cors)
    if (!(await knownIds(env)).has(id)) return json({ error: 'unknown item' }, 404, cors)
    if (await env.MARKS.get(key)) return json({ error: 'already marked' }, 409, cors)
    if (await rateLimited(env, 'mark', clientIp(req), MARKS_PER_HOUR)) return json({ error: 'slow down' }, 429, cors)
    const token = crypto.randomUUID()
    const at = Date.now()
    await env.MARKS.put(key, JSON.stringify({ tokenHash: await sha256(token) }), { metadata: { at } })
    return json({ token, at }, 201, cors)
  }

  if (req.method === 'DELETE') {
    const { value, metadata } = await env.MARKS.getWithMetadata(key)
    if (!value) return json({ ok: true }, 200, cors)
    const { tokenHash } = JSON.parse(value)
    if ((await sha256(req.headers.get('x-undo-token') ?? '')) !== tokenHash) return json({ error: 'forbidden' }, 403, cors)
    if (Date.now() - (metadata?.at ?? 0) > UNDO_MINUTES * 60_000) return json({ error: 'undo window closed' }, 410, cors)
    await env.MARKS.delete(key)
    return json({ ok: true }, 200, cors)
  }

  return json({ error: 'method not allowed' }, 405, cors)
}

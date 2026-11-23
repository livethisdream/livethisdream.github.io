// Wishlist "bought" marks. Anyone with the link can mark an item; the
// browser that marked it gets an undo token valid for UNDO_MINUTES.
//
//   GET    /marks        -> { marks: { <id>: { at } } }
//   POST   /marks/<id>   -> { token }            (409 if already marked)
//   DELETE /marks/<id>   header X-Undo-Token     (within the undo window)

const UNDO_MINUTES = 10
const RATE_LIMIT_PER_HOUR = 10

const json = (body, status, cors) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...cors } })

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Only accept IDs that exist in the published wishlist, so the KV store
// can't be filled with junk. Cached for 5 minutes at the edge.
async function knownIds(env) {
  const res = await fetch(env.WISHLIST_URL, { cf: { cacheTtl: 300, cacheEverything: true } })
  if (!res.ok) throw new Error('wishlist fetch failed')
  const data = await res.json()
  return new Set(data.sections.flatMap((s) => s.items.map((i) => i.id)))
}

async function rateLimited(env, ip) {
  const key = `rl:${ip}`
  const n = Number((await env.MARKS.get(key)) ?? 0)
  if (n >= RATE_LIMIT_PER_HOUR) return true
  await env.MARKS.put(key, String(n + 1), { expirationTtl: 3600 })
  return false
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('origin') ?? ''
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    const cors = {
      'access-control-allow-origin': allowed.includes(origin) ? origin : allowed[0],
      'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
      'access-control-allow-headers': 'content-type, x-undo-token',
      vary: 'origin',
    }
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    const { pathname } = new URL(req.url)
    if (req.method === 'GET' && pathname === '/marks') {
      const marks = {}
      let cursor
      do {
        const page = await env.MARKS.list({ prefix: 'mark:', cursor })
        for (const k of page.keys) marks[k.name.slice(5)] = { at: k.metadata?.at ?? null }
        cursor = page.list_complete ? undefined : page.cursor
      } while (cursor)
      // Items you check off in Obsidian ("received") drop out of wishlist.json;
      // forget their marks too so the store doesn't grow forever.
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

    const m = pathname.match(/^\/marks\/([0-9a-f]{12})$/)
    if (!m) return json({ error: 'not found' }, 404, cors)
    const id = m[1]
    const key = `mark:${id}`

    if (req.method === 'POST') {
      if (!allowed.includes(origin)) return json({ error: 'forbidden' }, 403, cors)
      if (!(await knownIds(env)).has(id)) return json({ error: 'unknown item' }, 404, cors)
      if (await env.MARKS.get(key)) return json({ error: 'already marked' }, 409, cors)
      if (await rateLimited(env, req.headers.get('cf-connecting-ip') ?? 'unknown'))
        return json({ error: 'slow down' }, 429, cors)
      const token = crypto.randomUUID()
      const at = Date.now()
      await env.MARKS.put(key, JSON.stringify({ tokenHash: await sha256(token) }), { metadata: { at } })
      return json({ token, at }, 201, cors)
    }

    if (req.method === 'DELETE') {
      const { value, metadata } = await env.MARKS.getWithMetadata(key)
      if (!value) return json({ ok: true }, 200, cors)
      const token = req.headers.get('x-undo-token') ?? ''
      const { tokenHash } = JSON.parse(value)
      if ((await sha256(token)) !== tokenHash) return json({ error: 'forbidden' }, 403, cors)
      if (Date.now() - (metadata?.at ?? 0) > UNDO_MINUTES * 60_000)
        return json({ error: 'undo window closed' }, 410, cors)
      await env.MARKS.delete(key)
      return json({ ok: true }, 200, cors)
    }

    return json({ error: 'method not allowed' }, 405, cors)
  },
}

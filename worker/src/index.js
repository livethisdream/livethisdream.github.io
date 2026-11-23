// Wishlist API (Cloudflare Worker): bought marks for every list, plus
// storage for web-managed lists. See marks.js and lists.js.
import { json } from './util.js'
import { handleMarks } from './marks.js'
import { handleLists } from './lists.js'

export default {
  async fetch(req, env) {
    const origin = req.headers.get('origin') ?? ''
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    const originOk = allowed.includes(origin)
    const cors = {
      'access-control-allow-origin': originOk ? origin : allowed[0],
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'content-type, x-undo-token, x-edit-key',
      vary: 'origin',
    }
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    const { pathname } = new URL(req.url)
    try {
      if (pathname === '/marks' || pathname.startsWith('/marks/')) return await handleMarks(req, env, cors, originOk, pathname)
      if (pathname.startsWith('/lists/')) return await handleLists(req, env, cors, originOk, pathname)
    } catch (e) {
      return json({ error: 'server error', detail: String(e?.message ?? e) }, 500, cors)
    }
    return json({ error: 'not found' }, 404, cors)
  },
}

// Find a product image (and a short description) for a wishlist URL. Order of preference:
//   1. Shopify product JSON (<product-url>.js) — real product photo, not the og:image logo
//   2. JSON-LD Product.image
//   3. og:image / twitter:image / link rel=image_src
// Anything that looks like a logo/placeholder is skipped.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'
const HEADERS = {
  'user-agent': UA,
  accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
}
const TIMEOUT_MS = 10_000

export const looksLikeLogo = (u = '') => /logo|favicon|placeholder|sprite|icon[-_.]/i.test(u)

async function get(url, accept) {
  const res = await fetch(url, {
    headers: accept ? { ...HEADERS, accept } : HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res
}

const absolute = (src, base) => {
  if (!src) return null
  try {
    const u = new URL(src.trim().replace(/&amp;/g, '&'), base)
    if (u.protocol === 'http:') u.protocol = 'https:'
    return u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}
const ok = (u) => (u && !looksLikeLogo(u) ? u : null)

async function shopify(url) {
  const u = new URL(url)
  if (!/\/products\/[^/]+/.test(u.pathname)) return null
  const variant = u.searchParams.get('variant')
  const res = await get(`${u.origin}${u.pathname.replace(/\/+$/, '')}.js`, 'application/json')
  if (!/json|javascript/.test(res.headers.get('content-type') ?? '')) return null
  const p = await res.json()
  const v = variant && p.variants?.find((x) => String(x.id) === variant)
  const src = ok(absolute(v?.featured_image?.src ?? p.featured_image ?? p.images?.[0], url))
  return src ? { src, description: clean(p.description) } : null
}

// Strip tags/entities and trim to a card-sized blurb.
export function clean(s = '') {
  const text = String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&#8217;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&[a-z]+;|&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 280 ? text.slice(0, 277).replace(/\s+\S*$/, '') + '…' : text
}

function describe(html) {
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const stack = [JSON.parse(m[1].trim())]
      while (stack.length) {
        const n = stack.pop()
        if (!n || typeof n !== 'object') continue
        if (Array.isArray(n)) { stack.push(...n); continue }
        if ([].concat(n['@type'] ?? []).includes('Product') && typeof n.description === 'string') return clean(n.description)
        if (n['@graph']) stack.push(n['@graph'])
      }
    } catch {
      /* skip */
    }
  }
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []
  for (const key of ['og:description', 'description', 'twitter:description']) {
    for (const t of tags) {
      const name = t.match(/\b(?:property|name)\s*=\s*["']([^"']*)["']/i)?.[1]?.toLowerCase()
      const content = t.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1]
      if (name === key && content) return clean(content)
    }
  }
  return ''
}

function fromJsonLd(html, base) {
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data
    try {
      data = JSON.parse(m[1].trim())
    } catch {
      continue
    }
    const stack = [data]
    while (stack.length) {
      const node = stack.pop()
      if (!node || typeof node !== 'object') continue
      if (Array.isArray(node)) { stack.push(...node); continue }
      const type = [].concat(node['@type'] ?? [])
      if (type.includes('Product') || type.includes('ProductGroup')) {
        const img = [].concat(node.image ?? [])[0]
        const src = ok(absolute(typeof img === 'string' ? img : img?.url ?? img?.contentUrl, base))
        if (src) return src
      }
      if (node['@graph']) stack.push(node['@graph'])
      if (node.hasVariant) stack.push(node.hasVariant)
    }
  }
  return null
}

function fromMeta(html, base) {
  const tags = html.match(/<(meta|link)\b[^>]*>/gi) ?? []
  const attr = (t, n) => t.match(new RegExp(`\\b${n}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1]
  const want = ['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src']
  for (const key of want) {
    for (const t of tags) {
      if ((attr(t, 'property') ?? attr(t, 'name'))?.toLowerCase() === key) {
        const src = ok(absolute(attr(t, 'content'), base))
        if (src) return src
      }
    }
  }
  for (const t of tags) {
    if (attr(t, 'rel')?.toLowerCase() === 'image_src') {
      const src = ok(absolute(attr(t, 'href'), base))
      if (src) return src
    }
  }
  return null
}

export async function findImage(url) {
  try {
    const s = await shopify(url)
    if (s) return { ...s, via: 'shopify' }
  } catch {
    /* not Shopify, or blocked — fall through */
  }
  const res = await get(url)
  const html = (await res.text()).slice(0, 2_000_000)
  const base = res.url || url
  const description = describe(html)
  const ld = fromJsonLd(html, base)
  if (ld) return { src: ld, via: 'json-ld', description }
  const meta = fromMeta(html, base)
  if (meta) return { src: meta, via: 'meta', description }
  return description ? { src: null, via: 'none', description } : null
}

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' }

// Download so the site serves its own copy (no hotlink blocks, no mixed content).
export async function download(src) {
  const res = await get(src, 'image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8')
  const type = (res.headers.get('content-type') ?? '').split(';')[0].trim()
  const ext = EXT[type]
  if (!ext) throw new Error(`not an image (${type || 'no type'})`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 1024 || buf.length > 8_000_000) throw new Error(`bad size ${buf.length}`)
  return { buf, ext }
}

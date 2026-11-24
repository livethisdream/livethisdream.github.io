// Title / photo / description for a product link, for the list editor.
// Same strategy as the site build (web/scripts/find-image.mjs): Shopify
// product JSON, then JSON-LD Product, then og/twitter meta. Never throws;
// returns whatever it found (possibly just the host).
const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
}
const looksLikeLogo = (u = '') => /logo|favicon|placeholder|sprite|icon[-_.]/i.test(u)

const decode = (s = '') =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&#8217;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')

function clean(s = '', max = 280) {
  const t = decode(String(s).replace(/<[^>]+>/g, ' ')).replace(/&[a-z]+;|&#\d+;/g, ' ').replace(/\s+/g, ' ').trim()
  return t.length > max ? t.slice(0, max - 3).replace(/\s+\S*$/, '') + '…' : t
}

function abs(src, base) {
  if (!src) return null
  try {
    const u = new URL(decode(String(src).trim()), base)
    if (u.protocol === 'http:') u.protocol = 'https:'
    return u.protocol === 'https:' && !looksLikeLogo(u.href) ? u.href : null
  } catch {
    return null
  }
}

async function get(url, accept) {
  const res = await fetch(url, { headers: accept ? { ...HEADERS, accept } : HEADERS, redirect: 'follow', signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(String(res.status))
  return res
}

async function shopify(url) {
  const u = new URL(url)
  if (!/\/products\/[^/]+/.test(u.pathname)) return null
  const res = await get(`${u.origin}${u.pathname.replace(/\/+$/, '')}.js`, 'application/json')
  if (!/json|javascript/.test(res.headers.get('content-type') ?? '')) return null
  const p = await res.json()
  const variant = u.searchParams.get('variant')
  const v = variant && p.variants?.find((x) => String(x.id) === variant)
  return {
    title: clean(p.title, 200),
    image: abs(v?.featured_image?.src ?? p.featured_image ?? p.images?.[0], url),
    description: clean(p.description),
  }
}

function fromHtml(html, base) {
  const out = { title: '', image: null, description: '' }
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let stack
    try {
      stack = [JSON.parse(m[1].trim())]
    } catch {
      continue
    }
    while (stack.length) {
      const n = stack.pop()
      if (!n || typeof n !== 'object') continue
      if (Array.isArray(n)) { stack.push(...n); continue }
      const type = [].concat(n['@type'] ?? [])
      if (type.includes('Product') || type.includes('ProductGroup')) {
        const img = [].concat(n.image ?? [])[0]
        out.image ||= abs(typeof img === 'string' ? img : img?.url ?? img?.contentUrl, base)
        out.title ||= clean(n.name ?? '', 200)
        out.description ||= clean(n.description ?? '')
      }
      if (n['@graph']) stack.push(n['@graph'])
    }
  }
  const tags = html.match(/<(meta|link)\b[^>]*>/gi) ?? []
  const attr = (t, n) => t.match(new RegExp(`\\b${n}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1]
  const meta = (keys) => {
    for (const k of keys) for (const t of tags) if ((attr(t, 'property') ?? attr(t, 'name'))?.toLowerCase() === k && attr(t, 'content')) return attr(t, 'content')
    return ''
  }
  out.image ||= abs(meta(['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src']), base)
  out.title ||= clean(meta(['og:title', 'twitter:title']), 200) || clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '', 200)
  out.description ||= clean(meta(['og:description', 'description', 'twitter:description']))
  return out
}

export async function preview(url) {
  const result = { url, host: new URL(url).host, title: '', image: null, description: '' }
  try {
    const s = await shopify(url)
    if (s?.image) return { ...result, ...s }
  } catch {
    /* not Shopify or blocked */
  }
  try {
    const res = await get(url)
    const html = (await res.text()).slice(0, 2_000_000)
    const found = fromHtml(html, res.url || url)
    return { ...result, url: res.url || url, host: new URL(res.url || url).host, ...found }
  } catch {
    return result // store blocks bots: the editor lets her type a title
  }
}

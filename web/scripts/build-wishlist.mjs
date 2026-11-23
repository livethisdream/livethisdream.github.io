// Build-time: turn the synced wishlist note (pages/nr-wishlist.md, pushed
// one-way from Obsidian -> Gitea -> here) into public/wishlist.json.
// Item IDs are derived from the normalized product URL so they stay stable
// when the note is reordered or re-synced; the "bought" Worker keys on them.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = resolve(here, '../../pages/nr-wishlist.md')
const out = resolve(here, '../public/wishlist.json')
const imgDir = resolve(here, '../public/wishlist-img')
// Hand-picked images for stores that block automated lookups:
// { "<product url>": "<image url>" }
const overridesFile = resolve(here, '../../pages/wishlist-images.json')

const decode = (s = '') =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()

export function itemId(url) {
  const u = new URL(url)
  const norm = (u.host.replace(/^www\./, '') + u.pathname.replace(/\/+$/, '') + u.search).toLowerCase()
  return createHash('sha256').update(norm).digest('hex').slice(0, 12)
}

export function parse(md) {
  const updated = md.match(/_Last updated:\s*([^_]+)_/)?.[1].trim() ?? null
  const sections = []
  let current = null
  const ids = new Set()
  for (const block of md.split(/^(?=## )/m)) {
    const heading = block.match(/^## (.+)$/m)?.[1].trim()
    if (heading) { current = { name: heading, items: [] }; sections.push(current) }
    const cards = block.match(/<div class="link-preview-card">[\s\S]*?<\/a>\s*<\/div>/g) ?? []
    for (const card of cards) {
      const url = decode(card.match(/<a href="([^"]+)"/)?.[1])
      if (!url) continue
      const id = itemId(url)
      if (ids.has(id)) continue
      ids.add(id)
      if (!current) { current = { name: 'Wishlist', items: [] }; sections.push(current) }
      current.items.push({
        id,
        title: decode(card.match(/link-preview-title">([\s\S]*?)<\/h4>/)?.[1]) || url,
        description: decode(card.match(/link-preview-description">([\s\S]*?)<\/p>/)?.[1]),
        url,
        image: decode(card.match(/background-image:\s*url\('([^']+)'\)/)?.[1]).replace(/^http:\/\//, 'https://') || null,
        host: new URL(url).host,
      })
    }
  }
  return { updated, sections: sections.filter((s) => s.items.length) }
}

// For each item: override > image found on the product page > image from the
// sync. The winner is downloaded into public/wishlist-img/ so the site serves
// its own copy. Any failure just leaves the best URL we have (or none).
async function addImages(data) {
  const { findImage, download, looksLikeLogo } = await import('./find-image.mjs')
  const overrides = existsSync(overridesFile) ? JSON.parse(readFileSync(overridesFile, 'utf8')) : {}
  delete overrides._comment
  mkdirSync(imgDir, { recursive: true })
  const cached = new Map(readdirSync(imgDir).map((f) => [f.split('.')[0], f]))
  const items = data.sections.flatMap((s) => s.items)
  await Promise.all(
    items.map(async (item) => {
      const override = overrides[item.url] ?? overrides[item.id]
      if (!override && cached.has(item.id)) {
        item.image = `/wishlist-img/${cached.get(item.id)}`
        console.log(`  ${item.id} cached`)
        return
      }
      const candidates = []
      if (override) candidates.push({ src: override, via: 'override' })
      else {
        try {
          const found = await findImage(item.url)
          if (found) candidates.push(found)
        } catch (e) {
          console.log(`  ${item.id} lookup failed: ${e.message}`)
        }
        if (item.image && !looksLikeLogo(item.image)) candidates.push({ src: item.image, via: 'sync' })
      }
      item.image = null
      for (const c of candidates) {
        try {
          const { buf, ext } = await download(c.src)
          const file = `${item.id}.${ext}`
          writeFileSync(resolve(imgDir, file), buf)
          item.image = `/wishlist-img/${file}`
          console.log(`  ${item.id} ${c.via}: ${c.src}`)
          return
        } catch (e) {
          console.log(`  ${item.id} ${c.via} download failed: ${e.message}`)
        }
      }
      // Couldn't download; hotlink the best candidate rather than show nothing.
      item.image = candidates[0]?.src ?? null
      console.log(`  ${item.id} ${item.image ? 'hotlinked' : 'no image'} (${item.title})`)
    }),
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = parse(readFileSync(src, 'utf8'))
  if (process.env.WISHLIST_OFFLINE !== '1') await addImages(data)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, JSON.stringify(data, null, 2) + '\n')
  const n = data.sections.reduce((a, s) => a + s.items.length, 0)
  const withImg = data.sections.flatMap((s) => s.items).filter((i) => i.image).length
  console.log(`wishlist: ${n} items (${withImg} with images) in ${data.sections.length} sections -> public/wishlist.json`)
}

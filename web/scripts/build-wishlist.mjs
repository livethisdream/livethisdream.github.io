// Build-time: turn the synced wishlist note (pages/nr-wishlist.md, pushed
// one-way from Obsidian -> Gitea -> here) into public/wishlist.json.
// Item IDs are derived from the normalized product URL so they stay stable
// when the note is reordered or re-synced; the "bought" Worker keys on them.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = resolve(here, '../../pages/nr-wishlist.md')
const out = resolve(here, '../public/wishlist.json')

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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = parse(readFileSync(src, 'utf8'))
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, JSON.stringify(data, null, 2) + '\n')
  const n = data.sections.reduce((a, s) => a + s.items.length, 0)
  console.log(`wishlist: ${n} items in ${data.sections.length} sections -> public/wishlist.json`)
}

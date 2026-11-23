// Build-time: turn the wishlist note (pages/wishlist.md — the raw Obsidian
// note, pushed one-way Obsidian -> Gitea -> here by the Gitea Action in
// gitea/wishlist-sync.yml) into public/wishlist.json.
//
// Note format: "## Section" headings with "- [ ] [Title](url)" items.
// Checked items ("- [x]") have been received and are left out.
// Item IDs are derived from the normalized product URL so they stay stable
// when the note is reordered or re-synced; the "bought" Worker keys on them.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = resolve(here, '../../pages/wishlist.md')
const out = resolve(here, '../public/wishlist.json')
const imgDir = resolve(here, '../public/wishlist-img')
// Hand-picked images for stores that block automated lookups:
// { "<product url>": "<image url>" }
const overridesFile = resolve(here, '../../pages/wishlist-images.json')

export function itemId(url) {
  const u = new URL(url)
  const norm = (u.host.replace(/^www\./, '') + u.pathname.replace(/\/+$/, '') + u.search).toLowerCase()
  return createHash('sha256').update(norm).digest('hex').slice(0, 12)
}

// "- [ ] [Title](https://url "optional tooltip")  [field:: value]"
const CHECKBOX = /^\s*[-*+]\s+\[( |x|X)\]\s*(.*)$/
const LINKED = /^\[([^\]]*)\]\(\s*<?([^\s)>]*)>?(?:\s+"[^"]*")?\s*\)/

// Items without a usable link get an ID from their title instead.
export const titleId = (title) =>
  createHash('sha256').update('title:' + title.toLowerCase().replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 12)

function parseItem(rest) {
  const text = rest.replace(/\s*\[[\w-]+::[^\]]*\]/g, '').trim() // drop Dataview fields
  const m = text.match(LINKED)
  let title = (m ? m[1] : text).replace(/\*\*|__|`/g, '').trim()
  let url = null
  if (m && m[2]) {
    try {
      const u = new URL(m[2])
      if (u.protocol === 'http:' || u.protocol === 'https:') url = u.href
    } catch {
      /* not a URL: keep it as a plain item */
    }
  }
  if (!title) title = url ? new URL(url).host : ''
  if (!title) return null // "- [ ]" with nothing after it
  return { id: url ? itemId(url) : titleId(title), title, description: '', url, image: null, host: url ? new URL(url).host : null }
}

export function parse(md) {
  const sections = []
  let current = null
  const ids = new Set()
  for (const line of md.split(/\r?\n/)) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/)
    if (heading) {
      current = { name: heading[1], items: [] }
      sections.push(current)
      continue
    }
    const m = line.match(CHECKBOX)
    if (!m || m[1] !== ' ') continue // not a checklist item, or already received
    const item = parseItem(m[2])
    if (!item || ids.has(item.id)) continue
    ids.add(item.id)
    if (!current) {
      current = { name: 'Wishlist', items: [] }
      sections.push(current)
    }
    current.items.push(item)
  }
  return { sections: sections.filter((s) => s.items.length) }
}

// When the note last changed (git history), else now.
function lastUpdated() {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', src], { encoding: 'utf8' }).trim()
    if (iso) return iso
  } catch {
    /* not a git checkout */
  }
  return new Date().toISOString()
}

// For each item: override > image found on the product page. The winner is downloaded into public/wishlist-img/ so the site serves
// its own copy. Any failure just leaves the best URL we have (or none).
async function addImages(data) {
  const { findImage, download } = await import('./find-image.mjs')
  const overrides = existsSync(overridesFile) ? JSON.parse(readFileSync(overridesFile, 'utf8')) : {}
  delete overrides._comment
  mkdirSync(imgDir, { recursive: true })
  const cached = new Map(readdirSync(imgDir).map((f) => [f.split('.')[0], f]))
  const items = data.sections.flatMap((s) => s.items)
  await Promise.all(
    items.map(async (item) => {
      const override = (item.url && overrides[item.url]) ?? overrides[item.id]
      if (!override && !item.url) return // plain item, nothing to look up
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
          if (found?.description) item.description = found.description
          if (found?.src) candidates.push(found)
        } catch (e) {
          console.log(`  ${item.id} lookup failed: ${e.message}`)
        }
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
  const data = { updated: lastUpdated(), ...parse(readFileSync(src, 'utf8')) }
  if (process.env.WISHLIST_OFFLINE !== '1') await addImages(data)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, JSON.stringify(data, null, 2) + '\n')
  const n = data.sections.reduce((a, s) => a + s.items.length, 0)
  const withImg = data.sections.flatMap((s) => s.items).filter((i) => i.image).length
  console.log(`wishlist: ${n} items (${withImg} with images) in ${data.sections.length} sections -> public/wishlist.json`)
}

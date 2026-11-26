// Shared bits for the wishlist pages.
export const API = (import.meta.env.VITE_WISHLIST_API as string | undefined)?.replace(/\/+$/, '')
// Display name for a list: from LISTS below if present, else capitalized.
export const ownerName = (slug: string) =>
  LISTS.find((l) => l.slug === slug)?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1)

// Lists shown on /wishlist. "static" = built from Obsidian into /wishlist.json;
// "web" = managed in the browser and stored by the Worker.
export type ListRef = { slug: string; name: string; source: 'static' | 'web' }
export const LISTS: ListRef[] = [
  { slug: 'nr', name: 'Neil', source: 'static' },
  { slug: 'kmr', name: 'KMR', source: 'web' },
  { slug: 'avi', name: 'Avi', source: 'web' },
  { slug: 'luka', name: 'Luka', source: 'web' },
  { slug: 'ezra', name: 'Ezra', source: 'web' },
  { slug: 'judah', name: 'Judah', source: 'web' },
]

// Color family for a priority section: high / medium / low, else neutral.
export function priorityTone(name: string): 'high' | 'medium' | 'low' | 'other' {
  const n = name.trim().toLowerCase()
  if (/^(high|top|must)/.test(n)) return 'high'
  if (/^(med|mid)/.test(n)) return 'medium'
  if (/^low/.test(n)) return 'low'
  return 'other'
}

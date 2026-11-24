// Shared bits for the wishlist pages.
export const API = (import.meta.env.VITE_WISHLIST_API as string | undefined)?.replace(/\/+$/, '')
// Short names are usually initials ("kmr" -> "KMR"); longer ones get a capital.
export const ownerName = (slug: string) =>
  slug.length <= 3 ? slug.toUpperCase() : slug.charAt(0).toUpperCase() + slug.slice(1)

// Lists shown on /wishlist. "static" = built from Obsidian into /wishlist.json;
// "web" = managed in the browser and stored by the Worker.
export type ListRef = { slug: string; name: string; source: 'static' | 'web' }
export const LISTS: ListRef[] = [
  { slug: 'nr', name: 'Neil', source: 'static' },
  { slug: 'kmr', name: 'KMR', source: 'web' },
]

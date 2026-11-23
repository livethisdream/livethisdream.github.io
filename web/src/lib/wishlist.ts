// Shared bits for the wishlist pages.
export const API = (import.meta.env.VITE_WISHLIST_API as string | undefined)?.replace(/\/+$/, '')
export const ownerName = (slug: string) => slug.charAt(0).toUpperCase() + slug.slice(1)

import { useEffect, useState } from 'react'
import WishlistView, { type Wishlist } from '../components/WishlistView'

/*
 * Neil's list: /wishlist.json, generated at build time from pages/wishlist.md
 * (synced one-way from Obsidian via Gitea) by scripts/build-wishlist.mjs.
 */
export default function WishlistPage() {
  const [list, setList] = useState<Wishlist | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/wishlist.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setList)
      .catch(() => setError('Could not load the wishlist.'))
  }, [])

  return <WishlistView title="Neil's Wishlist" list={list} error={error} />
}

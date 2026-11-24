import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import WishlistView, { type Wishlist } from '../components/WishlistView'
import { API, ownerName } from '../lib/wishlist'

/* A web-managed list (stored by the Worker), e.g. /wishlist/<name>. */

export default function ListPage() {
  const { slug = '' } = useParams()
  const [list, setList] = useState<Wishlist | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [claimable, setClaimable] = useState(false)

  useEffect(() => {
    if (!API) {
      setError('This list is not available right now.')
      return
    }
    fetch(`${API}/lists/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        if (r.ok) return setList((await r.json()) as Wishlist)
        const body = (await r.json().catch(() => ({}))) as { claimable?: boolean }
        setClaimable(Boolean(body.claimable))
        setError(r.status === 404 ? 'There’s no wishlist here yet.' : 'Could not load the wishlist.')
      })
      .catch(() => setError('Could not load the wishlist.'))
  }, [slug])

  if (claimable)
    return (
      <article className="article wl">
        <h1>{ownerName(slug)}'s Wishlist</h1>
        <p>This list hasn’t been set up yet.</p>
        <p>
          <Link to={`/wishlist/${slug}/edit`}>Set it up →</Link>
        </p>
      </article>
    )

  const owner = ownerName(slug)
  return <WishlistView title={list?.title || `${owner}'s Wishlist`} list={list} error={error} />
}

import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CV from './pages/CV'
import Courses from './pages/Courses'
import Projects from './pages/Projects'
import Wishlist from './pages/Wishlist'
import WishlistIndex from './pages/WishlistIndex'
import ListPage from './pages/ListPage'
import ListEditor from './pages/ListEditor'
import QR from './pages/QR'
import NotFound from './pages/NotFound'
import GRCon25CTF from './pages/writeups/GRCon25CTF'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cv" element={<CV />} />
        <Route path="courses" element={<Courses />} />
        <Route path="projects" element={<Projects />} />
        <Route path="posts/grcon25-ctf" element={<GRCon25CTF />} />
        <Route path="wishlist" element={<WishlistIndex />} />
        <Route path="wishlist/nr" element={<Wishlist />} />
        <Route path="wishlist/nr/edit" element={<Navigate to="/wishlist/nr" replace />} />
        <Route path="nr-wishlist" element={<Navigate to="/wishlist/nr" replace />} />
        <Route path="wishlist/:slug" element={<ListPage />} />
        <Route path="wishlist/:slug/edit" element={<ListEditor />} />
        <Route path="qr" element={<QR />} />
      </Route>
      {/* Outside Layout: the waterfall is full-bleed, no header or footer. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

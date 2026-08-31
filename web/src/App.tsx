import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CV from './pages/CV'
import Courses from './pages/Courses'
import Projects from './pages/Projects'
import Wishlist from './pages/Wishlist'
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
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="qr" element={<QR />} />
      </Route>
      {/* Outside Layout: the waterfall is full-bleed, no header or footer. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

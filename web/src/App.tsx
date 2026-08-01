import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CV from './pages/CV'
import Projects from './pages/Projects'
import Wishlist from './pages/Wishlist'
import QR from './pages/QR'
import Placeholder from './pages/Placeholder'
import GRCon25CTF from './pages/writeups/GRCon25CTF'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cv" element={<CV />} />
        <Route path="projects" element={<Projects />} />
        <Route path="posts/grcon25-ctf" element={<GRCon25CTF />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="qr" element={<QR />} />
        <Route path="*" element={<Placeholder title="Not Found" note="No page at that URL." />} />
      </Route>
    </Routes>
  )
}

import { Routes, Route, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import GenerateModelPage from './pages/GenerateModelPage'
import GenerateGarmentPage from './pages/GenerateGarmentPage'
import TryOnPage from './pages/TryOnPage'
import VideoPage from './pages/VideoPage'
import GalleryPage from './pages/GalleryPage'
import ProfilePage from './pages/ProfilePage'

const orbs = [
  { top: '-20%', left: '-10%', width: 800, height: 800, color: 'rgba(124,58,237,0.06)', duration: '18s', delay: '0s' },
  { top: '10%', right: '-15%', width: 600, height: 600, color: 'rgba(167,139,250,0.04)', duration: '22s', delay: '3s' },
  { top: '45%', left: '38%', width: 500, height: 500, color: 'rgba(91,33,182,0.05)', duration: '26s', delay: '6s' },
  { bottom: '-10%', left: '18%', width: 400, height: 400, color: 'rgba(124,58,237,0.04)', duration: '20s', delay: '9s' },
  { bottom: '5%', right: '8%', width: 350, height: 350, color: 'rgba(196,181,253,0.03)', duration: '24s', delay: '12s' },
]

export default function App() {
  const location = useLocation()

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', position: 'relative' }}>
      {/* Ambient gradient mesh — fixed, below everything */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {orbs.map((orb, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: orb.top,
              left: orb.left,
              right: orb.right,
              bottom: orb.bottom,
              width: orb.width,
              height: orb.height,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 65%)`,
              animation: `float ${orb.duration} ease-in-out infinite ${orb.delay}`,
            }}
          />
        ))}
      </Box>

      {/* Main content — above ambient mesh */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <Sidebar />
        <Box
          key={location.pathname}
          sx={{
            ml: '64px',
            animation: 'fadeInUp 0.35s ease both',
            willChange: 'opacity, transform',
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/generate-model" element={<GenerateModelPage />} />
            <Route path="/generate-garment" element={<GenerateGarmentPage />} />
            <Route path="/try-on" element={<TryOnPage />} />
            <Route path="/video" element={<VideoPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  )
}

import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import GenerateModelPage from './pages/GenerateModelPage'
import GenerateGarmentPage from './pages/GenerateGarmentPage'
import TryOnPage from './pages/TryOnPage'
import VideoPage from './pages/VideoPage'
import GalleryPage from './pages/GalleryPage'

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generate-model" element={<GenerateModelPage />} />
        <Route path="/generate-garment" element={<GenerateGarmentPage />} />
        <Route path="/try-on" element={<TryOnPage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
      </Routes>
    </Box>
  )
}

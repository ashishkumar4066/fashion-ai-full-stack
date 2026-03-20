import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import GenerateModelPage from './pages/GenerateModelPage'
import TryOnPage from './pages/TryOnPage'

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generate-model" element={<GenerateModelPage />} />
        <Route path="/try-on" element={<TryOnPage />} />
      </Routes>
    </Box>
  )
}

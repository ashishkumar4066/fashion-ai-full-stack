import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Chip,
  Alert,
  Tooltip,
  IconButton,
  Divider,
  Skeleton,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import VideocamIcon from '@mui/icons-material/Videocam'
import { getModels, getGarments, getTryOns, getVideos } from '../api/fashionApi'
import { glassPanelSx } from '../theme'

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy ID'}>
      <IconButton size="small" onClick={handle} sx={{ color: 'text.secondary', p: 0.3 }}>
        {copied ? <CheckIcon sx={{ fontSize: 14, color: 'primary.main' }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
      </IconButton>
    </Tooltip>
  )
}

// Shared hover sx for all gallery cards
const galleryCardSx = {
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  willChange: 'transform',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 0 0 1px rgba(124,58,237,0.5), 0 20px 60px rgba(124,58,237,0.2)',
    borderColor: 'rgba(124,58,237,0.4)',
  },
  '&:hover .gallery-overlay': {
    opacity: 1,
    transform: 'translateY(0)',
  },
}

// ── Model Card ─────────────────────────────────────────────
function ModelCard({ model, onUse }) {
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = `/api/v1/models/${model.id}/download`
    a.download = `model-${model.id}.jpg`
    a.click()
  }

  return (
    <Paper sx={galleryCardSx}>
        <Box sx={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
          <Box
            component="img"
            src={model.image_url}
            alt={model.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
            onError={(e) => { e.target.style.opacity = 0 }}
          />
          {model.tryon_result_url && (
            <Chip
              label="Used in Try-On"
              size="small"
              sx={{
                position: 'absolute', top: 8, left: 8,
                backgroundColor: 'rgba(124,58,237,0.2)',
                color: 'primary.main',
                border: '1px solid rgba(124,58,237,0.3)',
                fontSize: '0.65rem', fontWeight: 600,
                backdropFilter: 'blur(4px)',
              }}
            />
          )}
          <Box
            className="gallery-overlay"
            sx={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
              p: 1.5,
              display: 'flex',
              justifyContent: 'flex-end',
              opacity: 0,
              transform: 'translateY(8px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            <Tooltip title="Download">
              <IconButton
                size="small"
                onClick={handleDownload}
                sx={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <DownloadIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {model.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
              flexGrow: 1,
            }}
          >
            {model.prompt}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#555', fontFamily: 'monospace', fontSize: '0.65rem' }}>
              {model.id.slice(0, 8)}…
            </Typography>
            <CopyButton value={model.id} />
            <Chip label={model.aspect_ratio} size="small" sx={{ ml: 'auto', fontSize: '0.65rem', height: 18, borderColor: '#2a2a2a', color: '#666' }} variant="outlined" />
          </Box>
          <Typography variant="caption" sx={{ color: '#444', fontSize: '0.65rem' }}>
            {formatDate(model.created_at)}
          </Typography>
          <Button variant="outlined" size="small" fullWidth endIcon={<ArrowForwardIcon />} onClick={() => onUse(model)} sx={{ mt: 0.5 }}>
            Use in Try-On
          </Button>
        </Box>
    </Paper>
  )
}

// ── Garment Card ───────────────────────────────────────────
function GarmentCard({ garment, onUse }) {
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = `/api/v1/garments/${garment.id}/download`
    a.download = `garment-${garment.id}.jpg`
    a.click()
  }

  return (
    <Paper sx={galleryCardSx}>
        <Box sx={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
          <Box
            component="img"
            src={garment.image_url}
            alt={garment.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.style.opacity = 0 }}
          />
          {garment.tryon_result_url && (
            <Chip
              label="Used in Try-On"
              size="small"
              sx={{
                position: 'absolute', top: 8, left: 8,
                backgroundColor: 'rgba(124,58,237,0.2)',
                color: 'primary.main',
                border: '1px solid rgba(124,58,237,0.3)',
                fontSize: '0.65rem', fontWeight: 600,
                backdropFilter: 'blur(4px)',
              }}
            />
          )}
          <Box
            className="gallery-overlay"
            sx={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
              p: 1.5,
              display: 'flex',
              justifyContent: 'flex-end',
              opacity: 0,
              transform: 'translateY(8px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            <Tooltip title="Download">
              <IconButton
                size="small"
                onClick={handleDownload}
                sx={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <DownloadIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {garment.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
              flexGrow: 1,
            }}
          >
            {garment.prompt}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#555', fontFamily: 'monospace', fontSize: '0.65rem' }}>
              {garment.id.slice(0, 8)}…
            </Typography>
            <CopyButton value={garment.id} />
            <Chip label={garment.aspect_ratio} size="small" sx={{ ml: 'auto', fontSize: '0.65rem', height: 18, borderColor: '#2a2a2a', color: '#666' }} variant="outlined" />
          </Box>
          <Typography variant="caption" sx={{ color: '#444', fontSize: '0.65rem' }}>
            {formatDate(garment.created_at)}
          </Typography>
          <Button variant="outlined" size="small" fullWidth endIcon={<ArrowForwardIcon />} onClick={() => onUse(garment)} sx={{ mt: 0.5 }}>
            Use in Try-On
          </Button>
        </Box>
    </Paper>
  )
}

// ── Try-On Card ────────────────────────────────────────────
function TryOnCard({ tryon }) {
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = `/api/v1/try-ons/${tryon.id}/download`
    a.download = `tryon-${tryon.id}.jpg`
    a.click()
  }

  return (
    <Paper sx={galleryCardSx}>
        <Box sx={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
          <Box
            component="img"
            src={tryon.result_url}
            alt="Try-on result"
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.style.opacity = 0 }}
          />
          <Chip
            label={tryon.garment_type}
            size="small"
            sx={{
              position: 'absolute', top: 8, right: 8,
              backgroundColor: 'rgba(0,0,0,0.65)',
              color: '#ccc',
              fontSize: '0.65rem',
              textTransform: 'capitalize',
              backdropFilter: 'blur(4px)',
            }}
          />
          <Box
            className="gallery-overlay"
            sx={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
              p: 1.5,
              display: 'flex',
              justifyContent: 'flex-end',
              opacity: 0,
              transform: 'translateY(8px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            <Tooltip title="Download">
              <IconButton
                size="small"
                onClick={handleDownload}
                sx={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <DownloadIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>Model</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.65rem' }}>
                  {tryon.model_id.slice(0, 8)}…
                </Typography>
                <CopyButton value={tryon.model_id} />
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: '#1e1e1e' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>Garment</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.65rem' }}>
                  {tryon.garment_id.slice(0, 8)}…
                </Typography>
                <CopyButton value={tryon.garment_id} />
              </Box>
            </Box>
          </Box>
          <Typography variant="caption" sx={{ color: '#444', fontSize: '0.65rem' }}>
            {formatDate(tryon.created_at)}
          </Typography>
        </Box>
    </Paper>
  )
}

// ── Video Card ─────────────────────────────────────────────
function VideoCard({ video }) {
  const filename = `fashion-video-${video.id}.mp4`
  return (
    <Paper sx={{ ...galleryCardSx, '&:hover .gallery-overlay': undefined }}>
        <Box sx={{ position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
          <Box
            component="video"
            src={video.video_url}
            controls
            preload="metadata"
            sx={{ width: '100%', display: 'block', maxHeight: 280 }}
          />
          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
            <Chip
              label={video.aspect_ratio}
              size="small"
              sx={{ backgroundColor: 'rgba(0,0,0,0.65)', color: '#ccc', fontSize: '0.65rem', backdropFilter: 'blur(4px)' }}
            />
            <Chip
              label={`${video.duration}s`}
              size="small"
              sx={{ backgroundColor: 'rgba(124,58,237,0.2)', color: 'primary.main', border: '1px solid rgba(124,58,237,0.3)', fontSize: '0.65rem', fontWeight: 600 }}
            />
          </Box>
        </Box>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {video.prompt && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}
            >
              {video.prompt}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#555', display: 'block', fontSize: '0.65rem' }}>Try-On</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.65rem' }}>
              {video.tryon_id.slice(0, 8)}…
            </Typography>
            <CopyButton value={video.tryon_id} />
          </Box>
          <Typography variant="caption" sx={{ color: '#444', fontSize: '0.65rem' }}>
            {formatDate(video.created_at)}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            startIcon={<DownloadIcon />}
            href={video.video_url}
            download={filename}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mt: 0.5 }}
          >
            Download MP4
          </Button>
        </Box>
    </Paper>
  )
}

// ── Empty state ────────────────────────────────────────────
function EmptyState({ icon, message, actionLabel, actionPath }) {
  const navigate = useNavigate()
  return (
    <Box
      sx={{
        gridColumn: '1 / -1',
        borderRadius: 3,
        p: 8,
        textAlign: 'center',
        ...glassPanelSx,
        border: '2px dashed rgba(124,58,237,0.12)',
        animation: 'fadeInUp 0.5s ease both',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(91,33,182,0.05))',
          border: '1px solid rgba(124,58,237,0.2)',
          mb: 3,
          animation: 'float 4s ease-in-out infinite',
          color: 'rgba(124,58,237,0.5)',
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>{message}</Typography>
      {actionLabel && (
        <Button variant="contained" onClick={() => navigate(actionPath)}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}

// ── Loading state ──────────────────────────────────────────
function LoadingState() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton variant="rectangular" sx={{ borderRadius: 2, aspectRatio: '3/4', width: '100%', bgcolor: 'rgba(255,255,255,0.05)' }} />
          <Skeleton variant="text" width="70%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
          <Skeleton variant="text" width="50%" sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
        </Box>
      ))}
    </>
  )
}

function ErrorState({ message }) {
  return (
    <Alert severity="error" sx={{ gridColumn: '1 / -1', backgroundColor: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.25)' }}>
      {message}
    </Alert>
  )
}

function ItemGridLayout({ children }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2.5 }}>
      {children}
    </Box>
  )
}

// ── Main page ──────────────────────────────────────────────
export default function GalleryPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)

  const [models, setModels] = useState([])
  const [modelsLoading, setModelsLoading] = useState(true)
  const [modelsError, setModelsError] = useState(null)

  const [garments, setGarments] = useState([])
  const [garmentsLoading, setGarmentsLoading] = useState(true)
  const [garmentsError, setGarmentsError] = useState(null)

  const [tryons, setTryons] = useState([])
  const [tryonsLoading, setTryonsLoading] = useState(true)
  const [tryonsError, setTryonsError] = useState(null)

  const [videos, setVideos] = useState([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [videosError, setVideosError] = useState(null)

  const fetchAll = useCallback(() => {
    setModelsLoading(true); setGarmentsLoading(true); setTryonsLoading(true); setVideosLoading(true)

    getModels().then(({ data, error }) => {
      if (error) setModelsError(error)
      else setModels([...data].reverse())
      setModelsLoading(false)
    })
    getGarments().then(({ data, error }) => {
      if (error) setGarmentsError(error)
      else setGarments([...data].reverse())
      setGarmentsLoading(false)
    })
    getTryOns().then(({ data, error }) => {
      if (error) setTryonsError(error)
      else setTryons([...data].reverse())
      setTryonsLoading(false)
    })
    getVideos().then(({ data, error }) => {
      if (error) setVideosError(error)
      else setVideos([...data].reverse())
      setVideosLoading(false)
    })
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleUseModel = (model) => {
    sessionStorage.setItem('generatedModel', JSON.stringify({ id: model.id, name: model.name, image_url: model.image_url }))
    navigate('/try-on')
  }

  const handleUseGarment = (garment) => {
    sessionStorage.setItem('generatedGarment', JSON.stringify({ id: garment.id, name: garment.name, image_url: garment.image_url }))
    navigate('/try-on')
  }

  const tabCounts = [models.length, garments.length, tryons.length, videos.length]

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 0.5,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              background: 'linear-gradient(135deg, #DDD6FE 0%, #A78BFA 60%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Gallery
          </Typography>
          <Typography sx={{ color: '#888', lineHeight: 1.6, fontSize: '0.95rem' }}>
            All your generated models, garments, try-on results, and videos.
          </Typography>
        </Box>
        <Tooltip title="Refresh all">
          <IconButton
            onClick={fetchAll}
            sx={{
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'text.secondary',
              borderRadius: 2,
              backdropFilter: 'blur(8px)',
              '&:hover': {
                borderColor: 'rgba(124,58,237,0.4)',
                backgroundColor: 'rgba(124,58,237,0.08)',
                color: '#A78BFA',
              },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          mb: 4,
          backgroundColor: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px 12px 0 0',
          px: 0.5,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          TabIndicatorProps={{
            style: {
              background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
              borderRadius: 3,
              height: 3,
              boxShadow: '0 0 12px rgba(124,58,237,0.6)',
            },
          }}
        >
          {[
            { icon: <PersonIcon sx={{ fontSize: 16 }} />, label: 'Models' },
            { icon: <CheckroomIcon sx={{ fontSize: 16 }} />, label: 'Garments' },
            { icon: <AutoAwesomeIcon sx={{ fontSize: 16 }} />, label: 'Try-Ons' },
            { icon: <VideocamIcon sx={{ fontSize: 16 }} />, label: 'Videos' },
          ].map((t, i) => (
            <Tab
              key={t.label}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {t.icon}
                  {t.label}
                  {tabCounts[i] > 0 && (
                    <Chip
                      label={tabCounts[i]}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        background: tab === i ? 'linear-gradient(135deg, #7C3AED, #A78BFA)' : '#1a1a1a',
                        color: tab === i ? '#fff' : '#666',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* ── Models tab ── */}
      {tab === 0 && (
        <Box sx={{ animation: 'fadeInUp 0.3s ease both' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" size="small" startIcon={<PersonIcon />} onClick={() => navigate('/generate-model')}>
              Generate New Model
            </Button>
          </Box>
          <ItemGridLayout>
            {modelsLoading && <LoadingState />}
            {modelsError && <ErrorState message={modelsError} />}
            {!modelsLoading && !modelsError && models.length === 0 && (
              <EmptyState icon={<PersonIcon sx={{ fontSize: 36 }} />} message="No models yet. Generate your first model." actionLabel="Generate a Model" actionPath="/generate-model" />
            )}
            {!modelsLoading && !modelsError && models.map((m) => (
              <ModelCard key={m.id} model={m} onUse={handleUseModel} />
            ))}
          </ItemGridLayout>
        </Box>
      )}

      {/* ── Garments tab ── */}
      {tab === 1 && (
        <Box sx={{ animation: 'fadeInUp 0.3s ease both' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" size="small" startIcon={<CheckroomIcon />} onClick={() => navigate('/generate-garment')}>
              Generate New Garment
            </Button>
          </Box>
          <ItemGridLayout>
            {garmentsLoading && <LoadingState />}
            {garmentsError && <ErrorState message={garmentsError} />}
            {!garmentsLoading && !garmentsError && garments.length === 0 && (
              <EmptyState icon={<CheckroomIcon sx={{ fontSize: 36 }} />} message="No garments yet. Generate your first garment." actionLabel="Generate a Garment" actionPath="/generate-garment" />
            )}
            {!garmentsLoading && !garmentsError && garments.map((g) => (
              <GarmentCard key={g.id} garment={g} onUse={handleUseGarment} />
            ))}
          </ItemGridLayout>
        </Box>
      )}

      {/* ── Try-Ons tab ── */}
      {tab === 2 && (
        <Box sx={{ animation: 'fadeInUp 0.3s ease both' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" size="small" startIcon={<AutoAwesomeIcon />} onClick={() => navigate('/try-on')}>
              New Try-On
            </Button>
          </Box>
          <ItemGridLayout>
            {tryonsLoading && <LoadingState />}
            {tryonsError && <ErrorState message={tryonsError} />}
            {!tryonsLoading && !tryonsError && tryons.length === 0 && (
              <EmptyState icon={<AutoAwesomeIcon sx={{ fontSize: 36 }} />} message="No try-ons yet. Run your first virtual try-on." actionLabel="Go to Try-On" actionPath="/try-on" />
            )}
            {!tryonsLoading && !tryonsError && tryons.map((t) => (
              <TryOnCard key={t.id} tryon={t} />
            ))}
          </ItemGridLayout>
        </Box>
      )}

      {/* ── Videos tab ── */}
      {tab === 3 && (
        <Box sx={{ animation: 'fadeInUp 0.3s ease both' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" size="small" startIcon={<VideocamIcon />} onClick={() => navigate('/video')}>
              Generate New Video
            </Button>
          </Box>
          <ItemGridLayout>
            {videosLoading && <LoadingState />}
            {videosError && <ErrorState message={videosError} />}
            {!videosLoading && !videosError && videos.length === 0 && (
              <EmptyState icon={<VideocamIcon sx={{ fontSize: 36 }} />} message="No videos yet. Generate your first fashion video." actionLabel="Go to Video Studio" actionPath="/video" />
            )}
            {!videosLoading && !videosError && videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </ItemGridLayout>
        </Box>
      )}
    </Container>
  )
}

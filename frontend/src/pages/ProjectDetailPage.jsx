import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Chip,
  Button,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  TextField,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import StyleIcon from '@mui/icons-material/Style'
import VideocamIcon from '@mui/icons-material/Videocam'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DownloadIcon from '@mui/icons-material/Download'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { glassCard } from '../theme'
import {
  getProject,
  renameProject,
  setActiveProject,
  clearActiveProject,
  getActiveProjectId,
} from '../utils/projectStore'
import {
  getModel,
  getGarment,
  getTryOn,
  getVideo,
} from '../api/fashionApi'

// ── Shared card style ──────────────────────────────────────────────────────────
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
  '&:hover .proj-overlay': { opacity: 1, transform: 'translateY(0)' },
}

function download(url, filename) {
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
}

function copyToClipboard(text) { navigator.clipboard.writeText(text).catch(() => {}) }

// ── Asset cards ───────────────────────────────────────────────────────────────
function ModelCard({ model, tryOnPath }) {
  const navigate = useNavigate()
  return (
    <Paper sx={{ ...glassCard, ...galleryCardSx }}>
      <Box sx={{ position: 'relative', aspectRatio: '3/4', flexShrink: 0 }}>
        <Box component="img" src={model.image_url} alt={model.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box className="proj-overlay" sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
          opacity: 0, transform: 'translateY(8px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          display: 'flex', alignItems: 'flex-end', p: 1.5,
        }}>
          <IconButton size="small" onClick={() => download(model.image_url, `model-${model.id}.jpg`)}
            sx={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { backgroundColor: 'rgba(124,58,237,0.6)' } }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ p: 1.5, flexGrow: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', mb: 0.5 }}>{model.name}</Typography>
        <Button size="small" variant="outlined" fullWidth sx={{ mt: 1, fontSize: '0.7rem' }}
          onClick={() => { sessionStorage.setItem('generatedModel', JSON.stringify({ id: model.id, name: model.name, image_url: model.image_url })); navigate(tryOnPath || '/try-on') }}>
          Use in Try-On
        </Button>
      </Box>
    </Paper>
  )
}

function GarmentCard({ garment, tryOnPath }) {
  const navigate = useNavigate()
  return (
    <Paper sx={{ ...glassCard, ...galleryCardSx }}>
      <Box sx={{ position: 'relative', aspectRatio: '1/1', flexShrink: 0 }}>
        <Box component="img" src={garment.image_url} alt={garment.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box className="proj-overlay" sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
          opacity: 0, transform: 'translateY(8px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          display: 'flex', alignItems: 'flex-end', p: 1.5,
        }}>
          <IconButton size="small" onClick={() => download(garment.image_url, `garment-${garment.id}.jpg`)}
            sx={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { backgroundColor: 'rgba(124,58,237,0.6)' } }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ p: 1.5, flexGrow: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', mb: 0.5 }}>{garment.name}</Typography>
        <Button size="small" variant="outlined" fullWidth sx={{ mt: 1, fontSize: '0.7rem' }}
          onClick={() => { sessionStorage.setItem('generatedGarment', JSON.stringify({ id: garment.id, name: garment.name, image_url: garment.image_url })); navigate(tryOnPath || '/try-on') }}>
          Use in Try-On
        </Button>
      </Box>
    </Paper>
  )
}

function TryOnCard({ tryon }) {
  return (
    <Paper sx={{ ...glassCard, ...galleryCardSx }}>
      <Box sx={{ position: 'relative', aspectRatio: '3/4', flexShrink: 0 }}>
        <Box component="img" src={tryon.result_url} alt="Try-on result"
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box className="proj-overlay" sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
          opacity: 0, transform: 'translateY(8px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          display: 'flex', alignItems: 'flex-end', p: 1.5,
        }}>
          <IconButton size="small" onClick={() => download(tryon.result_url, `tryon-${tryon.id}.jpg`)}
            sx={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { backgroundColor: 'rgba(124,58,237,0.6)' } }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ p: 1.5 }}>
        <Chip label={tryon.garment_type || 'Try-On'} size="small"
          sx={{ fontSize: '0.65rem', backgroundColor: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', color: '#A78BFA' }} />
      </Box>
    </Paper>
  )
}

function VideoCard({ video }) {
  return (
    <Paper sx={{ ...glassCard, ...galleryCardSx }}>
      <Box sx={{ position: 'relative' }}>
        <Box component="video" src={video.video_url} controls loop muted
          sx={{ width: '100%', display: 'block' }} />
      </Box>
      <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
        <Button size="small" variant="outlined" startIcon={<DownloadIcon />}
          sx={{ flex: 1, fontSize: '0.7rem' }}
          onClick={() => download(video.video_url, `video-${video.id}.mp4`)}>
          Download
        </Button>
      </Box>
    </Paper>
  )
}

// ── Empty tab state ───────────────────────────────────────────────────────────
function EmptyTab({ icon, label, ctaLabel, ctaPath }) {
  const navigate = useNavigate()
  return (
    <Box sx={{ ...glassCard, borderRadius: 3, p: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ fontSize: 48, color: 'rgba(124,58,237,0.3)', animation: 'float 4s ease-in-out infinite' }}>{icon}</Box>
      <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No {label} in this project yet</Typography>
      <Button variant="outlined" size="small" onClick={() => navigate(ctaPath)} sx={{ mt: 1 }}>{ctaLabel}</Button>
    </Box>
  )
}

// ── Async asset list ──────────────────────────────────────────────────────────
function useAssets(ids, fetchFn) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ids || ids.length === 0) { setItems([]); return }
    setLoading(true)
    Promise.all(ids.map((id) => fetchFn(id).then(({ data }) => data).catch(() => null)))
      .then((results) => setItems(results.filter(Boolean)))
      .finally(() => setLoading(false))
  }, [JSON.stringify(ids)])

  return { items, loading }
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toProject = (path) => `/projects/${id}${path}`
  const [project, setProject] = useState(null)
  const [activeId, setActiveId] = useState(getActiveProjectId())
  const [tab, setTab] = useState(0)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')

  const refresh = async () => {
    const p = await getProject(id)
    setProject(p)
    setActiveId(getActiveProjectId())
  }

  useEffect(() => { refresh() }, [id])

  const { items: models, loading: modelsLoading } = useAssets(project?.assets.modelIds, getModel)
  const { items: garments, loading: garmentsLoading } = useAssets(project?.assets.garmentIds, getGarment)
  const { items: tryons, loading: tryonsLoading } = useAssets(project?.assets.tryonIds, getTryOn)
  const { items: videos, loading: videosLoading } = useAssets(project?.assets.videoIds, getVideo)

  if (!project) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress size={32} sx={{ color: '#7C3AED' }} />
    </Box>
  )

  const isActive = project.id === activeId

  const handleToggleActive = () => {
    if (isActive) { clearActiveProject(); setActiveId(null) }
    else { setActiveProject(project.id); setActiveId(project.id) }
  }

  const handleRenameSubmit = async () => {
    await renameProject(project.id, editName)
    setEditing(false)
    refresh()
  }

  const stats = [
    { icon: <PersonIcon sx={{ fontSize: 14 }} />, label: 'Models', count: project.assets.modelIds.length },
    { icon: <CheckroomIcon sx={{ fontSize: 14 }} />, label: 'Garments', count: project.assets.garmentIds.length },
    { icon: <StyleIcon sx={{ fontSize: 14 }} />, label: 'Try-Ons', count: project.assets.tryonIds.length },
    { icon: <VideocamIcon sx={{ fontSize: 14 }} />, label: 'Videos', count: project.assets.videoIds.length },
  ]

  const allItems = [...models, ...garments, ...tryons]
  const allLoading = modelsLoading || garmentsLoading || tryonsLoading || videosLoading

  return (
    <Box sx={{ minHeight: '100vh', pt: 2, pb: 8 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box sx={{ mb: 4, animation: 'fadeInUp 0.5s ease both' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
            <IconButton onClick={() => navigate('/projects')}
              sx={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, mt: 0.5,
                '&:hover': { backgroundColor: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' } }}>
              <ArrowBackIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {editing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TextField
                    autoFocus size="small" value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setEditing(false) }}
                    sx={{ maxWidth: 360 }}
                    inputProps={{ maxLength: 60 }}
                  />
                  <IconButton size="small" onClick={handleRenameSubmit} sx={{ color: '#A78BFA' }}><CheckIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => setEditing(false)} sx={{ color: 'rgba(255,255,255,0.4)' }}><CloseIcon fontSize="small" /></IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h4" sx={{
                    fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' },
                    background: 'linear-gradient(135deg, #DDD6FE 0%, #A78BFA 60%, #7C3AED 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {project.displayName}
                  </Typography>
                  <IconButton size="small" onClick={() => { setEditName(project.rawName); setEditing(true) }}
                    sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#A78BFA' } }}>
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Created {new Date(project.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Typography>
                <Chip
                  icon={isActive ? <CheckCircleIcon sx={{ fontSize: '14px !important', color: '#66bb6a !important' }} /> : undefined}
                  label={isActive ? 'Active Project' : 'Set as Active'}
                  size="small"
                  onClick={handleToggleActive}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(46,125,50,0.12)' : 'rgba(255,255,255,0.04)',
                    border: isActive ? '1px solid rgba(46,125,50,0.35)' : '1px solid rgba(255,255,255,0.1)',
                    color: isActive ? '#66bb6a' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.7rem',
                    '&:hover': { backgroundColor: isActive ? 'rgba(46,125,50,0.2)' : 'rgba(124,58,237,0.1)' },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Stats row */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
            {stats.map((s) => (
              <Box key={s.label} sx={{
                display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75,
                borderRadius: 2, backgroundColor: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.18)',
              }}>
                <Box sx={{ color: '#A78BFA', display: 'flex' }}>{s.icon}</Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{s.count}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{
          borderRadius: '12px 12px 0 0',
          backgroundColor: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          mb: 3,
          animation: 'fadeInUp 0.5s ease 0.1s both',
        }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            {['All', 'Models', 'Garments', 'Try-Ons', 'Videos'].map((label) => (
              <Tab key={label} label={label} sx={{ fontSize: '0.85rem', minWidth: 80 }} />
            ))}
          </Tabs>
        </Box>

        {allLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#7C3AED' }} />
          </Box>
        )}

        {!allLoading && (
          <Box sx={{ animation: 'fadeInUp 0.4s ease 0.15s both' }}>
            {/* Tab 0 — All */}
            {tab === 0 && (
              allItems.length === 0 && videos.length === 0 ? (
                <EmptyTab icon={<FolderOpenIcon sx={{ fontSize: 48 }} />} label="assets"
                  ctaLabel="Start Generating" ctaPath={toProject('/generate-model')} />
              ) : (
                <Grid container spacing={2}>
                  {models.map((m) => <Grid item xs={6} sm={4} md={3} key={m.id}><ModelCard model={m} tryOnPath={toProject('/try-on')} /></Grid>)}
                  {garments.map((g) => <Grid item xs={6} sm={4} md={3} key={g.id}><GarmentCard garment={g} tryOnPath={toProject('/try-on')} /></Grid>)}
                  {tryons.map((t) => <Grid item xs={6} sm={4} md={3} key={t.id}><TryOnCard tryon={t} /></Grid>)}
                  {videos.map((v) => <Grid item xs={12} sm={6} md={4} key={v.id}><VideoCard video={v} /></Grid>)}
                </Grid>
              )
            )}
            {/* Tab 1 — Models */}
            {tab === 1 && (models.length === 0
              ? <EmptyTab icon={<PersonIcon sx={{ fontSize: 48 }} />} label="models" ctaLabel="Generate Model" ctaPath={toProject('/generate-model')} />
              : <Grid container spacing={2}>{models.map((m) => <Grid item xs={6} sm={4} md={3} key={m.id}><ModelCard model={m} tryOnPath={toProject('/try-on')} /></Grid>)}</Grid>
            )}
            {/* Tab 2 — Garments */}
            {tab === 2 && (garments.length === 0
              ? <EmptyTab icon={<CheckroomIcon sx={{ fontSize: 48 }} />} label="garments" ctaLabel="Generate Garment" ctaPath={toProject('/generate-garment')} />
              : <Grid container spacing={2}>{garments.map((g) => <Grid item xs={6} sm={4} md={3} key={g.id}><GarmentCard garment={g} tryOnPath={toProject('/try-on')} /></Grid>)}</Grid>
            )}
            {/* Tab 3 — Try-Ons */}
            {tab === 3 && (tryons.length === 0
              ? <EmptyTab icon={<StyleIcon sx={{ fontSize: 48 }} />} label="try-ons" ctaLabel="Run Try-On" ctaPath={toProject('/try-on')} />
              : <Grid container spacing={2}>{tryons.map((t) => <Grid item xs={6} sm={4} md={3} key={t.id}><TryOnCard tryon={t} /></Grid>)}</Grid>
            )}
            {/* Tab 4 — Videos */}
            {tab === 4 && (videos.length === 0
              ? <EmptyTab icon={<VideocamIcon sx={{ fontSize: 48 }} />} label="videos" ctaLabel="Generate Video" ctaPath={toProject('/video')} />
              : <Grid container spacing={2}>{videos.map((v) => <Grid item xs={12} sm={6} md={4} key={v.id}><VideoCard video={v} /></Grid>)}</Grid>
            )}
          </Box>
        )}
      </Container>
    </Box>
  )
}

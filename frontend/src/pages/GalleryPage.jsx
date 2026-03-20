import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import { getModels, getGarments, getTryOns } from '../api/fashionApi'

// ── helpers ───────────────────────────────────────────────
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

// ── Model Card ─────────────────────────────────────────────
function ModelCard({ model, onUse }) {
  return (
    <Paper sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
        <Box
          component="img"
          src={model.image_url}
          alt={model.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.target.style.opacity = 0 }}
        />
        {model.tryon_result_url && (
          <Chip
            label="Used in Try-On"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(0,230,118,0.2)',
              color: 'primary.main',
              border: '1px solid rgba(0,230,118,0.3)',
              fontSize: '0.65rem',
              fontWeight: 600,
            }}
          />
        )}
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
        <Button
          variant="outlined"
          size="small"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={() => onUse(model)}
          sx={{ mt: 0.5 }}
        >
          Use in Try-On
        </Button>
      </Box>
    </Paper>
  )
}

// ── Garment Card ───────────────────────────────────────────
function GarmentCard({ garment, onUse }) {
  return (
    <Paper sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(0,230,118,0.2)',
              color: 'primary.main',
              border: '1px solid rgba(0,230,118,0.3)',
              fontSize: '0.65rem',
              fontWeight: 600,
            }}
          />
        )}
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
        <Button
          variant="outlined"
          size="small"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={() => onUse(garment)}
          sx={{ mt: 0.5 }}
        >
          Use in Try-On
        </Button>
      </Box>
    </Paper>
  )
}

// ── Try-On Card ────────────────────────────────────────────
function TryOnCard({ tryon }) {
  const filename = `tryon-${tryon.id}.jpg`
  return (
    <Paper sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.65)',
            color: '#ccc',
            fontSize: '0.65rem',
            textTransform: 'capitalize',
            backdropFilter: 'blur(4px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
            p: 1.5,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Tooltip title="Download">
            <IconButton
              size="small"
              href={tryon.result_url}
              download={filename}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)' }}
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

// ── Empty state ────────────────────────────────────────────
function EmptyState({ icon, message, actionLabel, actionPath }) {
  const navigate = useNavigate()
  return (
    <Box
      sx={{
        gridColumn: '1 / -1',
        border: '2px dashed #1e1e1e',
        borderRadius: 3,
        p: 8,
        textAlign: 'center',
      }}
    >
      <Box sx={{ color: '#2a2a2a', mb: 2 }}>{icon}</Box>
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
    <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={40} sx={{ color: 'primary.main' }} />
    </Box>
  )
}

// ── Error state ────────────────────────────────────────────
function ErrorState({ message }) {
  return (
    <Alert
      severity="error"
      sx={{ gridColumn: '1 / -1', backgroundColor: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.25)' }}
    >
      {message}
    </Alert>
  )
}

// ── Grid wrapper ───────────────────────────────────────────
function ItemGridLayout({ children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 2.5,
      }}
    >
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

  const fetchAll = useCallback(() => {
    setModelsLoading(true)
    setGarmentsLoading(true)
    setTryonsLoading(true)

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

  const tabCounts = [models.length, garments.length, tryons.length]

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Gallery
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            All your generated models, garments, and try-on results.
          </Typography>
        </Box>
        <Tooltip title="Refresh all">
          <IconButton
            onClick={fetchAll}
            sx={{ border: '1px solid #2a2a2a', color: 'text.secondary', borderRadius: 2, '&:hover': { borderColor: '#444' } }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #1e1e1e', mb: 4 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ fontSize: 16 }} />
                Models
                {tabCounts[0] > 0 && (
                  <Chip label={tabCounts[0]} size="small" sx={{ height: 18, fontSize: '0.65rem', backgroundColor: tab === 0 ? 'rgba(0,230,118,0.15)' : '#1a1a1a', color: tab === 0 ? 'primary.main' : '#666' }} />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckroomIcon sx={{ fontSize: 16 }} />
                Garments
                {tabCounts[1] > 0 && (
                  <Chip label={tabCounts[1]} size="small" sx={{ height: 18, fontSize: '0.65rem', backgroundColor: tab === 1 ? 'rgba(0,230,118,0.15)' : '#1a1a1a', color: tab === 1 ? 'primary.main' : '#666' }} />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                Try-Ons
                {tabCounts[2] > 0 && (
                  <Chip label={tabCounts[2]} size="small" sx={{ height: 18, fontSize: '0.65rem', backgroundColor: tab === 2 ? 'rgba(0,230,118,0.15)' : '#1a1a1a', color: tab === 2 ? 'primary.main' : '#666' }} />
                )}
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* ── Models tab ── */}
      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" size="small" startIcon={<PersonIcon />} onClick={() => navigate('/generate-model')}>
              Generate New Model
            </Button>
          </Box>
          <ItemGridLayout>
            {modelsLoading && <LoadingState />}
            {modelsError && <ErrorState message={modelsError} />}
            {!modelsLoading && !modelsError && models.length === 0 && (
              <EmptyState
                icon={<PersonIcon sx={{ fontSize: 48 }} />}
                message="No models yet. Generate your first model."
                actionLabel="Generate a Model"
                actionPath="/generate-model"
              />
            )}
            {!modelsLoading && !modelsError && models.map((m) => (
              <ModelCard key={m.id} model={m} onUse={handleUseModel} />
            ))}
          </ItemGridLayout>
        </Box>
      )}

      {/* ── Garments tab ── */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" size="small" startIcon={<CheckroomIcon />} onClick={() => navigate('/generate-garment')}>
              Generate New Garment
            </Button>
          </Box>
          <ItemGridLayout>
            {garmentsLoading && <LoadingState />}
            {garmentsError && <ErrorState message={garmentsError} />}
            {!garmentsLoading && !garmentsError && garments.length === 0 && (
              <EmptyState
                icon={<CheckroomIcon sx={{ fontSize: 48 }} />}
                message="No garments yet. Generate your first garment."
                actionLabel="Generate a Garment"
                actionPath="/generate-garment"
              />
            )}
            {!garmentsLoading && !garmentsError && garments.map((g) => (
              <GarmentCard key={g.id} garment={g} onUse={handleUseGarment} />
            ))}
          </ItemGridLayout>
        </Box>
      )}

      {/* ── Try-Ons tab ── */}
      {tab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" size="small" startIcon={<AutoAwesomeIcon />} onClick={() => navigate('/try-on')}>
              New Try-On
            </Button>
          </Box>
          <ItemGridLayout>
            {tryonsLoading && <LoadingState />}
            {tryonsError && <ErrorState message={tryonsError} />}
            {!tryonsLoading && !tryonsError && tryons.length === 0 && (
              <EmptyState
                icon={<AutoAwesomeIcon sx={{ fontSize: 48 }} />}
                message="No try-ons yet. Run your first virtual try-on."
                actionLabel="Go to Try-On"
                actionPath="/try-on"
              />
            )}
            {!tryonsLoading && !tryonsError && tryons.map((t) => (
              <TryOnCard key={t.id} tryon={t} />
            ))}
          </ItemGridLayout>
        </Box>
      )}
    </Container>
  )
}

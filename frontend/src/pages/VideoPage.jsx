import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Alert,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  TextField,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import VideocamIcon from '@mui/icons-material/Videocam'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DownloadIcon from '@mui/icons-material/Download'
import { generateVideo, getTryOns } from '../api/fashionApi'
import { addAssetToProject } from '../utils/projectStore'
import { useProjectNav } from '../hooks/useProjectNav'
import ProjectBanner from '../components/ProjectBanner'
import WorkflowStepper from '../components/WorkflowStepper'

const STEPS = ['Select Try-On & Settings', 'Result']

function TryOnCard({ item, selected, onSelect }) {
  return (
    <Box
      onClick={() => onSelect(item)}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: selected ? 'primary.main' : '#1e1e1e',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        backgroundColor: '#111',
        '&:hover': { borderColor: selected ? 'primary.main' : '#444' },
        aspectRatio: '3/4',
      }}
    >
      <Box
        component="img"
        src={item.result_url}
        alt={item.id}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: selected ? 1 : 0.75,
        }}
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
          p: 1.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: selected ? 'primary.main' : '#ccc',
            fontWeight: selected ? 700 : 400,
            display: 'block',
            lineHeight: 1.3,
            fontFamily: 'monospace',
            fontSize: '0.65rem',
          }}
        >
          {item.id.slice(0, 12)}…
        </Typography>
      </Box>
      {selected && (
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            backgroundColor: 'primary.main',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 16, color: '#000' }} />
        </Box>
      )}
    </Box>
  )
}

function TryOnGrid({ items, loading, error, selectedId, onSelect, toPath }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} sx={{ color: 'primary.main' }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ backgroundColor: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.25)' }}>
        {error}
      </Alert>
    )
  }

  if (items.length === 0) {
    return (
      <Box sx={{ border: '2px dashed #2a2a2a', borderRadius: 3, p: 5, textAlign: 'center' }}>
        <VideocamIcon sx={{ fontSize: 40, color: '#444', mb: 1.5 }} />
        <Typography sx={{ color: 'text.secondary', mb: 3, mt: 0.5 }}>
          No try-on results yet. Run a try-on first.
        </Typography>
        <Button variant="contained" startIcon={<AutoFixHighIcon />} onClick={() => navigate(toPath ? toPath('/try-on') : '/try-on')}>
          Go to Try-On
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 1.5,
          maxHeight: 360,
          overflowY: 'auto',
          pr: 0.5,
          pb: 0.5,
        }}
      >
        {items.map((item) => (
          <TryOnCard
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            onSelect={onSelect}
          />
        ))}
      </Box>
      <Button
        variant="text"
        size="small"
        startIcon={<AutoFixHighIcon />}
        onClick={() => navigate(toPath ? toPath('/try-on') : '/try-on')}
        sx={{ color: 'text.secondary', mt: 1.5 }}
      >
        Generate a new try-on
      </Button>
    </Box>
  )
}

export default function VideoPage() {
  const navigate = useNavigate()
  const { projectId, project, to } = useProjectNav()
  const [activeStep, setActiveStep] = useState(0)

  // Step 1 — try-on selection
  const [tryonId, setTryonId] = useState(null)
  const [tryonImageUrl, setTryonImageUrl] = useState(null)
  const [tryons, setTryons] = useState([])
  const [tryonsLoading, setTryonsLoading] = useState(false)
  const [tryonsError, setTryonsError] = useState(null)

  // Step 1 — settings
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(5)
  const [aspectRatio, setAspectRatio] = useState('9:16')

  // Step 2 — result
  const [status, setStatus] = useState('idle')
  const [videoUrl, setVideoUrl] = useState(null)
  const [error, setError] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  // Fetch try-ons on mount
  useEffect(() => {
    setTryonsLoading(true)
    getTryOns().then(({ data, error: err }) => {
      if (err) setTryonsError(err)
      else setTryons([...data].reverse())
      setTryonsLoading(false)
    })
  }, [])

  // Read pre-selected try-on from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('generatedTryOn')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setTryonId(parsed.id)
        setTryonImageUrl(parsed.result_url)
      } catch (_) {}
      sessionStorage.removeItem('generatedTryOn')
    }
  }, [])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  const handleSelectTryon = (item) => {
    setTryonId(item.id)
    setTryonImageUrl(item.result_url)
  }

  const handleGenerateVideo = async () => {
    setError(null)
    setVideoUrl(null)
    setStatus('running')
    setElapsed(0)
    setActiveStep(1)

    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    const { data, error: apiError } = await generateVideo(
      tryonId,
      prompt.trim() || null,
      duration,
      aspectRatio,
    )
    clearInterval(timer)

    if (apiError) {
      setStatus('error')
      setError(apiError)
      return
    }
    setVideoUrl(data.video_url)
    setStatus('done')
    if (projectId) addAssetToProject(projectId, 'videoIds', data.id)
  }

  const handleReset = () => {
    setActiveStep(0)
    setTryonId(null)
    setTryonImageUrl(null)
    setVideoUrl(null)
    setError(null)
    setStatus('idle')
    setElapsed(0)
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `fashion-video-${tryonId}.mp4`
    a.click()
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <ProjectBanner projectId={projectId} project={project} currentStepLabel="Video Studio" />
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 1,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
            background: 'linear-gradient(135deg, #DDD6FE 0%, #A78BFA 60%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Video Studio
        </Typography>
        <Typography sx={{ color: '#888', lineHeight: 1.6, fontSize: '0.95rem' }}>
          Turn a try-on result into a fashion video using Kling AI. Takes 1–3 minutes.
        </Typography>
      </Box>

      <WorkflowStepper
        currentStep="video"
        isDone={status === 'done'}
        project={project}
        onStepClick={(path) => navigate(to(path))}
      />

      <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* ── Step 1: Select Try-On & Settings ─────────────────────────── */}
      {activeStep === 0 && (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <VideocamIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Select Try-On Result
            </Typography>
            {tryonId && (
              <Chip
                label="Selected"
                size="small"
                sx={{ backgroundColor: 'rgba(124,58,237,0.15)', color: 'primary.main', border: '1px solid rgba(124,58,237,0.3)', fontWeight: 600 }}
              />
            )}
          </Box>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            Pick a try-on result to animate, then configure video settings.
          </Typography>

          {/* Selected try-on preview */}
          {tryonId && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(124,58,237,0.05)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              <Box
                component="img"
                src={tryonImageUrl}
                alt="Selected try-on"
                sx={{ width: 56, height: 72, objectFit: 'cover', borderRadius: 1.5, border: '1px solid rgba(124,58,237,0.4)' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <Box>
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  Try-On Result
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                  {tryonId}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="text"
                sx={{ ml: 'auto', color: 'text.secondary' }}
                onClick={() => { setTryonId(null); setTryonImageUrl(null) }}
              >
                Clear
              </Button>
            </Box>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <TryOnGrid
                items={tryons}
                loading={tryonsLoading}
                error={tryonsError}
                selectedId={tryonId}
                onSelect={handleSelectTryon}
                toPath={to}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <Divider sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }} />

              {/* Prompt */}
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Motion Prompt <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 400 }}>(optional)</Typography>
              </Typography>
              <TextField
                multiline
                minRows={3}
                fullWidth
                placeholder="Fashion model walking confidently on runway, smooth motion, professional lighting…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                sx={{ mb: 3 }}
                inputProps={{ maxLength: 500 }}
                helperText={`${prompt.length}/500`}
              />

              {/* Duration */}
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Duration
              </Typography>
              <ToggleButtonGroup
                value={duration}
                exclusive
                onChange={(_, v) => v && setDuration(v)}
                fullWidth
                sx={{ mb: 3, gap: 1 }}
              >
                <ToggleButton value={5} sx={{ borderRadius: '8px !important', border: '1px solid' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>5s</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Standard</Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton value={10} sx={{ borderRadius: '8px !important', border: '1px solid' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>10s</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Extended</Typography>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Aspect Ratio */}
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Aspect Ratio
              </Typography>
              <ToggleButtonGroup
                value={aspectRatio}
                exclusive
                onChange={(_, v) => v && setAspectRatio(v)}
                fullWidth
                sx={{ gap: 1 }}
              >
                {[
                  { value: '9:16', label: '9:16', desc: 'Portrait' },
                  { value: '16:9', label: '16:9', desc: 'Landscape' },
                  { value: '1:1', label: '1:1', desc: 'Square' },
                ].map((r) => (
                  <ToggleButton key={r.value} value={r.value} sx={{ borderRadius: '8px !important', border: '1px solid', flex: 1 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.label}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{r.desc}</Typography>
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={handleGenerateVideo}
              disabled={!tryonId}
              sx={{ px: 4 }}
            >
              Generate Video
            </Button>
          </Box>
        </Paper>
      )}

      {/* ── Step 2: Result ───────────────────────────────── */}
      {activeStep === 1 && (
        <Box>
          {status === 'running' && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  border: '3px solid #7C3AED',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                  mx: 'auto',
                  mb: 3,
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Generating video…
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                {elapsed < 30
                  ? 'Submitting to Kling AI…'
                  : elapsed < 90
                    ? 'Generating video, this takes 1–3 minutes…'
                    : 'Almost there, finalizing…'}
              </Typography>
              <LinearProgress sx={{ maxWidth: 320, mx: 'auto', mb: 1.5 }} />
              <Typography variant="caption" sx={{ color: '#555' }}>
                {formatTime(elapsed)} elapsed · up to 3 min
              </Typography>
            </Paper>
          )}

          {status === 'error' && (
            <Paper sx={{ p: 4 }}>
              <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.25)' }}>
                {error}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={handleGenerateVideo}>Retry</Button>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveStep(0)} sx={{ color: 'text.secondary' }}>
                  Go Back
                </Button>
              </Box>
            </Paper>
          )}

          {status === 'done' && videoUrl && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 3, backgroundColor: '#000' }}>
                  <Box
                    component="video"
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    sx={{ width: '100%', display: 'block', maxHeight: 600 }}
                  />
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      size="small"
                    >
                      Download MP4
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Video Ready
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.7 }}>
                    Your fashion video is ready. Generate another or explore your gallery.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<VideocamIcon />}
                      onClick={() => {
                        setActiveStep(0)
                        setVideoUrl(null)
                        setError(null)
                        setStatus('idle')
                        setElapsed(0)
                      }}
                    >
                      Generate Another
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<AutoFixHighIcon />}
                      onClick={() => navigate(to('/try-on'))}
                    >
                      Try a Different Look
                    </Button>
                    <Button
                      variant="text"
                      fullWidth
                      startIcon={<RestartAltIcon />}
                      onClick={handleReset}
                      sx={{ color: 'text.secondary' }}
                    >
                      Start Over
                    </Button>
                    <Divider />
                    <Button
                      variant="text"
                      fullWidth
                      onClick={() => navigate(to('/gallery'))}
                      sx={{ color: 'text.secondary' }}
                    >
                      View Gallery
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Container>
  )
}

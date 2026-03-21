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
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import PersonIcon from '@mui/icons-material/Person'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VideocamIcon from '@mui/icons-material/Videocam'
import ResultDisplay from '../components/ResultDisplay'
import { runTryOn, getModels, getGarments } from '../api/fashionApi'

const STEPS = ['Select Model', 'Select Garment', 'Result']

const GARMENT_TYPES = [
  { value: 'upper', label: 'Upper Body', desc: 'Tops, shirts, jackets' },
  { value: 'lower', label: 'Lower Body', desc: 'Pants, skirts, shorts' },
  { value: 'overall', label: 'Full Outfit', desc: 'Dresses, full looks' },
]

function ItemCard({ item, selected, onSelect }) {
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
        src={item.image_url}
        alt={item.name}
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
      {/* Overlay gradient */}
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
          }}
        >
          {item.name}
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

function ItemGrid({ items, loading, error, selectedId, onSelect, emptyLabel, generatePath, generateLabel, generateIcon }) {
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
        {generateIcon}
        <Typography sx={{ color: 'text.secondary', mb: 3, mt: 1.5 }}>{emptyLabel}</Typography>
        <Button variant="contained" startIcon={generateIcon} onClick={() => navigate(generatePath)}>
          {generateLabel}
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
          <ItemCard
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
        startIcon={generateIcon}
        onClick={() => navigate(generatePath)}
        sx={{ color: 'text.secondary', mt: 1.5 }}
      >
        {generateLabel}
      </Button>
    </Box>
  )
}

export default function TryOnPage() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)

  // Step 1 — model
  const [modelId, setModelId] = useState(null)
  const [modelImageUrl, setModelImageUrl] = useState(null)
  const [modelName, setModelName] = useState(null)
  const [models, setModels] = useState([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState(null)

  // Step 2 — garment
  const [garmentId, setGarmentId] = useState(null)
  const [garmentImageUrl, setGarmentImageUrl] = useState(null)
  const [garmentName, setGarmentName] = useState(null)
  const [garmentType, setGarmentType] = useState('upper')
  const [garments, setGarments] = useState([])
  const [garmentsLoading, setGarmentsLoading] = useState(false)
  const [garmentsError, setGarmentsError] = useState(null)

  // Step 3 — result
  const [status, setStatus] = useState('idle')
  const [resultUrl, setResultUrl] = useState(null)
  const [tryOnId, setTryOnId] = useState(null)
  const [error, setError] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  // Fetch models on mount
  useEffect(() => {
    setModelsLoading(true)
    getModels().then(({ data, error: err }) => {
      if (err) setModelsError(err)
      else setModels([...data].reverse()) // newest first
      setModelsLoading(false)
    })
  }, [])

  // Fetch garments when arriving at step 2
  useEffect(() => {
    if (activeStep === 1 && garments.length === 0 && !garmentsLoading) {
      setGarmentsLoading(true)
      getGarments().then(({ data, error: err }) => {
        if (err) setGarmentsError(err)
        else setGarments([...data].reverse())
        setGarmentsLoading(false)
      })
    }
  }, [activeStep]) // eslint-disable-line react-hooks/exhaustive-deps

  // Read model from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('generatedModel')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setModelId(parsed.id)
        setModelImageUrl(parsed.image_url)
        setModelName(parsed.name)
      } catch (_) {}
      sessionStorage.removeItem('generatedModel')
    }
  }, [])

  // Read garment from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('generatedGarment')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setGarmentId(parsed.id)
        setGarmentImageUrl(parsed.image_url)
        setGarmentName(parsed.name)
        setActiveStep((s) => (s === 0 && modelId ? 1 : s))
      } catch (_) {}
      sessionStorage.removeItem('generatedGarment')
    }
  }, [modelId])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  const handleSelectModel = (item) => {
    setModelId(item.id)
    setModelImageUrl(item.image_url)
    setModelName(item.name)
  }

  const handleSelectGarment = (item) => {
    setGarmentId(item.id)
    setGarmentImageUrl(item.image_url)
    setGarmentName(item.name)
  }

  const handleRunTryOn = async () => {
    setError(null)
    setResultUrl(null)
    setStatus('running')
    setElapsed(0)
    setActiveStep(2)

    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    const { data, error: apiError } = await runTryOn(modelId, garmentId, garmentType)
    clearInterval(timer)

    if (apiError) {
      setStatus('error')
      setError(apiError)
      return
    }
    setResultUrl(data.result_url)
    setTryOnId(data.id)
    setStatus('done')
  }

  const handleReset = () => {
    setActiveStep(0)
    setModelId(null)
    setModelImageUrl(null)
    setModelName(null)
    setGarmentId(null)
    setGarmentImageUrl(null)
    setGarmentName(null)
    setGarmentType('upper')
    setResultUrl(null)
    setTryOnId(null)
    setError(null)
    setStatus('idle')
    setElapsed(0)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
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
          Virtual Try-On Studio
        </Typography>
        <Typography sx={{ color: '#888', lineHeight: 1.6, fontSize: '0.95rem' }}>
          Select a generated model and garment. AI will dress the model in the outfit.
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* ── Step 1: Select Model ─────────────────────────── */}
      {activeStep === 0 && (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <PersonIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Select Model
            </Typography>
            {modelId && (
              <Chip
                label="Selected"
                size="small"
                sx={{ backgroundColor: 'rgba(124,58,237,0.15)', color: 'primary.main', border: '1px solid rgba(124,58,237,0.3)', fontWeight: 600 }}
              />
            )}
          </Box>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            Pick a model from your library, or generate a new one.
          </Typography>

          {/* Selected model preview */}
          {modelId && (
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
                src={modelImageUrl}
                alt={modelName}
                sx={{ width: 56, height: 72, objectFit: 'cover', borderRadius: 1.5, border: '1px solid rgba(124,58,237,0.4)' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <Box>
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {modelName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                  {modelId}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="text"
                sx={{ ml: 'auto', color: 'text.secondary' }}
                onClick={() => { setModelId(null); setModelImageUrl(null); setModelName(null) }}
              >
                Clear
              </Button>
            </Box>
          )}

          <ItemGrid
            items={models}
            loading={modelsLoading}
            error={modelsError}
            selectedId={modelId}
            onSelect={handleSelectModel}
            emptyLabel="No models yet. Generate one first."
            generatePath="/generate-model"
            generateLabel="Generate a Model"
            generateIcon={<AutoFixHighIcon />}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => setActiveStep(1)}
              disabled={!modelId}
              sx={{ px: 4 }}
            >
              Next: Select Garment
            </Button>
          </Box>
        </Paper>
      )}

      {/* ── Step 2: Select Garment ───────────────────────── */}
      {activeStep === 1 && (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CheckroomIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Select Garment
            </Typography>
            {garmentId && (
              <Chip
                label="Selected"
                size="small"
                sx={{ backgroundColor: 'rgba(124,58,237,0.15)', color: 'primary.main', border: '1px solid rgba(124,58,237,0.3)', fontWeight: 600 }}
              />
            )}
          </Box>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            Pick a garment from your library, or generate a new one.
          </Typography>

          {/* Selected garment preview */}
          {garmentId && (
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
                src={garmentImageUrl}
                alt={garmentName}
                sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1.5, border: '1px solid rgba(124,58,237,0.4)' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <Box>
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {garmentName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                  {garmentId}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="text"
                sx={{ ml: 'auto', color: 'text.secondary' }}
                onClick={() => { setGarmentId(null); setGarmentImageUrl(null); setGarmentName(null) }}
              >
                Clear
              </Button>
            </Box>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <ItemGrid
                items={garments}
                loading={garmentsLoading}
                error={garmentsError}
                selectedId={garmentId}
                onSelect={handleSelectGarment}
                emptyLabel="No garments yet. Generate one first."
                generatePath="/generate-garment"
                generateLabel="Generate a Garment"
                generateIcon={<CheckroomIcon />}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Divider sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                Garment Type
              </Typography>
              <ToggleButtonGroup
                value={garmentType}
                exclusive
                onChange={(_, v) => v && setGarmentType(v)}
                orientation="vertical"
                fullWidth
                sx={{ gap: 1 }}
              >
                {GARMENT_TYPES.map((g) => (
                  <ToggleButton
                    key={g.value}
                    value={g.value}
                    sx={{
                      justifyContent: 'flex-start',
                      px: 2.5,
                      py: 1.5,
                      borderRadius: '8px !important',
                      border: '1px solid',
                    }}
                  >
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {g.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {g.desc}
                      </Typography>
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveStep(0)}
              sx={{ color: 'text.secondary' }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={handleRunTryOn}
              disabled={!garmentId}
              sx={{ px: 4 }}
            >
              Run Try-On
            </Button>
          </Box>
        </Paper>
      )}

      {/* ── Step 3: Result ───────────────────────────────── */}
      {activeStep === 2 && (
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
                AI is working…
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                {elapsed < 30
                  ? 'Preprocessing images and removing background…'
                  : elapsed < 90
                    ? 'Running Kling AI virtual try-on…'
                    : 'Almost there, finalizing result…'}
              </Typography>
              <LinearProgress sx={{ maxWidth: 320, mx: 'auto', mb: 1.5 }} />
              <Typography variant="caption" sx={{ color: '#555' }}>
                {formatTime(elapsed)} elapsed · up to 2 min
              </Typography>
            </Paper>
          )}

          {status === 'error' && (
            <Paper sx={{ p: 4 }}>
              <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.25)' }}>
                {error}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={handleRunTryOn}>Retry</Button>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveStep(1)} sx={{ color: 'text.secondary' }}>
                  Go Back
                </Button>
              </Box>
            </Paper>
          )}

          {status === 'done' && resultUrl && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <ResultDisplay imageUrl={resultUrl} title="Try-On Result" />
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Try-On Complete
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.7 }}>
                    Your AI try-on result is ready. Want to try a different garment or model?
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<CheckroomIcon />}
                      onClick={() => {
                        setActiveStep(1)
                        setGarmentId(null)
                        setGarmentImageUrl(null)
                        setGarmentName(null)
                        setStatus('idle')
                        setResultUrl(null)
                        setError(null)
                      }}
                    >
                      Try Different Garment
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<PersonIcon />}
                      onClick={() => {
                        setActiveStep(0)
                        setModelId(null)
                        setModelImageUrl(null)
                        setModelName(null)
                        setGarmentId(null)
                        setGarmentImageUrl(null)
                        setGarmentName(null)
                        setStatus('idle')
                        setResultUrl(null)
                        setError(null)
                      }}
                    >
                      Change Model
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
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<VideocamIcon />}
                      onClick={() => {
                        sessionStorage.setItem('generatedTryOn', JSON.stringify({ id: tryOnId, result_url: resultUrl }))
                        navigate('/video')
                      }}
                    >
                      Generate Video
                    </Button>
                    <Divider />
                    <Button
                      variant="text"
                      fullWidth
                      onClick={() => navigate('/gallery')}
                      sx={{ color: 'text.secondary' }}
                    >
                      View All Results
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

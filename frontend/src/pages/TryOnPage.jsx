import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
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
import { glassPanelSx } from '../theme'

const STEPS = ['Select Model', 'Select Garment', 'Result']

const GARMENT_TYPES = [
  { value: 'upper', label: 'Upper Body', desc: 'Tops, shirts, jackets' },
  { value: 'lower', label: 'Lower Body', desc: 'Pants, skirts, shorts' },
  { value: 'overall', label: 'Full Outfit', desc: 'Dresses, full looks' },
]

// ── Custom Glass Stepper ─────────────────────────────────────────────────────
function GlassStepper({ steps, activeStep }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 6,
        p: 2,
        ...glassPanelSx,
        borderRadius: 3,
      }}
    >
      {steps.map((label, index) => {
        const isCompleted = index < activeStep
        const isActive = index === activeStep
        return (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              {/* Step circle */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted
                    ? 'linear-gradient(135deg, #7C3AED, #5B21B6)'
                    : isActive
                      ? 'rgba(124,58,237,0.15)'
                      : 'rgba(255,255,255,0.03)',
                  border: isActive
                    ? '2px solid #7C3AED'
                    : isCompleted
                      ? 'none'
                      : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isActive ? '0 0 20px rgba(124,58,237,0.4), 0 0 40px rgba(124,58,237,0.1)' : 'none',
                  animation: isActive ? 'glowPulse 2s ease-in-out infinite' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {isCompleted ? (
                  <CheckCircleIcon sx={{ fontSize: 18, color: '#fff' }} />
                ) : (
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: isActive ? '#A78BFA' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {index + 1}
                  </Typography>
                )}
              </Box>
              {/* Label */}
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#DDD6FE' : isCompleted ? '#A78BFA' : 'rgba(255,255,255,0.3)',
                  transition: 'color 0.3s ease',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Typography>
            </Box>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  flex: 2,
                  height: 2,
                  mx: 1,
                  background: index < activeStep
                    ? 'linear-gradient(90deg, #7C3AED, #A78BFA)'
                    : 'rgba(255,255,255,0.06)',
                  borderRadius: 2,
                  transition: 'background 0.5s ease',
                  boxShadow: index < activeStep ? '0 0 8px rgba(124,58,237,0.4)' : 'none',
                }}
              />
            )}
          </Box>
        )
      })}
    </Box>
  )
}

// ── Garment Type Pill Selector ───────────────────────────────────────────────
function GarmentTypePill({ types, value, onChange }) {
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 3,
        ...glassPanelSx,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      {types.map((type) => {
        const isSelected = value === type.value
        return (
          <Box
            key={type.value}
            onClick={() => onChange(type.value)}
            sx={{
              px: 2.5,
              py: 1.5,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.22s ease',
              backgroundColor: isSelected ? 'rgba(124,58,237,0.15)' : 'transparent',
              border: isSelected ? '1px solid rgba(124,58,237,0.35)' : '1px solid transparent',
              boxShadow: isSelected ? '0 2px 12px rgba(124,58,237,0.15)' : 'none',
              '&:hover': {
                backgroundColor: isSelected ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.03)',
                border: isSelected
                  ? '1px solid rgba(124,58,237,0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: isSelected ? '#DDD6FE' : 'rgba(255,255,255,0.5)',
                transition: 'color 0.2s',
              }}
            >
              {type.label}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isSelected ? 'rgba(167,139,250,0.8)' : 'rgba(255,255,255,0.25)',
                display: 'block',
                transition: 'color 0.2s',
              }}
            >
              {type.desc}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

// ── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, selected, onSelect }) {
  return (
    <Box
      onClick={() => onSelect(item)}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: selected ? '#7C3AED' : 'rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(8px)',
        transform: selected ? 'scale(1.03)' : 'scale(1)',
        boxShadow: selected
          ? '0 0 0 2px rgba(124,58,237,0.3), 0 8px 24px rgba(124,58,237,0.2)'
          : 'none',
        willChange: 'transform',
        '&:hover': {
          borderColor: selected ? '#7C3AED' : 'rgba(124,58,237,0.4)',
          transform: 'scale(1.04)',
          boxShadow: '0 8px 24px rgba(124,58,237,0.15)',
        },
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
          transition: 'opacity 0.2s ease',
        }}
        onError={(e) => { e.target.style.display = 'none' }}
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
            color: selected ? '#A78BFA' : '#ccc',
            fontWeight: selected ? 700 : 400,
            display: 'block',
            lineHeight: 1.3,
            transition: 'color 0.2s',
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
            backgroundColor: '#7C3AED',
            borderRadius: '50%',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
            boxShadow: '0 0 12px rgba(124,58,237,0.7)',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />
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
      <Box
        sx={{
          border: '2px dashed rgba(124,58,237,0.12)',
          borderRadius: 3,
          p: 5,
          textAlign: 'center',
          ...glassPanelSx,
          animation: 'fadeInUp 0.4s ease both',
        }}
      >
        <Box sx={{ color: 'rgba(124,58,237,0.4)', mb: 2, animation: 'float 3s ease-in-out infinite' }}>
          {generateIcon}
        </Box>
        <Typography sx={{ color: 'text.secondary', mb: 3, mt: 1 }}>{emptyLabel}</Typography>
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

  const [modelId, setModelId] = useState(null)
  const [modelImageUrl, setModelImageUrl] = useState(null)
  const [modelName, setModelName] = useState(null)
  const [models, setModels] = useState([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState(null)

  const [garmentId, setGarmentId] = useState(null)
  const [garmentImageUrl, setGarmentImageUrl] = useState(null)
  const [garmentName, setGarmentName] = useState(null)
  const [garmentType, setGarmentType] = useState('upper')
  const [garments, setGarments] = useState([])
  const [garmentsLoading, setGarmentsLoading] = useState(false)
  const [garmentsError, setGarmentsError] = useState(null)

  const [status, setStatus] = useState('idle')
  const [resultUrl, setResultUrl] = useState(null)
  const [tryOnId, setTryOnId] = useState(null)
  const [error, setError] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    setModelsLoading(true)
    getModels().then(({ data, error: err }) => {
      if (err) setModelsError(err)
      else setModels([...data].reverse())
      setModelsLoading(false)
    })
  }, [])

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
    setModelId(null); setModelImageUrl(null); setModelName(null)
    setGarmentId(null); setGarmentImageUrl(null); setGarmentName(null)
    setGarmentType('upper')
    setResultUrl(null); setTryOnId(null)
    setError(null); setStatus('idle'); setElapsed(0)
  }

  const loadingLabel =
    elapsed < 30 ? 'Preprocessing images…' :
    elapsed < 90 ? 'Running Kling AI virtual try-on…' :
    'Finalizing result…'

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6, animation: 'fadeInUp 0.4s ease both' }}>
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

      <GlassStepper steps={STEPS} activeStep={activeStep} />

      {/* ── Step 1: Select Model ─────────────────────────── */}
      {activeStep === 0 && (
        <Paper sx={{ p: 4, ...glassPanelSx, animation: 'fadeInUp 0.4s ease both' }}>
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

          {modelId && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.2)',
                backdropFilter: 'blur(8px)',
                animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
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
        <Paper sx={{ p: 4, ...glassPanelSx, animation: 'fadeInUp 0.4s ease both' }}>
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

          {garmentId && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.2)',
                backdropFilter: 'blur(8px)',
                animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
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
              <GarmentTypePill
                types={GARMENT_TYPES}
                value={garmentType}
                onChange={setGarmentType}
              />
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
            <Paper
              sx={{
                p: 6,
                textAlign: 'center',
                ...glassPanelSx,
                animation: 'fadeInUp 0.4s ease both',
              }}
            >
              {/* Triple ring loader */}
              <Box sx={{ position: 'relative', width: 80, height: 80, mx: 'auto', mb: 4 }}>
                <Box sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '1px solid rgba(124,58,237,0.15)',
                  borderTopColor: 'rgba(167,139,250,0.4)',
                  animation: 'borderRotate 3s linear infinite',
                  willChange: 'transform',
                }} />
                <Box sx={{
                  position: 'absolute',
                  inset: 10,
                  borderRadius: '50%',
                  border: '2px solid rgba(124,58,237,0.1)',
                  borderTopColor: '#7C3AED',
                  borderRightColor: 'rgba(124,58,237,0.4)',
                  animation: 'borderRotate 1.4s linear infinite reverse',
                  willChange: 'transform',
                  boxShadow: '0 0 20px rgba(124,58,237,0.3)',
                }} />
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 10,
                  height: 10,
                  marginTop: '-5px',
                  marginLeft: '-5px',
                  borderRadius: '50%',
                  backgroundColor: '#A78BFA',
                  boxShadow: '0 0 16px rgba(167,139,250,0.9)',
                  animation: 'glowPulse 1s ease-in-out infinite',
                }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                AI is working…
              </Typography>
              <Typography
                sx={{
                  mb: 3,
                  background: 'linear-gradient(90deg, #7C3AED, #A78BFA, #DDD6FE, #A78BFA)',
                  backgroundSize: '300% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'morphGradient 3s linear infinite',
                }}
              >
                {loadingLabel}
              </Typography>
              <LinearProgress sx={{ maxWidth: 320, mx: 'auto', mb: 1.5, borderRadius: 2 }} />
              <Typography variant="caption" sx={{ color: '#555' }}>
                {formatTime(elapsed)} elapsed · up to 2 min
              </Typography>
            </Paper>
          )}

          {status === 'error' && (
            <Paper sx={{ p: 4, ...glassPanelSx }}>
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
            <Grid container spacing={4} sx={{ animation: 'revealUp 0.5s cubic-bezier(0.4,0,0.2,1) both' }}>
              <Grid item xs={12} md={7}>
                <ResultDisplay imageUrl={resultUrl} title="Try-On Result" />
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, height: '100%', ...glassPanelSx }}>
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
                        setGarmentId(null); setGarmentImageUrl(null); setGarmentName(null)
                        setStatus('idle'); setResultUrl(null); setError(null)
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
                        setModelId(null); setModelImageUrl(null); setModelName(null)
                        setGarmentId(null); setGarmentImageUrl(null); setGarmentName(null)
                        setStatus('idle'); setResultUrl(null); setError(null)
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

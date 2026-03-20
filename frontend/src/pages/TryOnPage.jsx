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
  Tabs,
  Tab,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Alert,
  Grid,
  Chip,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import PersonIcon from '@mui/icons-material/Person'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import ImageUploadZone from '../components/ImageUploadZone'
import ResultDisplay from '../components/ResultDisplay'
import { runTryOn } from '../api/fashionApi'

const STEPS = ['Person Photo', 'Garment Photo', 'Result']

const GARMENT_TYPES = [
  { value: 'upper', label: 'Upper Body', desc: 'Tops, shirts, jackets' },
  { value: 'lower', label: 'Lower Body', desc: 'Pants, skirts, shorts' },
  { value: 'overall', label: 'Full Outfit', desc: 'Dresses, full looks' },
]

export default function TryOnPage() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)

  // Step 1
  const [personTab, setPersonTab] = useState(0) // 0=upload, 1=url
  const [personUrl, setPersonUrl] = useState('')
  const [personUrlInput, setPersonUrlInput] = useState('')

  // Step 2
  const [garmentUrl, setGarmentUrl] = useState('')
  const [garmentType, setGarmentType] = useState('upper')

  // Step 3
  const [status, setStatus] = useState('idle') // idle | running | done | error
  const [resultUrl, setResultUrl] = useState(null)
  const [error, setError] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  // Pre-fill from Generate Model page
  useEffect(() => {
    const saved = sessionStorage.getItem('generatedModelUrl')
    if (saved) {
      setPersonUrl(saved)
      setPersonUrlInput(saved)
      setPersonTab(1)
      sessionStorage.removeItem('generatedModelUrl')
    }
  }, [])

  const canGoToStep2 = !!personUrl
  const canRunTryOn = !!personUrl && !!garmentUrl

  const handleNext = () => {
    if (activeStep === 0 && !canGoToStep2) return
    setActiveStep((s) => s + 1)
    if (activeStep === 1) {
      handleRunTryOn()
    }
  }

  const handleBack = () => setActiveStep((s) => s - 1)

  const handleRunTryOn = async () => {
    setError(null)
    setResultUrl(null)
    setStatus('running')
    setElapsed(0)

    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    const { data, error: apiError } = await runTryOn(personUrl, garmentUrl, garmentType)
    clearInterval(timer)

    if (apiError) {
      setStatus('error')
      setError(apiError)
      return
    }
    setResultUrl(data.result_url)
    setStatus('done')
  }

  const handleReset = () => {
    setActiveStep(0)
    setPersonUrl('')
    setPersonUrlInput('')
    setPersonTab(0)
    setGarmentUrl('')
    setGarmentType('upper')
    setResultUrl(null)
    setError(null)
    setStatus('idle')
    setElapsed(0)
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
          Virtual Try-On Studio
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Upload a person photo and garment image. AI will dress the model in the outfit.
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 1: Person Photo */}
      {activeStep === 0 && (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <PersonIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Person Photo
            </Typography>
          </Box>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            Upload a photo of a person, or use a URL from a generated model.
          </Typography>

          <Tabs
            value={personTab}
            onChange={(_, v) => setPersonTab(v)}
            sx={{ mb: 3, borderBottom: '1px solid #1e1e1e' }}
          >
            <Tab label="Upload Photo" />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Use Image URL
                  {personUrl && personTab === 1 && (
                    <Chip
                      label="Ready"
                      size="small"
                      sx={{
                        ml: 0.5,
                        height: 18,
                        fontSize: '0.65rem',
                        backgroundColor: 'rgba(0,230,118,0.15)',
                        color: 'primary.main',
                        border: '1px solid rgba(0,230,118,0.3)',
                      }}
                    />
                  )}
                </Box>
              }
            />
          </Tabs>

          {personTab === 0 && (
            <ImageUploadZone
              label="Upload Person Photo"
              onUploadComplete={(url) => setPersonUrl(url || '')}
            />
          )}

          {personTab === 1 && (
            <Box>
              <TextField
                fullWidth
                label="Person Image URL"
                placeholder="https://example.com/person.jpg"
                value={personUrlInput}
                onChange={(e) => setPersonUrlInput(e.target.value)}
                helperText="Paste a public image URL, or generate a model and click 'Use in Try-On'."
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setPersonUrl(personUrlInput.trim())
                  }}
                  disabled={!personUrlInput.trim()}
                >
                  Confirm URL
                </Button>
                <Button
                  variant="text"
                  sx={{ color: 'text.secondary' }}
                  onClick={() => navigate('/generate-model')}
                  startIcon={<ImageSearchIcon />}
                >
                  Generate a model first
                </Button>
              </Box>
              {personUrl && personTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    component="img"
                    src={personUrl}
                    alt="Person preview"
                    sx={{
                      maxWidth: 200,
                      maxHeight: 200,
                      objectFit: 'contain',
                      borderRadius: 2,
                      border: '1px solid #2a2a2a',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => setActiveStep(1)}
              disabled={!canGoToStep2}
              sx={{ px: 4 }}
            >
              Next: Garment Photo
            </Button>
          </Box>
        </Paper>
      )}

      {/* Step 2: Garment Photo */}
      {activeStep === 1 && (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <CheckroomIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Garment Photo
            </Typography>
          </Box>
          <Typography sx={{ color: 'text.secondary', mb: 4 }}>
            Upload the clothing item you want to try on. AI will remove the background automatically.
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <ImageUploadZone
                label="Upload Garment Image"
                onUploadComplete={(url) => setGarmentUrl(url || '')}
              />
            </Grid>
            <Grid item xs={12} md={5}>
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
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ color: 'text.secondary' }}>
              Back
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
              disabled={!canRunTryOn}
              sx={{ px: 4 }}
            >
              Run Try-On
            </Button>
          </Box>
        </Paper>
      )}

      {/* Step 3: Result */}
      {activeStep === 2 && (
        <Box>
          {status === 'running' && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  border: '3px solid #00e676',
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
              <Alert
                severity="error"
                sx={{ mb: 3, backgroundColor: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.25)' }}
              >
                {error}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={handleRunTryOn}>
                  Retry
                </Button>
                <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ color: 'text.secondary' }}>
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
                    Your AI try-on result is ready. Download it or share the link. Want to try a
                    different garment or person?
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<CheckroomIcon />}
                      onClick={() => {
                        setActiveStep(1)
                        setGarmentUrl('')
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
                        setPersonUrl('')
                        setGarmentUrl('')
                        setPersonUrlInput('')
                        setStatus('idle')
                        setResultUrl(null)
                        setError(null)
                      }}
                    >
                      Change Person Photo
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

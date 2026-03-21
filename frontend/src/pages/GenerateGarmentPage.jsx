import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Chip,
  Grid,
  Tooltip,
} from '@mui/material'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { generateGarment } from '../api/fashionApi'
import ResultDisplay from '../components/ResultDisplay'
import { glassCard, glassPanelSx } from '../theme'

const ASPECT_RATIOS = ['1:1', '2:3', '3:4', '4:3', '3:2', '4:5', '5:4', '9:16']

const PROMPT_EXAMPLES = [
  'Blue denim jacket, front view, flat lay, white background',
  'White linen shirt, folded neatly, product photography',
  'Black slim-fit trousers, full length, studio lighting',
  'Floral summer dress, front view, plain background',
]

export default function GenerateGarmentPage() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [status, setStatus] = useState('idle') // idle | generating | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  const isGenerating = status === 'generating'
  const isDone = status === 'done'

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 3) return
    setError(null)
    setResult(null)
    setStatus('generating')
    setElapsed(0)

    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    const { data, error: apiError } = await generateGarment(prompt.trim(), aspectRatio)
    clearInterval(timer)

    if (apiError) {
      setStatus('error')
      setError(apiError)
      return
    }
    setResult(data)
    setStatus('done')
  }

  const handleUseInTryOn = () => {
    sessionStorage.setItem('generatedGarment', JSON.stringify({ id: result.id, name: result.name, image_url: result.image_url }))
    navigate('/try-on')
  }

  const handleReset = () => {
    setStatus('idle')
    setResult(null)
    setError(null)
    setPrompt('')
    setElapsed(0)
  }

  const loadingLabel =
    elapsed < 20 ? 'Initializing Gemini…' :
    elapsed < 60 ? 'Generating your garment…' :
    elapsed < 100 ? 'Adding finishing details…' :
    'Almost ready…'

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
          Generate Garment Image
        </Typography>
        <Typography sx={{ color: '#888', lineHeight: 1.6, fontSize: '0.95rem' }}>
          Describe a clothing item and get a clean product photo powered by Gemini 2.5 Flash.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left: Input panel */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 4,
              ...glassCard,
              animation: 'fadeInUp 0.5s ease 0.1s both',
            }}
          >
            {/* Prompt */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Prompt
                </Typography>
                <Tooltip title="Describe the garment style, color, cut, and view. More detail = better results." arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Box>
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="e.g. Blue denim jacket, front view, flat lay, plain white background"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                disabled={isGenerating}
                inputProps={{ maxLength: 500 }}
                helperText={`${prompt.length}/500 characters`}
                FormHelperTextProps={{ sx: { textAlign: 'right', mr: 0 } }}
              />
            </Box>

            {/* Example prompts */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
                Quick examples:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {PROMPT_EXAMPLES.map((ex) => (
                  <Chip
                    key={ex}
                    label={ex.length > 40 ? ex.slice(0, 40) + '…' : ex}
                    size="small"
                    onClick={() => setPrompt(ex)}
                    disabled={isGenerating}
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(124,58,237,0.08)',
                        borderColor: 'rgba(124,58,237,0.4)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Aspect ratio */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Aspect Ratio
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ASPECT_RATIOS.map((r) => {
                  const selected = aspectRatio === r
                  return (
                    <Chip
                      key={r}
                      label={r}
                      onClick={() => !isGenerating && setAspectRatio(r)}
                      variant="outlined"
                      disabled={isGenerating}
                      sx={{
                        cursor: 'pointer',
                        background: selected ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : 'transparent',
                        borderColor: selected ? 'transparent' : '#2a2a2a',
                        color: selected ? '#fff' : 'text.secondary',
                        fontWeight: selected ? 700 : 400,
                        boxShadow: selected ? '0 4px 15px rgba(124,58,237,0.4)' : 'none',
                        transform: selected ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                        '&:hover': {
                          borderColor: selected ? 'transparent' : 'rgba(124,58,237,0.5)',
                          backgroundColor: selected ? undefined : 'rgba(124,58,237,0.08)',
                        },
                      }}
                    />
                  )
                })}
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<CheckroomIcon />}
              onClick={handleGenerate}
              disabled={isGenerating || prompt.trim().length < 3}
              sx={{ py: 1.5 }}
            >
              {isGenerating ? `Generating… (${elapsed}s)` : 'Generate Garment Image'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 2, backgroundColor: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.25)' }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right: Result panel */}
        <Grid item xs={12} md={6}>
          {!isDone && !isGenerating && (
            <Paper
              sx={{
                height: '100%',
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                ...glassPanelSx,
                border: '2px dashed rgba(124,58,237,0.12)',
                animation: 'fadeInUp 0.5s ease 0.2s both',
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(91,33,182,0.08))',
                  border: '1px solid rgba(124,58,237,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(124,58,237,0.1)',
                  animation: 'float 4s ease-in-out infinite',
                }}
              >
                <CheckroomIcon sx={{ fontSize: 32, color: 'rgba(124,58,237,0.5)' }} />
              </Box>
              <Typography sx={{ color: '#555', fontWeight: 500 }}>
                Your generated garment will appear here
              </Typography>
            </Paper>
          )}

          {isGenerating && (
            <Paper
              sx={{
                height: '100%',
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                ...glassPanelSx,
                border: '1px solid rgba(124,58,237,0.2)',
                animation: 'fadeInUp 0.3s ease both',
              }}
            >
              {/* Triple concentric ring loader */}
              <Box sx={{ position: 'relative', width: 80, height: 80 }}>
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

              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: '0.95rem',
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
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {elapsed}s elapsed · up to 2 min
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <Box key={i} sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#7C3AED',
                    animation: `pulse-glow 1.2s ease-in-out infinite ${delay}s`,
                  }} />
                ))}
              </Box>
            </Paper>
          )}

          {isDone && result && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                animation: 'revealUp 0.5s cubic-bezier(0.4,0,0.2,1) both',
              }}
            >
              <ResultDisplay imageUrl={result.image_url} title="Generated Garment" />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" fullWidth endIcon={<ArrowForwardIcon />} onClick={handleUseInTryOn}>
                  Use in Try-On
                </Button>
                <Button variant="outlined" fullWidth onClick={handleReset}>
                  Generate Again
                </Button>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

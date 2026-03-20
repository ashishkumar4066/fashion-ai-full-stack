import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Alert,
  Paper,
  Chip,
  Grid,
  Tooltip,
} from '@mui/material'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { generateModel } from '../api/fashionApi'
import ResultDisplay from '../components/ResultDisplay'

const ASPECT_RATIOS = ['2:3', '1:1', '9:16', '16:9', '4:5', '3:4', '3:2', '4:3']

const PROMPT_EXAMPLES = [
  'Young Indian female, casual standing pose, plain white background',
  'Athletic male model, 25 years old, confident pose, studio lighting',
  'East Asian woman, elegant posture, minimal gray background',
  'Curvy female model, smiling, natural outdoor lighting',
]

export default function GenerateModelPage() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('2:3')
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

    const { data, error: apiError } = await generateModel(prompt.trim(), aspectRatio)
    clearInterval(timer)

    if (apiError) {
      setStatus('error')
      setError(apiError)
      return
    }

    setResult(data)
    setStatus('done')
  }

  const handleUseAsModel = () => {
    sessionStorage.setItem('generatedModelUrl', result.image_url)
    navigate('/try-on')
  }

  const handleReset = () => {
    setStatus('idle')
    setResult(null)
    setError(null)
    setPrompt('')
    setElapsed(0)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
          Generate AI Model
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Describe a person and get a photorealistic model image powered by Gemini 2.5 Flash.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left: Input panel */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4 }}>
            {/* Prompt */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Prompt
                </Typography>
                <Tooltip title="Describe gender, age, ethnicity, pose, and background. More detail = better results." arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Box>
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="e.g. Young Indian female, casual standing pose, plain white background"
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
                    sx={{ cursor: 'pointer', fontSize: '0.72rem' }}
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
                {ASPECT_RATIOS.map((r) => (
                  <Chip
                    key={r}
                    label={r}
                    onClick={() => !isGenerating && setAspectRatio(r)}
                    variant="outlined"
                    color={aspectRatio === r ? 'primary' : 'default'}
                    disabled={isGenerating}
                    sx={{
                      cursor: 'pointer',
                      borderColor: aspectRatio === r ? 'primary.main' : '#2a2a2a',
                      color: aspectRatio === r ? 'primary.main' : 'text.secondary',
                      backgroundColor: aspectRatio === r ? 'rgba(0,230,118,0.1)' : 'transparent',
                      fontWeight: aspectRatio === r ? 600 : 400,
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<AutoFixHighIcon />}
              onClick={handleGenerate}
              disabled={isGenerating || prompt.trim().length < 3}
              sx={{ py: 1.5 }}
            >
              {isGenerating ? `Generating… (${elapsed}s)` : 'Generate Model Image'}
            </Button>

            {isGenerating && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress sx={{ borderRadius: 2 }} />
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', mt: 1, display: 'block', textAlign: 'center' }}
                >
                  This can take 30–120 seconds. Please wait.
                </Typography>
              </Box>
            )}

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
                border: '2px dashed #1e1e1e',
                backgroundColor: 'transparent',
              }}
            >
              <AutoFixHighIcon sx={{ fontSize: 48, color: '#2a2a2a' }} />
              <Typography sx={{ color: '#333', fontWeight: 500 }}>
                Your generated image will appear here
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
                border: '2px dashed #2a2a2a',
                backgroundColor: 'transparent',
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: '2px solid #00e676',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                }}
              />
              <Typography sx={{ color: 'text.secondary' }}>Creating your model…</Typography>
            </Paper>
          )}

          {isDone && result && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ResultDisplay imageUrl={result.image_url} title="Generated Model" />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleUseAsModel}
                >
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

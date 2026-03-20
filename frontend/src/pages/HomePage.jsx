import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Container,
  Chip,
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import PersonIcon from '@mui/icons-material/Person'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const features = [
  {
    icon: <PersonIcon sx={{ fontSize: 32, color: '#00e676' }} />,
    title: 'Generate AI Model',
    description:
      'Describe your ideal model in words. Our AI creates a photorealistic person image in seconds — any age, ethnicity, pose, or background.',
    cta: 'Generate Model',
    path: '/generate-model',
  },
  {
    icon: <CheckroomIcon sx={{ fontSize: 32, color: '#00e676' }} />,
    title: 'Virtual Try-On',
    description:
      'Upload a person photo and a garment image. The AI dresses the model in the outfit — upper body, lower body, or full look.',
    cta: 'Try On Now',
    path: '/try-on',
  },
  {
    icon: <FlashOnIcon sx={{ fontSize: 32, color: '#00e676' }} />,
    title: 'Instant Results',
    description:
      'Powered by Kling AI and Gemini 2.5 Flash. Results delivered in under 2 minutes. No manual editing, no studio needed.',
    cta: null,
    path: null,
  },
]

const steps = [
  { num: '01', label: 'Generate or upload a person photo' },
  { num: '02', label: 'Upload your garment image' },
  { num: '03', label: 'Select garment type and run AI try-on' },
  { num: '04', label: 'Download your result instantly' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero */}
      <Box
        sx={{
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,230,118,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#00e676 !important' }} />}
          label="Powered by Kling AI + Gemini 2.5 Flash"
          variant="outlined"
          size="small"
          sx={{
            mb: 4,
            borderColor: '#2a2a2a',
            color: '#9e9e9e',
            fontSize: '0.75rem',
            px: 0.5,
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.8rem', sm: '4rem', md: '5.5rem' },
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            mb: 3,
            maxWidth: 800,
          }}
        >
          AI Fashion.{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #00e676 0%, #69f0ae 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Instantly.
          </Box>
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            maxWidth: 560,
            mb: 5,
            fontWeight: 400,
            lineHeight: 1.6,
            fontSize: { xs: '1rem', md: '1.15rem' },
          }}
        >
          Generate photorealistic model images from text. Visualize any outfit on any model.
          No studio, no photographer, no hassle.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/try-on')}
            sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
          >
            Start Try-On
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/generate-model')}
            sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
          >
            Generate Model
          </Button>
        </Box>

        {/* Stat row */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 3, md: 6 },
            mt: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { value: '< 2 min', label: 'Avg. try-on time' },
            { value: '3 types', label: 'Garment categories' },
            { value: '10+ ratios', label: 'Aspect ratios' },
          ].map((s) => (
            <Box key={s.label} sx={{ textAlign: 'center' }}>
              <Typography
                sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'primary.main' }}
              >
                {s.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          sx={{ textAlign: 'center', mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } }}
        >
          Everything you need
        </Typography>
        <Typography
          sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}
        >
          A complete AI fashion pipeline in your browser.
        </Typography>

        <Grid container spacing={3}>
          {features.map((f) => (
            <Grid item xs={12} md={4} key={f.title}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: '#2a2a2a' },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    backgroundColor: 'rgba(0,230,118,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(0,230,118,0.15)',
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {f.title}
                </Typography>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, flexGrow: 1 }}>
                  {f.description}
                </Typography>
                {f.cta && (
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate(f.path)}
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                  >
                    {f.cta}
                  </Button>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works */}
      <Box sx={{ backgroundColor: '#0d0d0d', py: 10, borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{ textAlign: 'center', mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } }}
          >
            How it works
          </Typography>
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 7 }}>
            Four steps from idea to result.
          </Typography>
          <Grid container spacing={3}>
            {steps.map((s) => (
              <Grid item xs={12} sm={6} key={s.num}>
                <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                  <Typography
                    sx={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: 'rgba(0,230,118,0.25)',
                      lineHeight: 1,
                      minWidth: 48,
                    }}
                  >
                    {s.num}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.6, pt: 0.5 }}>
                    {s.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: 12, textAlign: 'center', px: 3 }}>
        <Typography
          variant="h3"
          sx={{ mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 700 }}
        >
          Ready to try it out?
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 5 }}>
          No account needed. Just upload and go.
        </Typography>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/try-on')}
          sx={{ px: 5, py: 1.5, fontSize: '1rem' }}
        >
          Launch Try-On Studio
        </Button>
      </Box>
    </Box>
  )
}

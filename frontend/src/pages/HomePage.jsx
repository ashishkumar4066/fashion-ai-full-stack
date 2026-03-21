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
    icon: <PersonIcon sx={{ fontSize: 28, color: '#A78BFA' }} />,
    title: 'Generate AI Model',
    description:
      'Describe your ideal model in words. Our AI creates a photorealistic person image in seconds — any age, ethnicity, pose, or background.',
    cta: 'Generate Model',
    path: '/generate-model',
  },
  {
    icon: <CheckroomIcon sx={{ fontSize: 28, color: '#A78BFA' }} />,
    title: 'Virtual Try-On',
    description:
      'Upload a person photo and a garment image. The AI dresses the model in the outfit — upper body, lower body, or full look.',
    cta: 'Try On Now',
    path: '/try-on',
  },
  {
    icon: <FlashOnIcon sx={{ fontSize: 28, color: '#A78BFA' }} />,
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
        {/* Layered animated gradient mesh */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '30%',
              width: 700,
              height: 700,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 65%)',
              animation: 'pulse-glow 6s ease-in-out infinite',
              '@keyframes pulse-glow': {
                '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
                '50%': { opacity: 1, transform: 'scale(1.1)' },
              },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '30%',
              right: '20%',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)',
              animation: 'pulse-glow 8s ease-in-out infinite 2s',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '10%',
              left: '20%',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(91,33,182,0.06) 0%, transparent 70%)',
              animation: 'pulse-glow 7s ease-in-out infinite 1s',
            }}
          />
        </Box>

        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#A78BFA !important' }} />}
          label="Powered by Kling AI + Gemini 2.5 Flash"
          size="small"
          sx={{
            mb: 4,
            backgroundColor: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.3)',
            color: '#A78BFA',
            fontSize: '0.75rem',
            px: 0.5,
            animation: 'fadeInUp 0.6s ease both',
            '@keyframes fadeInUp': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
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
            animation: 'fadeInUp 0.6s ease 0.1s both',
          }}
        >
          AI Fashion.{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 50%, #C4B5FD 100%)',
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
            animation: 'fadeInUp 0.6s ease 0.2s both',
          }}
        >
          Generate photorealistic model images from text. Visualize any outfit on any model.
          No studio, no photographer, no hassle.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
            animation: 'fadeInUp 0.6s ease 0.3s both',
          }}
        >
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
            animation: 'fadeInUp 0.6s ease 0.4s both',
          }}
        >
          {[
            { value: '< 2 min', label: 'Avg. try-on time' },
            { value: '3 types', label: 'Garment categories' },
            { value: '10+ ratios', label: 'Aspect ratios' },
          ].map((s) => (
            <Box key={s.label} sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
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
        <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
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
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  '&:hover': {
                    border: '1px solid rgba(124,58,237,0.4)',
                    transform: 'translateY(-6px)',
                    boxShadow: '0 20px 60px rgba(124,58,237,0.2)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(91,33,182,0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(124,58,237,0.25)',
                    boxShadow: '0 0 20px rgba(124,58,237,0.1)',
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
      <Box
        sx={{
          py: 10,
          borderTop: '1px solid rgba(124,58,237,0.1)',
          borderBottom: '1px solid rgba(124,58,237,0.1)',
          background: 'linear-gradient(180deg, rgba(124,58,237,0.03) 0%, transparent 50%, rgba(124,58,237,0.03) 100%)',
        }}
      >
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
                  <Box
                    sx={{
                      minWidth: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(91,33,182,0.1))',
                      border: '1px solid rgba(124,58,237,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {s.num}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.6, pt: 1.2 }}>
                    {s.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box
        sx={{
          py: 12,
          textAlign: 'center',
          px: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
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

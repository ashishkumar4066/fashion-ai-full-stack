import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Alert,
  Grid,
  Container,
  IconButton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import SaveIcon from '@mui/icons-material/Save'
import { glassCard } from '../theme'

function getInitials(firstName, lastName) {
  const f = firstName?.trim()[0] ?? ''
  const l = lastName?.trim()[0] ?? ''
  return (f + l).toUpperCase() || '?'
}

const JOINED = 'Mar 2026'

export default function ProfilePage() {
  const navigate = useNavigate()
  const photoInputRef = useRef(null)

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem('userProfile')
      return saved ? JSON.parse(saved) : { firstName: 'John', lastName: 'Doe', email: 'john@example.com', mobile: '' }
    } catch {
      return { firstName: 'John', lastName: 'Doe', email: 'john@example.com', mobile: '' }
    }
  })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saved, setSaved] = useState(false)

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (file) setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim()

  return (
    <Box sx={{ minHeight: '100vh', pt: 2, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 5,
            animation: 'fadeInUp 0.5s ease both',
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: '#A78BFA',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.6rem', md: '2rem' },
                background: 'linear-gradient(135deg, #DDD6FE 0%, #A78BFA 60%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.2,
              }}
            >
              Profile
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
              Manage your personal information
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Left — Identity Card */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                ...glassCard,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                animation: 'fadeInUp 0.5s ease 0.1s both',
                position: 'relative',
              }}
            >
              {/* Avatar + change photo */}
              <Box sx={{ position: 'relative', mb: 2.5 }}>
                <Avatar
                  src={photoPreview || undefined}
                  sx={{
                    width: 96,
                    height: 96,
                    fontSize: '2rem',
                    fontWeight: 700,
                    background: photoPreview
                      ? 'transparent'
                      : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                    boxShadow: '0 0 32px rgba(124,58,237,0.4)',
                    border: '3px solid rgba(124,58,237,0.4)',
                  }}
                >
                  {!photoPreview && getInitials(form.firstName, form.lastName)}
                </Avatar>

                {/* Camera overlay button */}
                <Box
                  onClick={() => photoInputRef.current?.click()}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                    border: '2px solid rgba(10,10,10,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'scale(1.1)', boxShadow: '0 0 12px rgba(124,58,237,0.6)' },
                  }}
                >
                  <CameraAltIcon sx={{ fontSize: 14, color: '#fff' }} />
                </Box>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhoto}
                />
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => photoInputRef.current?.click()}
                sx={{ mb: 3, fontSize: '0.75rem' }}
              >
                Change Photo
              </Button>

              <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', mb: 0.5 }}>
                {fullName || 'Your Name'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, wordBreak: 'break-all' }}>
                {form.email || '—'}
              </Typography>

              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 5,
                  backgroundColor: 'rgba(124,58,237,0.1)',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#A78BFA', fontSize: '0.7rem', fontWeight: 600 }}>
                  Member since {JOINED}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Right — Edit Form */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 4,
                ...glassCard,
                animation: 'fadeInUp 0.5s ease 0.2s both',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#DDD6FE' }}>
                Personal Information
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    value={form.firstName}
                    onChange={handleChange('firstName')}
                    placeholder="Enter first name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={form.lastName}
                    onChange={handleChange('lastName')}
                    placeholder="Enter last name"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    fullWidth
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="Enter email address"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Mobile Number"
                    fullWidth
                    type="tel"
                    value={form.mobile}
                    onChange={handleChange('mobile')}
                    placeholder="Enter mobile number"
                  />
                </Grid>
              </Grid>

              {saved && (
                <Box sx={{ mt: 3, animation: 'revealUp 0.3s ease both' }}>
                  <Alert
                    severity="success"
                    sx={{
                      backgroundColor: 'rgba(46,125,50,0.1)',
                      border: '1px solid rgba(46,125,50,0.3)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    Changes saved successfully!
                  </Alert>
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ mt: 3, py: 1.4, fontSize: '0.95rem', fontWeight: 600 }}
              >
                Save Changes
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

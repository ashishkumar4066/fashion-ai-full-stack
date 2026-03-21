import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloseIcon from '@mui/icons-material/Close'

const USER_NAME = 'John Doe' // replace with real auth user name when available

function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}

const ProfileAvatar = ({ size = 32 }) => (
  <Avatar
    sx={{
      width: size,
      height: size,
      fontSize: size * 0.38,
      fontWeight: 700,
      background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
      boxShadow: '0 0 12px rgba(124,58,237,0.4)',
      border: '1px solid rgba(124,58,237,0.4)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 0 20px rgba(124,58,237,0.6)',
        border: '1px solid rgba(124,58,237,0.7)',
      },
    }}
  >
    {getInitials(USER_NAME)}
  </Avatar>
)

const navLinks = [
  { label: 'Home', path: '/' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <>
      <AppBar position="fixed">
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexGrow: 1 }}
            onClick={() => navigate('/')}
          >
            <AutoAwesomeIcon
              sx={{
                color: '#A78BFA',
                fontSize: 22,
                filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.6))',
                animation: 'glowPulse 3s ease-in-out infinite',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.5px',
                fontSize: '1.2rem',
                background: 'linear-gradient(90deg, #7C3AED 0%, #A78BFA 30%, #DDD6FE 50%, #A78BFA 70%, #7C3AED 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmerText 4s linear infinite',
              }}
            >
              FashionAI
            </Typography>
          </Box>

          {isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box onClick={() => navigate('/profile')}>
                <ProfileAvatar />
              </Box>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  color: 'text.primary',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.3)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {navLinks.map((link) => {
                const active = isActive(link.path)
                return (
                  <Button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    sx={{
                      position: 'relative',
                      color: active ? '#DDD6FE' : 'rgba(255,255,255,0.5)',
                      fontWeight: active ? 600 : 400,
                      fontSize: '0.875rem',
                      letterSpacing: '0.1px',
                      px: 1.5,
                      transition: 'color 0.25s ease',
                      '&:hover': {
                        color: '#DDD6FE',
                        backgroundColor: 'transparent',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: active ? '60%' : '0%',
                        height: '2px',
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #7C3AED, #A78BFA, #DDD6FE, #A78BFA, #7C3AED)',
                        backgroundSize: '200% 100%',
                        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
                        animation: active ? 'gradientBorderSweep 2s linear infinite' : 'none',
                      },
                      '&:hover::after': {
                        width: '60%',
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                )
              })}

              {/* Profile */}
              <Box
                onClick={() => navigate('/profile')}
                sx={{ ml: 1, display: 'flex', alignItems: 'center' }}
              >
                <ProfileAvatar />
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: 'rgba(10,10,10,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
          },
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: '#A78BFA', fontSize: 20 }} />
            <Typography
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(90deg, #7C3AED, #A78BFA, #DDD6FE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              FashionAI
            </Typography>
          </Box>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{
              color: 'text.secondary',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 2,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ pt: 1, px: 1 }}>
          {[...navLinks, { label: 'Profile', path: '/profile' }].map((link) => {
            const active = isActive(link.path)
            return (
              <ListItem key={link.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(link.path)
                    setDrawerOpen(false)
                  }}
                  sx={{
                    borderRadius: 2,
                    color: active ? '#DDD6FE' : 'rgba(255,255,255,0.5)',
                    backgroundColor: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                    border: active ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                    backdropFilter: active ? 'blur(8px)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(124,58,237,0.08)',
                      border: '1px solid rgba(124,58,237,0.15)',
                      color: '#DDD6FE',
                    },
                  }}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{ fontWeight: active ? 600 : 400, fontSize: '0.9rem' }}
                  />
                  {active && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#7C3AED',
                        boxShadow: '0 0 8px rgba(124,58,237,0.8)',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Drawer>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
    </>
  )
}

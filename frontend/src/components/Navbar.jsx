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
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloseIcon from '@mui/icons-material/Close'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Generate Model', path: '/generate-model' },
  { label: 'Generate Garment', path: '/generate-garment' },
  { label: 'Try On', path: '/try-on' },
  { label: 'Gallery', path: '/gallery' },
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
            <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                fontSize: '1.2rem',
              }}
            >
              FashionAI
            </Typography>
          </Box>

          {isMobile ? (
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'text.primary' }}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: isActive(link.path) ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive(link.path) ? 600 : 400,
                    position: 'relative',
                    '&::after': isActive(link.path)
                      ? {
                          content: '""',
                          position: 'absolute',
                          bottom: 4,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                        }
                      : {},
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 260, backgroundColor: '#0f0f0f', borderLeft: '1px solid #1e1e1e' },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography sx={{ color: 'primary.main', fontWeight: 800 }}>FashionAI</Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ pt: 1 }}>
          {navLinks.map((link) => (
            <ListItem key={link.path} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(link.path)
                  setDrawerOpen(false)
                }}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  color: isActive(link.path) ? 'primary.main' : 'text.secondary',
                  backgroundColor: isActive(link.path) ? 'rgba(0,230,118,0.08)' : 'transparent',
                }}
              >
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontWeight: isActive(link.path) ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
    </>
  )
}

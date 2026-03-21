import { createTheme } from '@mui/material/styles'

// ── Glass utility objects — spread into sx props ─────────────────────────────
export const glassCard = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
}

export const glassPanelSx = {
  backgroundColor: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)',
}

export const glassCardHover = {
  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  willChange: 'transform, box-shadow',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(124,58,237,0.3)',
    boxShadow: '0 0 0 1px rgba(124,58,237,0.1), 0 20px 60px rgba(124,58,237,0.2)',
    transform: 'translateY(-6px)',
  },
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C3AED',
      dark: '#5B21B6',
      light: '#A78BFA',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0a0a',
      paper: '#111111',
    },
    text: {
      primary: '#ffffff',
      secondary: '#9e9e9e',
    },
    divider: '#2a2a2a',
    error: {
      main: '#f44336',
    },
    success: {
      main: '#7C3AED',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-2px' },
    h2: { fontWeight: 700, letterSpacing: '-1px' },
    h3: { fontWeight: 700, letterSpacing: '-0.5px' },
    h4: { fontWeight: 600, letterSpacing: '-0.3px' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.2px' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@keyframes fadeInUp': {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        '@keyframes pulse-glow': {
          '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.08)' },
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(1deg)' },
          '66%': { transform: 'translateY(-10px) rotate(-1deg)' },
        },
        '@keyframes morphGradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        '@keyframes slideInRight': {
          from: { opacity: 0, transform: 'translateX(32px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        '@keyframes scaleIn': {
          from: { opacity: 0, transform: 'scale(0.7)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        '@keyframes glowPulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,58,237,0.3), 0 0 40px rgba(124,58,237,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(124,58,237,0.2)' },
        },
        '@keyframes borderRotate': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        '@keyframes revealUp': {
          from: { opacity: 0, transform: 'translateY(16px) scale(0.98)', filter: 'blur(4px)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' },
        },
        '@keyframes shimmerText': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        '@keyframes countUp': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes gradientBorderSweep': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
        '@keyframes particleBurst': {
          '0%': { opacity: 1, transform: 'translate(-50%, -50%) scale(0)' },
          '60%': { opacity: 0.8 },
          '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(1)' },
        },
        body: {
          backgroundColor: '#0a0a0a',
          scrollbarWidth: 'thin',
          scrollbarColor: '#2a2a2a #0a0a0a',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: '#0a0a0a' },
          '&::-webkit-scrollbar-thumb': { background: '#2a2a2a', borderRadius: 3 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform, box-shadow',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)',
            boxShadow: '0 8px 28px rgba(124,58,237,0.5)',
            transform: 'translateY(-2px)',
          },
          '&:disabled': {
            background: '#2a2a2a',
            boxShadow: 'none',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(124,58,237,0.5)',
          color: '#A78BFA',
          '&:hover': {
            borderColor: '#7C3AED',
            backgroundColor: 'rgba(124,58,237,0.08)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 16px rgba(124,58,237,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111111',
          border: '1px solid #1e1e1e',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease, background-color 0.3s ease',
          willChange: 'transform',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'box-shadow 0.25s ease',
            '& fieldset': { borderColor: '#2a2a2a' },
            '&:hover fieldset': { borderColor: '#444444' },
            '&.Mui-focused fieldset': { borderColor: '#7C3AED' },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(124,58,237,0.15), 0 0 20px rgba(124,58,237,0.08)',
              borderRadius: '12px',
              animation: 'glowPulse 2.5s ease-in-out infinite',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#7C3AED' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        },
        outlinedPrimary: {
          borderColor: '#2a2a2a',
          color: '#9e9e9e',
          '&.MuiChip-clickable:hover': {
            borderColor: '#7C3AED',
            color: '#A78BFA',
            backgroundColor: 'rgba(124,58,237,0.08)',
          },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          color: '#9e9e9e',
          '&.Mui-active': { color: '#A78BFA' },
          '&.Mui-completed': { color: '#7C3AED' },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: '#2a2a2a',
          transition: 'all 0.3s ease',
          '&.Mui-active': {
            color: '#7C3AED',
            filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.7))',
          },
          '&.Mui-completed': { color: '#5B21B6' },
        },
        text: { fill: '#ffffff' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: '#1e1e1e', borderRadius: 4 },
        bar: {
          background: 'linear-gradient(90deg, #7C3AED, #A78BFA, #DDD6FE, #A78BFA, #7C3AED)',
          backgroundSize: '200% 100%',
          borderRadius: 4,
          animation: 'morphGradient 2s linear infinite',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#1e1e1e' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          transition: 'color 0.2s ease',
          '&.Mui-selected': { color: '#A78BFA', fontWeight: 600 },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
          borderRadius: 2,
          height: 3,
          boxShadow: '0 0 12px rgba(124,58,237,0.6)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: '#2a2a2a',
          color: '#9e9e9e',
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(91,33,182,0.1))',
            borderColor: '#7C3AED',
            color: '#A78BFA',
            boxShadow: 'inset 0 0 12px rgba(124,58,237,0.1)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(91,33,182,0.15))',
            },
          },
          '&:hover': {
            borderColor: '#444444',
            backgroundColor: 'rgba(255,255,255,0.03)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1e1e1e',
          border: '1px solid #2a2a2a',
          fontSize: '0.75rem',
          backdropFilter: 'blur(8px)',
        },
      },
    },
  },
})

export default theme

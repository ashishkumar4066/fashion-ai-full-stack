import { createTheme } from '@mui/material/styles'

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
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
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
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)',
            boxShadow: '0 6px 24px rgba(124,58,237,0.5)',
            transform: 'translateY(-1px)',
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
          transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'box-shadow 0.2s ease',
            '& fieldset': { borderColor: '#2a2a2a' },
            '&:hover fieldset': { borderColor: '#444444' },
            '&.Mui-focused fieldset': { borderColor: '#7C3AED' },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(124,58,237,0.15)',
              borderRadius: '12px',
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
          transition: 'all 0.15s ease',
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
          transition: 'all 0.2s ease',
          '&.Mui-active': {
            color: '#7C3AED',
            filter: 'drop-shadow(0 0 6px rgba(124,58,237,0.6))',
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
          background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
          borderRadius: 4,
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
          '&.Mui-selected': { color: '#A78BFA' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
          borderRadius: 2,
          height: 3,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(124,58,237,0.15)',
          boxShadow: '0 1px 40px rgba(0,0,0,0.4)',
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
          transition: 'all 0.15s ease',
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
          transition: 'all 0.15s ease',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1e1e1e',
          border: '1px solid #2a2a2a',
          fontSize: '0.75rem',
        },
      },
    },
  },
})

export default theme

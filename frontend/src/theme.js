import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e676',
      dark: '#00c853',
      light: '#69f0ae',
      contrastText: '#000000',
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
      main: '#00e676',
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
        },
        containedPrimary: {
          backgroundColor: '#00e676',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#00c853',
          },
        },
        outlinedPrimary: {
          borderColor: '#00e676',
          color: '#00e676',
          '&:hover': {
            borderColor: '#00c853',
            backgroundColor: 'rgba(0, 230, 118, 0.08)',
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
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#2a2a2a' },
            '&:hover fieldset': { borderColor: '#444444' },
            '&.Mui-focused fieldset': { borderColor: '#00e676' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#00e676' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        outlinedPrimary: {
          borderColor: '#2a2a2a',
          color: '#9e9e9e',
          '&.MuiChip-clickable:hover': {
            borderColor: '#00e676',
            color: '#00e676',
            backgroundColor: 'rgba(0, 230, 118, 0.08)',
          },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          color: '#9e9e9e',
          '&.Mui-active': { color: '#00e676' },
          '&.Mui-completed': { color: '#00e676' },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: '#2a2a2a',
          '&.Mui-active': { color: '#00e676' },
          '&.Mui-completed': { color: '#00e676' },
        },
        text: { fill: '#000000' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: '#1e1e1e', borderRadius: 4 },
        bar: { backgroundColor: '#00e676', borderRadius: 4 },
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
          '&.Mui-selected': { color: '#00e676' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#00e676' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1e1e1e',
          boxShadow: 'none',
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
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 230, 118, 0.12)',
            borderColor: '#00e676',
            color: '#00e676',
            '&:hover': {
              backgroundColor: 'rgba(0, 230, 118, 0.2)',
            },
          },
          '&:hover': {
            borderColor: '#444444',
          },
        },
      },
    },
  },
})

export default theme

import { useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { glassPanelSx } from '../theme'

export default function ProjectBanner({ projectId, project, currentStepLabel }) {
  const navigate = useNavigate()

  if (!projectId || !project) return null

  return (
    <Box
      sx={{
        ...glassPanelSx,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 0.9,
        mb: 3,
        borderRadius: 2,
        borderLeft: '3px solid rgba(124,58,237,0.5)',
        animation: 'fadeInUp 0.3s ease both',
        overflow: 'hidden',
      }}
    >
      {/* Back arrow */}
      <Box
        onClick={() => navigate('/projects')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          color: 'text.secondary',
          flexShrink: 0,
          transition: 'color 0.2s ease',
          '&:hover': { color: '#A78BFA' },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 13 }} />
        <Typography variant="caption" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
          My Projects
        </Typography>
      </Box>

      {/* Separator */}
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0 }}>/</Typography>

      {/* Folder icon */}
      <FolderOpenIcon sx={{ fontSize: 13, color: '#A78BFA', flexShrink: 0 }} />

      {/* Project name — truncates if too long */}
      <Typography
        variant="caption"
        sx={{
          color: '#A78BFA',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 260,
        }}
      >
        {project.displayName}
      </Typography>

      {/* Separator + current step — right next to project name */}
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0 }}>/</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
        {currentStepLabel}
      </Typography>
    </Box>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Chip,
  Button,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { glassCard } from '../theme'
import {
  getProjects,
  deleteProject,
  setActiveProject,
  getActiveProjectId,
} from '../utils/projectStore'
import CreateProjectModal from '../components/CreateProjectModal'

const cardSx = {
  p: 3,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  willChange: 'transform',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 0 0 1px rgba(124,58,237,0.5), 0 20px 60px rgba(124,58,237,0.2)',
    borderColor: 'rgba(124,58,237,0.4)',
  },
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function totalAssets(project) {
  const a = project.assets
  return a.modelIds.length + a.garmentIds.length + a.tryonIds.length + a.videoIds.length
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const refresh = () => {
    setProjects(getProjects())
    setActiveId(getActiveProjectId())
  }

  useEffect(() => { refresh() }, [])

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (window.confirm('Delete this project? Your generated assets will still be in the Gallery.')) {
      deleteProject(id)
      refresh()
    }
  }

  const handleSetActive = (e, id) => {
    e.stopPropagation()
    setActiveProject(id)
    setActiveId(id)
  }

  return (
    <Box sx={{ minHeight: '100vh', pt: 2, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 5,
            flexWrap: 'wrap',
            gap: 2,
            animation: 'fadeInUp 0.5s ease both',
          }}
        >
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
              }}
            >
              My Projects
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
              Organise your generated assets into projects
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            sx={{ px: 3 }}
          >
            New Project
          </Button>
        </Box>

        {/* Empty state */}
        {projects.length === 0 ? (
          <Box
            sx={{
              ...glassCard,
              borderRadius: 3,
              p: 8,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              animation: 'fadeInUp 0.5s ease 0.1s both',
            }}
          >
            <FolderOpenIcon
              sx={{
                fontSize: 56,
                color: 'rgba(124,58,237,0.3)',
                animation: 'float 4s ease-in-out infinite',
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
              No projects yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
              Create a project to organise your models, garments, try-ons and videos in one place.
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setModalOpen(true)} sx={{ mt: 1 }}>
              Create your first project
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project, i) => {
              const isActive = project.id === activeId
              return (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Paper
                    sx={{
                      ...glassCard,
                      ...cardSx,
                      animation: `fadeInUp 0.5s ease ${i * 0.07}s both`,
                      position: 'relative',
                      ...(isActive && {
                        border: '1px solid rgba(124,58,237,0.4)',
                        boxShadow: '0 0 0 1px rgba(124,58,237,0.2), 0 8px 32px rgba(124,58,237,0.15)',
                      }),
                    }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    {/* Active badge */}
                    {isActive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.4,
                          backgroundColor: 'rgba(46,125,50,0.15)',
                          border: '1px solid rgba(46,125,50,0.35)',
                          borderRadius: 5,
                          px: 1,
                          py: 0.3,
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 11, color: '#66bb6a' }} />
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#66bb6a' }}>
                          Active
                        </Typography>
                      </Box>
                    )}

                    {/* Icon */}
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(91,33,182,0.1))',
                        border: '1px solid rgba(124,58,237,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <FolderOpenIcon sx={{ fontSize: 22, color: '#A78BFA' }} />
                    </Box>

                    {/* Name + date */}
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: '#fff',
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        pr: isActive ? 5 : 0,
                      }}
                    >
                      {project.displayName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2 }}>
                      Created {formatDate(project.createdAt)}
                    </Typography>

                    {/* Asset chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 'auto', mt: 1 }}>
                      {[
                        { label: 'Models', count: project.assets.modelIds.length },
                        { label: 'Garments', count: project.assets.garmentIds.length },
                        { label: 'Try-Ons', count: project.assets.tryonIds.length },
                        { label: 'Videos', count: project.assets.videoIds.length },
                      ].map((s) => (
                        <Chip
                          key={s.label}
                          label={`${s.count} ${s.label}`}
                          size="small"
                          sx={{
                            fontSize: '0.68rem',
                            backgroundColor: 'rgba(124,58,237,0.08)',
                            border: '1px solid rgba(124,58,237,0.18)',
                            color: 'rgba(255,255,255,0.55)',
                          }}
                        />
                      ))}
                    </Box>

                    {/* Actions */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        mt: 2.5,
                        pt: 2,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!isActive && (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ flex: 1, fontSize: '0.75rem' }}
                          onClick={(e) => handleSetActive(e, project.id)}
                        >
                          Set Active
                        </Button>
                      )}
                      {isActive && (
                        <Typography
                          variant="caption"
                          sx={{ flex: 1, color: 'rgba(255,255,255,0.3)', alignSelf: 'center', fontSize: '0.7rem' }}
                        >
                          Currently active
                        </Typography>
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => handleDelete(e, project.id)}
                        sx={{
                          color: 'rgba(255,255,255,0.25)',
                          '&:hover': { color: '#f44336', backgroundColor: 'rgba(244,67,54,0.08)' },
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Container>

      <CreateProjectModal open={modalOpen} onClose={() => { setModalOpen(false); refresh() }} />
    </Box>
  )
}

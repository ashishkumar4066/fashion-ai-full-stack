import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Typography, Tooltip, Collapse } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import PersonIcon from '@mui/icons-material/Person'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import StyleIcon from '@mui/icons-material/Style'
import VideocamIcon from '@mui/icons-material/Videocam'
import GridViewIcon from '@mui/icons-material/GridView'
import CollectionsIcon from '@mui/icons-material/Collections'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import CreateProjectModal from './CreateProjectModal'
import { getActiveProject } from '../utils/projectStore'

const COLLAPSED_WIDTH = 64
const EXPANDED_WIDTH = 240

const playgroundItems = [
  { label: 'Generate Model', icon: <PersonIcon fontSize="small" />, path: '/generate-model' },
  { label: 'Generate Garment', icon: <CheckroomIcon fontSize="small" />, path: '/generate-garment' },
  { label: 'Virtual Try-On', icon: <StyleIcon fontSize="small" />, path: '/try-on' },
  { label: 'Video', icon: <VideocamIcon fontSize="small" />, path: '/video' },
  { label: 'Gallery', icon: <GridViewIcon fontSize="small" />, path: '/gallery' },
]

// ── NavItem ────────────────────────────────────────────────────────────────────
function NavItem({ item, isOpen, onClick }) {
  const location = useLocation()
  const navigate = useNavigate()
  const effectivePath = item.effectivePath ?? item.path
  const isActive = effectivePath ? location.pathname === effectivePath : false

  const handleClick = () => {
    if (onClick) onClick()
    else if (effectivePath) navigate(effectivePath)
  }

  const content = (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: isOpen ? 2 : 0,
        py: 1,
        mx: isOpen ? 1 : 0,
        borderRadius: isOpen ? 1.5 : 0,
        justifyContent: isOpen ? 'flex-start' : 'center',
        cursor: 'pointer',
        backgroundColor: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
        borderLeft: isOpen ? (isActive ? '3px solid #7C3AED' : '3px solid transparent') : 'none',
        color: isActive ? '#A78BFA' : 'rgba(255,255,255,0.45)',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        '&:hover': {
          backgroundColor: isActive ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.08)',
          color: isActive ? '#A78BFA' : 'rgba(255,255,255,0.75)',
        },
      }}
    >
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: 'inherit' }}>
        {item.icon}
      </Box>
      {isOpen && (
        <Typography variant="body2" sx={{
          color: 'inherit', fontWeight: isActive ? 600 : 400,
          fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.label}
        </Typography>
      )}
    </Box>
  )

  if (!isOpen) {
    return (
      <Tooltip title={item.label} placement="right" arrow>
        {content}
      </Tooltip>
    )
  }

  return content
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
function SectionHeader({ icon, label, isOpen, expanded, onToggle }) {
  if (!isOpen) {
    return (
      <Tooltip title={label} placement="right" arrow>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1.2, color: 'rgba(255,255,255,0.3)' }}>
          {icon}
        </Box>
      </Tooltip>
    )
  }

  return (
    <Box onClick={onToggle} sx={{
      display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1,
      cursor: 'pointer', color: 'rgba(255,255,255,0.35)',
      '&:hover': { color: 'rgba(255,255,255,0.6)' },
      transition: 'color 0.2s ease', userSelect: 'none',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</Box>
      <Typography variant="caption" sx={{
        fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'inherit', flexGrow: 1,
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        {label}
      </Typography>
      <ExpandMoreIcon sx={{
        fontSize: 16, color: 'inherit',
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease', flexShrink: 0,
      }} />
    </Box>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [playgroundOpen, setPlaygroundOpen] = useState(true)
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [activeProject, setActiveProject] = useState(null)

  // Detect if we're inside a project-scoped route
  const projectMatch = location.pathname.match(/^\/projects\/([^/]+)\//)
  const contextProjectId = projectMatch ? projectMatch[1] : null

  // Build effective playground items with project-prefixed paths when in project context
  const effectivePlaygroundItems = playgroundItems.map((item) => ({
    ...item,
    effectivePath: contextProjectId
      ? `/projects/${contextProjectId}${item.path}`
      : item.path,
  }))

  // Refresh active project whenever sidebar opens or modal closes
  const refreshActive = () => getActiveProject().then(setActiveProject)

  useEffect(() => { refreshActive() }, [])

  const handleOpenCreate = () => setCreateModalOpen(true)
  const handleCloseCreate = () => { setCreateModalOpen(false); refreshActive() }

  const myProjectsItems = [
    { label: 'Create New Project', icon: <AddCircleOutlineIcon fontSize="small" />, path: null },
    { label: 'My Projects', icon: <FolderOpenIcon fontSize="small" />, path: '/projects' },
  ]

  return (
    <>
      <Box
        onMouseEnter={() => { setIsOpen(true); refreshActive() }}
        onMouseLeave={() => setIsOpen(false)}
        sx={{
          position: 'fixed',
          left: 0,
          top: '64px',
          height: 'calc(100vh - 64px)',
          width: isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          backgroundColor: 'rgba(10,10,10,0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: isOpen ? '4px 0 32px rgba(0,0,0,0.5)' : '2px 0 16px rgba(0,0,0,0.3)',
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pt: 1.5,
          pb: 2,
        }}
      >
        {/* PlayGround Section */}
        <SectionHeader
          icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
          label="PlayGround"
          isOpen={isOpen}
          expanded={playgroundOpen}
          onToggle={() => setPlaygroundOpen((v) => !v)}
        />

        {isOpen ? (
          <Collapse in={playgroundOpen}>
            <Box sx={{ mb: 1 }}>
              {effectivePlaygroundItems.map((item) => (
                <NavItem key={item.path} item={item} isOpen={isOpen} />
              ))}
            </Box>
          </Collapse>
        ) : (
          <Box sx={{ mb: 1 }}>
            {playgroundItems.map((item) => (
              <NavItem key={item.path} item={item} isOpen={isOpen} />
            ))}
          </Box>
        )}

        {/* Divider */}
        <Box sx={{
          height: '1px', backgroundColor: 'rgba(255,255,255,0.05)',
          mx: isOpen ? 2 : 1, my: 1, transition: 'margin 0.3s ease',
        }} />

        {/* My Projects Section */}
        <SectionHeader
          icon={<CollectionsIcon sx={{ fontSize: 16 }} />}
          label="My Projects"
          isOpen={isOpen}
          expanded={projectsOpen}
          onToggle={() => setProjectsOpen((v) => !v)}
        />

        {/* Active project indicator */}
        {isOpen && activeProject && (
          <Box sx={{
            mx: 2, mb: 0.5, px: 1.5, py: 0.6, borderRadius: 1.5,
            backgroundColor: 'rgba(46,125,50,0.08)',
            border: '1px solid rgba(46,125,50,0.2)',
            display: 'flex', alignItems: 'center', gap: 0.75, overflow: 'hidden',
          }}>
            <FiberManualRecordIcon sx={{ fontSize: 8, color: '#66bb6a', flexShrink: 0 }} />
            <Typography sx={{
              fontSize: '0.68rem', color: '#66bb6a', fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {activeProject.displayName}
            </Typography>
          </Box>
        )}

        {isOpen ? (
          <Collapse in={projectsOpen}>
            <Box>
              {myProjectsItems.map((item) => (
                <NavItem
                  key={item.label}
                  item={item}
                  isOpen={isOpen}
                  onClick={item.path ? undefined : handleOpenCreate}
                />
              ))}
            </Box>
          </Collapse>
        ) : (
          <Box>
            {myProjectsItems.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                isOpen={isOpen}
                onClick={item.path ? undefined : handleOpenCreate}
              />
            ))}
          </Box>
        )}
      </Box>

      <CreateProjectModal open={createModalOpen} onClose={handleCloseCreate} />
    </>
  )
}

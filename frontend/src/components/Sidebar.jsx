import { useState } from 'react'
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const COLLAPSED_WIDTH = 64
const EXPANDED_WIDTH = 240

const playgroundItems = [
  { label: 'Generate Model', icon: <PersonIcon fontSize="small" />, path: '/generate-model' },
  { label: 'Generate Garment', icon: <CheckroomIcon fontSize="small" />, path: '/generate-garment' },
  { label: 'Virtual Try-On', icon: <StyleIcon fontSize="small" />, path: '/try-on' },
  { label: 'Video', icon: <VideocamIcon fontSize="small" />, path: '/video' },
  { label: 'Gallery', icon: <GridViewIcon fontSize="small" />, path: '/gallery' },
]

const projectItems = [
  { label: 'Create New Project', icon: <AddCircleOutlineIcon fontSize="small" />, path: '/projects/new' },
]

function NavItem({ item, isOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = location.pathname === item.path

  const content = (
    <Box
      onClick={() => navigate(item.path)}
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
        <Typography
          variant="body2"
          sx={{
            color: 'inherit',
            fontWeight: isActive ? 600 : 400,
            fontSize: '0.82rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
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

function SectionHeader({ icon, label, isOpen, expanded, onToggle }) {
  if (!isOpen) {
    return (
      <Tooltip title={label} placement="right" arrow>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 1.2,
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          {icon}
        </Box>
      </Tooltip>
    )
  }

  return (
    <Box
      onClick={onToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        cursor: 'pointer',
        color: 'rgba(255,255,255,0.35)',
        '&:hover': { color: 'rgba(255,255,255,0.6)' },
        transition: 'color 0.2s ease',
        userSelect: 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          fontSize: '0.7rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'inherit',
          flexGrow: 1,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
      <ExpandMoreIcon
        sx={{
          fontSize: 16,
          color: 'inherit',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          flexShrink: 0,
        }}
      />
    </Box>
  )
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [playgroundOpen, setPlaygroundOpen] = useState(true)
  const [projectsOpen, setProjectsOpen] = useState(true)

  return (
    <Box
      onMouseEnter={() => setIsOpen(true)}
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
            {playgroundItems.map((item) => (
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
      <Box
        sx={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          mx: isOpen ? 2 : 1,
          my: 1,
          transition: 'margin 0.3s ease',
        }}
      />

      {/* My Projects Section */}
      <SectionHeader
        icon={<CollectionsIcon sx={{ fontSize: 16 }} />}
        label="My Projects"
        isOpen={isOpen}
        expanded={projectsOpen}
        onToggle={() => setProjectsOpen((v) => !v)}
      />

      {isOpen ? (
        <Collapse in={projectsOpen}>
          <Box>
            {projectItems.map((item) => (
              <NavItem key={item.path} item={item} isOpen={isOpen} />
            ))}
          </Box>
        </Collapse>
      ) : (
        <Box>
          {projectItems.map((item) => (
            <NavItem key={item.path} item={item} isOpen={isOpen} />
          ))}
        </Box>
      )}
    </Box>
  )
}

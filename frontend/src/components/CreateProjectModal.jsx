import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import { createProject } from '../utils/projectStore'

function pad(n) { return String(n).padStart(2, '0') }
function todayStr() {
  const d = new Date()
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export default function CreateProjectModal({ open, onClose }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')

  const preview = name.trim() ? `${name.trim()}-${todayStr()}` : `Untitled-${todayStr()}`

  const handleCreate = async () => {
    const project = await createProject(name)
    if (!project) return
    setName('')
    onClose()
    navigate(`/projects/${project.id}`)
  }

  const handleClose = () => {
    setName('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(91,33,182,0.15))',
              border: '1px solid rgba(124,58,237,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FolderIcon sx={{ fontSize: 18, color: '#A78BFA' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            New Project
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        <TextField
          autoFocus
          fullWidth
          label="Project name"
          placeholder="e.g. Spring Collection"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          helperText={
            <Typography component="span" variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
              Will be saved as:{' '}
              <Typography component="span" variant="caption" sx={{ color: '#A78BFA', fontWeight: 600 }}>
                {preview}
              </Typography>
            </Typography>
          }
          sx={{ mt: 0.5 }}
          inputProps={{ maxLength: 60 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} sx={{ flex: 1 }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleCreate} sx={{ flex: 1 }}>
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  )
}

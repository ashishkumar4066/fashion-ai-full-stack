import { useState } from 'react'
import { Box, Button, Tooltip, Snackbar, Typography, Paper } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

export default function ResultDisplay({ imageUrl, title = 'Result' }) {
  const [copied, setCopied] = useState(false)
  const [snackbar, setSnackbar] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      setCopied(true)
      setSnackbar(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const filename = `fashionai-result-${Date.now()}.jpg`

  return (
    <Paper
      sx={{
        overflow: 'hidden',
        border: '1px solid #1e1e1e',
        backgroundColor: '#0f0f0f',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          lineHeight: 0,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt={title}
          sx={{
            width: '100%',
            maxHeight: 600,
            objectFit: 'contain',
            display: 'block',
            backgroundColor: '#0a0a0a',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Open in new tab">
              <Button
                size="small"
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  minWidth: 'auto',
                  px: 1,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  backdropFilter: 'blur(4px)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                }}
              >
                <OpenInNewIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
              <Button
                size="small"
                onClick={handleCopy}
                sx={{
                  minWidth: 'auto',
                  px: 1,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  backdropFilter: 'blur(4px)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                }}
              >
                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid #1e1e1e' }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<DownloadIcon />}
          href={imageUrl}
          download={filename}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontWeight: 600 }}
        >
          Download Image
        </Button>
      </Box>

      <Snackbar
        open={snackbar}
        autoHideDuration={2000}
        onClose={() => setSnackbar(false)}
        message="Link copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  )
}

import { useState, useRef, useCallback } from 'react'
import { Box, Typography, LinearProgress, Alert, IconButton } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import ImageIcon from '@mui/icons-material/Image'
import { uploadImage } from '../api/fashionApi'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 20

export default function ImageUploadZone({ onUploadComplete, label = 'Upload Image' }) {
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const reset = () => {
    setStatus('idle')
    setPreview(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onUploadComplete(null)
  }

  const handleFile = useCallback(
    async (file) => {
      if (!file) return
      setError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Unsupported format. Please use JPEG, PNG, or WebP.')
        return
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File too large. Maximum size is ${MAX_SIZE_MB} MB.`)
        return
      }

      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      setStatus('uploading')

      const { data, error: apiError } = await uploadImage(file)
      if (apiError) {
        setStatus('error')
        setError(apiError)
        return
      }

      setStatus('success')
      onUploadComplete(data.url)
    },
    [onUploadComplete],
  )

  const onInputChange = (e) => {
    handleFile(e.target.files?.[0])
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const borderColor = isDragging
    ? '#7C3AED'
    : status === 'success'
      ? '#7C3AED'
      : status === 'error'
        ? '#f44336'
        : '#2a2a2a'

  return (
    <Box>
      <Box
        onClick={() => status === 'idle' && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        sx={{
          position: 'relative',
          border: `2px dashed ${borderColor}`,
          borderRadius: 3,
          p: 3,
          textAlign: 'center',
          cursor: status === 'idle' ? 'pointer' : 'default',
          backgroundColor: isDragging ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.02)',
          boxShadow: isDragging ? '0 0 30px rgba(124,58,237,0.15), inset 0 0 30px rgba(124,58,237,0.05)' : 'none',
          transition: 'all 0.2s ease',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          '&:hover':
            status === 'idle'
              ? { borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.03)', boxShadow: '0 0 20px rgba(124,58,237,0.08)' }
              : {},
          overflow: 'hidden',
        }}
      >
        {preview && (
          <Box
            component="img"
            src={preview}
            alt="Preview"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: status === 'uploading' ? 0.4 : 0.85,
              borderRadius: 2,
            }}
          />
        )}

        {status === 'idle' && !preview && (
          <>
            <CloudUploadIcon sx={{ fontSize: 40, color: isDragging ? '#A78BFA' : '#444', transition: 'color 0.2s' }} />
            <Box>
              <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>{label}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Drag & drop or click to browse
              </Typography>
              <Typography variant="caption" sx={{ color: '#555', mt: 0.5, display: 'block' }}>
                JPEG, PNG, WebP — max 20 MB
              </Typography>
            </Box>
          </>
        )}

        {status === 'uploading' && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          >
            <Typography sx={{ color: 'primary.main', fontWeight: 600 }}>Uploading...</Typography>
            <LinearProgress sx={{ width: '60%', borderRadius: 2 }} />
          </Box>
        )}

        {status === 'success' && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 2,
              px: 1,
              py: 0.5,
            }}
          >
            <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Uploaded
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              reset()
            }}
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}

        {status === 'error' && !preview && (
          <ImageIcon sx={{ fontSize: 40, color: '#f44336' }} />
        )}
      </Box>

      {status === 'error' && error && (
        <Alert
          severity="error"
          sx={{ mt: 1.5, backgroundColor: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)' }}
          action={
            <IconButton size="small" onClick={reset} sx={{ color: '#f44336' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
        onChange={onInputChange}
      />
    </Box>
  )
}

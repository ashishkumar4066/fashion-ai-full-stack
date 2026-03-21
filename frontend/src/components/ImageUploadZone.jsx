import { useState, useRef, useCallback } from 'react'
import { Box, Typography, LinearProgress, Alert, IconButton } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import ImageIcon from '@mui/icons-material/Image'
import { uploadImage } from '../api/fashionApi'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 20

const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

export default function ImageUploadZone({ onUploadComplete, label = 'Upload Image' }) {
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const inputRef = useRef(null)

  const reset = () => {
    setStatus('idle')
    setPreview(null)
    setError(null)
    setShowParticles(false)
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
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 900)
      onUploadComplete(data.url)
    },
    [onUploadComplete],
  )

  const onInputChange = (e) => handleFile(e.target.files?.[0])
  const onDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]) }
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  const borderColor = isDragging
    ? 'rgba(124,58,237,0.7)'
    : status === 'success'
      ? 'rgba(124,58,237,0.5)'
      : status === 'error'
        ? 'rgba(244,67,54,0.5)'
        : 'rgba(255,255,255,0.08)'

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
          backgroundColor: isDragging
            ? 'rgba(124,58,237,0.07)'
            : 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: isDragging
            ? '0 0 0 1px rgba(124,58,237,0.3), 0 0 40px rgba(124,58,237,0.15), inset 0 0 30px rgba(124,58,237,0.05)'
            : 'inset 0 1px 0 rgba(255,255,255,0.04)',
          animation: isDragging ? 'glowPulse 1.5s ease-in-out infinite' : 'none',
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          '&:hover':
            status === 'idle'
              ? {
                  borderColor: 'rgba(124,58,237,0.4)',
                  backgroundColor: 'rgba(124,58,237,0.04)',
                  boxShadow: '0 0 20px rgba(124,58,237,0.08)',
                }
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
              opacity: status === 'uploading' ? 0.35 : 0.85,
              borderRadius: 2,
            }}
          />
        )}

        {status === 'idle' && !preview && (
          <>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(91,33,182,0.08))',
                border: '1px solid rgba(124,58,237,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 26, color: isDragging ? '#A78BFA' : 'rgba(124,58,237,0.5)', transition: 'color 0.2s' }} />
            </Box>
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
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              animation: 'fadeInUp 0.2s ease both',
            }}
          >
            <Typography sx={{ color: '#A78BFA', fontWeight: 600, fontSize: '0.9rem' }}>Uploading...</Typography>
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
              backdropFilter: 'blur(8px)',
              borderRadius: 2,
              px: 1,
              py: 0.5,
              border: '1px solid rgba(124,58,237,0.3)',
              animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
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
            onClick={(e) => { e.stopPropagation(); reset() }}
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}

        {status === 'error' && !preview && (
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(244,67,54,0.1)',
              border: '1px solid rgba(244,67,54,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageIcon sx={{ fontSize: 26, color: '#f44336' }} />
          </Box>
        )}

        {/* Particle burst on upload success */}
        {showParticles && PARTICLE_ANGLES.map((angle, i) => (
          <Box
            key={angle}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: i % 2 === 0 ? '#7C3AED' : '#A78BFA',
              animation: `particleBurst 0.7s ease-out ${i * 0.05}s both`,
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-50px)`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        ))}
      </Box>

      {status === 'error' && error && (
        <Alert
          severity="error"
          sx={{ mt: 1.5, backgroundColor: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.25)', backdropFilter: 'blur(8px)' }}
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

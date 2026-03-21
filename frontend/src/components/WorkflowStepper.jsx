import { Box, Paper, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { glassPanelSx } from '../theme'

const STEPS = [
  { key: 'generate-model',   label: 'Generate Model',   path: '/generate-model',   assetKey: 'modelIds',   shortLabel: 'models' },
  { key: 'generate-garment', label: 'Generate Garment', path: '/generate-garment', assetKey: 'garmentIds', shortLabel: 'garments' },
  { key: 'try-on',           label: 'Virtual Try-On',   path: '/try-on',           assetKey: 'tryonIds',   shortLabel: 'try-ons' },
  { key: 'video',            label: 'Video',            path: '/video',            assetKey: 'videoIds',   shortLabel: 'videos' },
]

export default function WorkflowStepper({ currentStep, isDone, project, onStepClick }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <Paper
      sx={{
        ...glassPanelSx,
        px: { xs: 2, sm: 3 },
        py: 2,
        mb: 4,
        borderRadius: 3,
        animation: 'fadeInUp 0.4s ease 0.05s both',
      }}
    >
      {/* Outer flex row: steps alternate with connector lines */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        {STEPS.map((step, index) => {
          const isPast = index < currentIndex
          const isCurrent = index === currentIndex
          const isNextAfterDone = isDone && index === currentIndex + 1
          const assetCount = project?.assets?.[step.assetKey]?.length ?? 0

          return (
            <Box
              key={step.key}
              sx={{ display: 'contents' }}
            >
              {/* ── Step ── */}
              <Box
                onClick={() => onStepClick(step.path)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.75,
                  cursor: 'pointer',
                  flexShrink: 0,
                  width: { xs: 72, sm: 96 },
                  px: 0.5,
                  py: 0.5,
                  borderRadius: 2,
                  transition: 'background 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(124,58,237,0.07)',
                  },
                }}
              >
                {/* Circle */}
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                    ...(isPast && {
                      background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                      boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
                    }),
                    ...(isCurrent && {
                      border: '2px solid #7C3AED',
                      backgroundColor: 'rgba(124,58,237,0.15)',
                      animation: 'glowPulse 2s ease-in-out infinite',
                    }),
                    ...(!isPast && !isCurrent && {
                      border: isNextAfterDone
                        ? '2px solid rgba(124,58,237,0.45)'
                        : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'transparent',
                    }),
                  }}
                >
                  {isPast ? (
                    <CheckIcon sx={{ fontSize: 15, color: '#fff' }} />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: isCurrent
                          ? '#A78BFA'
                          : isNextAfterDone
                          ? 'rgba(167,139,250,0.6)'
                          : 'rgba(255,255,255,0.2)',
                        lineHeight: 1,
                      }}
                    >
                      {index + 1}
                    </Typography>
                  )}
                </Box>

                {/* Step label */}
                <Typography
                  sx={{
                    fontSize: { xs: '0.58rem', sm: '0.67rem' },
                    fontWeight: isCurrent ? 700 : 500,
                    color: isPast
                      ? 'rgba(255,255,255,0.65)'
                      : isCurrent
                      ? '#fff'
                      : isNextAfterDone
                      ? 'rgba(255,255,255,0.5)'
                      : 'rgba(255,255,255,0.2)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {step.label}
                </Typography>

                {/* Asset count (past steps with project) */}
                {isPast && project && assetCount > 0 && (
                  <Typography
                    sx={{
                      fontSize: '0.58rem',
                      color: 'rgba(167,139,250,0.5)',
                      textAlign: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {assetCount} {step.shortLabel}
                  </Typography>
                )}

                {/* "Up next" indicator */}
                {isNextAfterDone && (
                  <Typography
                    sx={{
                      fontSize: '0.58rem',
                      color: '#A78BFA',
                      fontWeight: 600,
                      textAlign: 'center',
                      lineHeight: 1,
                      animation: 'pulse-glow 1.4s ease-in-out infinite',
                    }}
                  >
                    → Up next
                  </Typography>
                )}
              </Box>

              {/* ── Connector (between steps, not after last) ── */}
              {index < STEPS.length - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    mt: '14px',
                    borderRadius: 1,
                    minWidth: 12,
                    background: isPast
                      ? 'linear-gradient(90deg, #7C3AED, #A78BFA)'
                      : 'rgba(255,255,255,0.06)',
                    transition: 'background 0.4s ease',
                  }}
                />
              )}
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}

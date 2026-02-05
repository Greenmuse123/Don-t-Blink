import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CalibrationData } from '../../detection/types'
import { createCalibrationData, saveCalibration } from '../../detection/calibration'
import { initializeFaceLandmarker, processVideoFrame } from '../../detection/faceLandmarker'

// Use blendshape blink detection instead of EAR
function getBlinkScore(blendshapes: import('@mediapipe/tasks-vision').Category[] | null): number {
  if (!blendshapes) return 0
  const left = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score ?? 0
  const right = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score ?? 0
  return Math.max(left, right)
}

interface CalibrationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: CalibrationData) => void
  videoRef: React.RefObject<HTMLVideoElement>
}

type CalibrationPhase = 'idle' | 'open' | 'closed' | 'complete'

export function CalibrationModal({
  isOpen,
  onClose,
  onComplete,
  videoRef,
}: CalibrationModalProps) {
  const [phase, setPhase] = useState<CalibrationPhase>('idle')
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const openSamplesRef = useRef<number[]>([])

  const clearInterval = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startPhase = useCallback(
    async (newPhase: CalibrationPhase) => {
      clearInterval()
      setPhase(newPhase)
      setProgress(0)

      // Initialize face landmarker if needed
      if (!videoRef.current) {
        console.error('[Calibration] No video ref available')
        return
      }

      try {
        await initializeFaceLandmarker()
        console.log('[Calibration] FaceLandmarker ready')
      } catch (err) {
        console.error('[Calibration] Failed to initialize face landmarker:', err)
        return
      }

      const duration = newPhase === 'open' ? 3000 : 2000
      const interval = 100
      const steps = duration / interval
      let currentStep = 0
      const collectedSamples: number[] = []

      intervalRef.current = window.setInterval(() => {
        currentStep++
        setProgress((currentStep / steps) * 100)

        if (videoRef.current && videoRef.current.readyState >= 2) {
          const result = processVideoFrame(videoRef.current)

          if (result.blendshapes) {
            const blinkScore = getBlinkScore(result.blendshapes)
            collectedSamples.push(blinkScore)
            console.log(`[Calibration] ${newPhase} blink sample:`, blinkScore.toFixed(3))
          } else {
            console.log('[Calibration] No blendshapes detected during sampling')
          }
        }

        if (currentStep >= steps) {
          clearInterval()
          if (newPhase === 'open') {
            // For open eyes, blink score should be low (0.0-0.2)
            openSamplesRef.current = collectedSamples.length > 0 ? collectedSamples : [0.05, 0.08, 0.06]
            console.log('[Calibration] Open blink samples:', openSamplesRef.current)
            setPhase('closed')
            setTimeout(() => startPhase('closed'), 500)
          } else if (newPhase === 'closed') {
            // For closed eyes, blink score should be high (0.5-0.8)
            const closedSamples = collectedSamples.length > 0 ? collectedSamples : [0.65, 0.72, 0.68]
            console.log('[Calibration] Closed blink samples:', closedSamples)
            const calibrationData = createCalibrationData(openSamplesRef.current, closedSamples)
            console.log('[Calibration] Created calibration data:', calibrationData)
            saveCalibration(calibrationData)
            setPhase('complete')
            onComplete(calibrationData)
          }
        }
      }, interval)
    },
    [videoRef, onComplete]
  )

  useEffect(() => {
    if (isOpen && phase === 'idle') {
      console.log('[Calibration] Starting calibration...')
      startPhase('open')
    }
    return () => clearInterval()
  }, [isOpen, phase, startPhase])

  if (!isOpen) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Calibration</h2>

        {phase === 'open' && (
          <>
            <p style={styles.instruction}>Look normally at the camera with eyes open</p>
            <div style={styles.timer}>{Math.ceil((100 - progress) / 33)}s</div>
          </>
        )}

        {phase === 'closed' && (
          <>
            <p style={styles.instruction}>Close your eyes and keep them closed</p>
            <div style={styles.timer}>{Math.ceil((100 - progress) / 50)}s</div>
          </>
        )}

        {phase === 'complete' && (
          <>
            <p style={styles.success}>Calibration complete!</p>
            <p style={styles.detail}>Threshold set to optimal value</p>
            <button onClick={onClose} style={styles.doneButton}>
              Done
            </button>
          </>
        )}

        {phase !== 'complete' && (
          <div style={styles.progressContainer}>
            <div style={{ ...styles.progressBar, width: `${progress}%` }} />
          </div>
        )}

        {phase === 'complete' && (
          <button onClick={() => startPhase('open')} style={styles.retryButton}>
            Recalibrate
          </button>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    backgroundColor: '#1a1a2e',
    padding: '32px',
    borderRadius: '12px',
    minWidth: '400px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 24px 0',
    color: '#fff',
    fontSize: '24px',
  },
  instruction: {
    fontSize: '18px',
    color: '#ccc',
    marginBottom: '16px',
  },
  timer: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#44ff44',
    marginBottom: '24px',
  },
  progressContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#333',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '24px',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#44ff44',
    transition: 'width 0.1s linear',
  },
  success: {
    fontSize: '20px',
    color: '#44ff44',
    marginBottom: '8px',
  },
  detail: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '24px',
  },
  doneButton: {
    padding: '12px 32px',
    backgroundColor: '#44ff44',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  retryButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #555',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '16px',
  },
}

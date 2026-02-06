import { useState, useEffect, useRef, useCallback } from 'react'
import { initializeFaceLandmarker, processVideoFrame } from '../../detection/faceLandmarker'
import { EyeState, DetectionConfig, CalibrationData } from '../../detection/types'
import { loadCalibration } from '../../detection/calibration'

const DEBUG = true
const log = (...args: unknown[]) => DEBUG && console.log('[useEyeDetection]', ...args)

interface UseEyeDetectionResult {
  eyeState: EyeState
  ear: number
  smoothedEAR: number
  closedDurationMs: number
  isReady: boolean
  error: string | null
  start: () => Promise<void>
  stop: () => void
  calibrate: (data: CalibrationData) => void
}

interface UseEyeDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>
  onEyesClose?: () => void
  onEyesOpen?: () => void
  config?: Partial<DetectionConfig>
}

const DEFAULT_CONFIG: DetectionConfig = {
  threshold: 0.15,
  debounceCloseMs: 200,
  debounceOpenMs: 150,
  smoothingAlpha: 0.3,
}

// Optimize: Lower FPS for less CPU usage but maintain responsiveness
const DETECTION_FPS = 15
const FRAME_INTERVAL = 1000 / DETECTION_FPS

// Use blendshape blink detection instead of EAR
function getBlinkScore(blendshapes: import('@mediapipe/tasks-vision').Category[] | null): number {
  if (!blendshapes) return 0
  const left = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score ?? 0
  const right = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score ?? 0
  return Math.max(left, right) // Use highest blink score
}

export function useEyeDetection({
  videoRef,
  onEyesClose,
  onEyesOpen,
  config: userConfig,
}: UseEyeDetectionProps): UseEyeDetectionResult {
  const config = { ...DEFAULT_CONFIG, ...userConfig }
  const calibration = loadCalibration()
  const [threshold, setThreshold] = useState(calibration?.threshold ?? config.threshold)

  const [eyeState, setEyeState] = useState<EyeState>(EyeState.OPEN)
  const [ear, setEar] = useState(0)
  const [smoothedEAR, setSmoothedEAR] = useState(0)
  const [closedDurationMs, setClosedDurationMs] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use refs for values that don't need to trigger re-renders
  const smoothedEARRef = useRef(0.15)
  const consecutiveClosedFrames = useRef(0)
  const consecutiveOpenFrames = useRef(0)
  const closedStartTime = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastFrameTime = useRef(0)
  const isRunning = useRef(false)
  const lastEarUpdate = useRef(0)
  const lastDurationUpdate = useRef(0)
  const eyeStateRef = useRef(eyeState) // Track current eye state to avoid stale closure

  const start = useCallback(async () => {
    try {
      log('Starting eye detection with blendshapes...')
      setError(null)
      await initializeFaceLandmarker()
      log('FaceLandmarker initialized with blendshapes')
      isRunning.current = true
      setIsReady(true)
      log('Eye detection ready')
    } catch (err) {
      log('Failed to initialize face detection:', err)
      setError('Failed to initialize face detection')
      setIsReady(false)
    }
  }, [])

  const stop = useCallback(() => {
    log('Stopping eye detection...')
    isRunning.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setIsReady(false)
    log('Eye detection stopped')
  }, [])

  const calibrate = useCallback((data: CalibrationData) => {
    setThreshold(data.threshold)
  }, [])

  useEffect(() => {
    log('Detection useEffect triggered, isReady:', isReady, 'videoRef exists:', !!videoRef.current, 'video readyState:', videoRef.current?.readyState)
    if (!isReady) {
      log('NOT starting detection loop - isReady is false')
      return
    }
    if (!videoRef.current) {
      log('NOT starting detection loop - videoRef is null')
      return
    }

    log('Starting detection loop with blendshape-based blink detection')
    const detectLoop = async (timestamp: number) => {
      if (!isRunning.current) return

      if (timestamp - lastFrameTime.current >= FRAME_INTERVAL) {
        lastFrameTime.current = timestamp

        const video = videoRef.current
        if (video && video.readyState >= 2) {
          const result = processVideoFrame(video)
          log('processVideoFrame result - blendshapes exist:', !!result.blendshapes)

          if (result.blendshapes) {
            const blinkScore = getBlinkScore(result.blendshapes)
            log('Raw blink score:', blinkScore.toFixed(3))
            
            // Smooth the blink score
            const newSmoothed = config.smoothingAlpha * blinkScore + (1 - config.smoothingAlpha) * smoothedEARRef.current
            smoothedEARRef.current = newSmoothed
            
            // Update UI values (using blink score for compatibility)
            if (timestamp - lastEarUpdate.current > 100) {
              lastEarUpdate.current = timestamp
              setEar(blinkScore)
              setSmoothedEAR(newSmoothed)
              log('>>> Blink:', blinkScore.toFixed(3), '| smoothed:', newSmoothed.toFixed(3), '| threshold:', threshold, '| eyeState:', eyeStateRef.current)
            }

            // Eyes closed if blink score > threshold (0.5 is typical closed threshold)
            const isClosed = newSmoothed > threshold
            log('Is closed check - smoothedBlink:', newSmoothed.toFixed(3), 'threshold:', threshold, 'isClosed:', isClosed)

            if (isClosed) {
              consecutiveClosedFrames.current++
              consecutiveOpenFrames.current = 0

              const requiredClosedFrames = Math.ceil((config.debounceCloseMs / 1000) * DETECTION_FPS)

              if (consecutiveClosedFrames.current >= requiredClosedFrames && eyeStateRef.current === EyeState.OPEN) {
                log('>>>>>>>> EYES CLOSED! TRIGGERING CALLBACK <<<<<<<<')
                setEyeState(EyeState.CLOSED)
                eyeStateRef.current = EyeState.CLOSED
                closedStartTime.current = performance.now()
                onEyesClose?.()
              }
            } else {
              consecutiveOpenFrames.current++
              consecutiveClosedFrames.current = 0

              const requiredOpenFrames = Math.ceil((config.debounceOpenMs / 1000) * DETECTION_FPS)

              if (consecutiveOpenFrames.current >= requiredOpenFrames && eyeStateRef.current === EyeState.CLOSED) {
                log('>>>>>>>> EYES OPEN! TRIGGERING CALLBACK <<<<<<<<')
                setEyeState(EyeState.OPEN)
                eyeStateRef.current = EyeState.OPEN
                closedStartTime.current = null
                await onEyesOpen?.()
              }
            }

            // Throttle duration updates
            if (closedStartTime.current && eyeStateRef.current === EyeState.CLOSED) {
              if (timestamp - lastDurationUpdate.current > 200) {
                lastDurationUpdate.current = timestamp
                setClosedDurationMs(performance.now() - closedStartTime.current)
              }
            } else {
              setClosedDurationMs(0)
            }
          } else {
            log('NO BLENDSHAPES DETECTED')
            consecutiveOpenFrames.current++
            consecutiveClosedFrames.current = 0

            const requiredOpenFrames = Math.ceil((config.debounceOpenMs / 1000) * DETECTION_FPS)

            if (consecutiveOpenFrames.current >= requiredOpenFrames && eyeStateRef.current === EyeState.CLOSED) {
              setEyeState(EyeState.OPEN)
              eyeStateRef.current = EyeState.OPEN
              closedStartTime.current = null
              await onEyesOpen?.()
              setClosedDurationMs(0)
            }
          }
        } else {
          log('Video not ready - readyState:', video?.readyState)
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectLoop)
    }

    animationFrameRef.current = requestAnimationFrame(detectLoop)

    return () => {
      log('Cleaning up detection loop')
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isReady, videoRef, threshold, config, onEyesClose, onEyesOpen])

  return {
    eyeState,
    ear,
    smoothedEAR,
    closedDurationMs,
    isReady,
    error,
    start,
    stop,
    calibrate,
  }
}

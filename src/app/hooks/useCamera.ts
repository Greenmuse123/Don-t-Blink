import { useState, useEffect, useCallback, useRef } from 'react'

const DEBUG = true
const log = (...args: unknown[]) => DEBUG && console.log('[useCamera]', ...args)

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement>
  stream: MediaStream | null
  isReady: boolean
  error: string | null
  start: () => Promise<void>
  stop: () => void
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Attach stream to video element whenever both are available
  useEffect(() => {
    log('useEffect triggered, streamRef:', !!streamRef.current, 'videoRef:', !!videoRef.current)
    if (streamRef.current && videoRef.current) {
      const video = videoRef.current
      log('Attaching stream to video, srcObject before:', !!video.srcObject)
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current
        video.onloadedmetadata = () => {
          log('Video metadata loaded, readyState:', video.readyState)
          video.play().then(() => {
            log('Video playing successfully')
            setIsReady(true)
          }).catch((e) => {
            log('Video play() failed:', e)
            setIsReady(true)
          })
        }
      }
    }
  }, [stream])

  // Auto-start camera on mount
  useEffect(() => {
    log('Auto-starting camera...')
    start()
    return () => {
      stop()
    }
  }, [])

  const start = useCallback(async () => {
    try {
      log('Starting camera...')
      setError(null)
      
      // Check for getUserMedia support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported')
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      })

      log('Camera stream acquired, tracks:', mediaStream.getTracks().length)
      streamRef.current = mediaStream
      setStream(mediaStream)

      // If video element already exists, attach immediately
      if (videoRef.current) {
        log('Video element exists, attaching stream')
        const video = videoRef.current
        video.srcObject = mediaStream
        video.onloadedmetadata = () => {
          log('Video metadata loaded immediately, readyState:', video.readyState)
          video.play().then(() => {
            log('Video playing immediately')
            setIsReady(true)
          }).catch((e) => {
            log('Video play() failed immediately:', e)
            setIsReady(true)
          })
        }
      } else {
        log('Video element not yet available, will attach via useEffect')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera'
      log('Camera error:', errorMessage)
      setError(errorMessage)
      setIsReady(false)
    }
  }, [])

  const stop = useCallback(() => {
    log('Stopping camera...')
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStream(null)
    setIsReady(false)
    log('Camera stopped')
  }, [])

  return { videoRef, stream, isReady, error, start, stop }
}

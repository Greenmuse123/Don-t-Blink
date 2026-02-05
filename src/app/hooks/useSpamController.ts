import { useRef, useCallback, useState, useEffect } from 'react'
import { SpamController, SpamState } from '../../spam/spamController'
import { SpamConfig } from '../../spam/types'

const DEBUG = true
const log = (...args: unknown[]) => DEBUG && console.log('[useSpamController]', ...args)

interface UseSpamControllerResult {
  controllerRef: React.RefObject<SpamController>
  state: SpamState
  setConfig: (config: Partial<SpamConfig>) => void
  setFiles: (audioFile: string | null, videoFiles: string[]) => void
  setVideoContainer: (container: HTMLElement | null) => void
  onEyesClose: () => void
  onEyesOpen: () => void
  clearAllVideos: () => void
}

export function useSpamController(): UseSpamControllerResult {
  const controllerRef = useRef<SpamController>(new SpamController())
  const [state, setState] = useState<SpamState>({
    isActive: false,
    escalationLevel: 0,
    closedDurationMs: 0,
    spawnRate: 0,
    activeVideos: 0,
    maxVideos: 20,
  })

  useEffect(() => {
    const controller = controllerRef.current
    controller.setCallbacks({
      onStateChange: (newState) => {
        setState(newState)
      },
    })

    return () => {
      controller.dispose()
    }
  }, [])

  const setConfig = useCallback((config: Partial<SpamConfig>) => {
    controllerRef.current.setConfig(config)
    setState((prev) => ({
      ...prev,
      maxVideos: config.maxVideos ?? prev.maxVideos,
    }))
    log('Config updated:', config)
  }, [])

  const setFiles = useCallback((audioFile: string | null, videoFiles: string[]) => {
    controllerRef.current.setFiles(audioFile, videoFiles)
    log('Files updated - audio:', audioFile, 'videos:', videoFiles.length)
  }, [])

  const setVideoContainer = useCallback((container: HTMLElement | null) => {
    if (container) {
      controllerRef.current.setVideoContainer(container)
      log('Video container updated:', container)
    }
  }, [])

  const onEyesClose = useCallback(() => {
    log('onEyesClose called - forwarding to controller')
    controllerRef.current.onEyesClose()
  }, [])

  const onEyesOpen = useCallback(() => {
    log('onEyesOpen called - forwarding to controller')
    controllerRef.current.onEyesOpen()
  }, [])

  const clearAllVideos = useCallback(() => {
    controllerRef.current.clearAllVideos()
  }, [])

  return {
    controllerRef,
    state,
    setConfig,
    setFiles,
    setVideoContainer,
    onEyesClose,
    onEyesOpen,
    clearAllVideos,
  }
}

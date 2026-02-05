import React, { useState, useCallback, useEffect } from 'react'
import { useCamera } from './app/hooks/useCamera'
import { useEyeDetection } from './app/hooks/useEyeDetection'
import { useSpamController } from './app/hooks/useSpamController'
import { CameraPreview } from './app/components/CameraPreview'
import { Controls } from './app/components/Controls'
import { CalibrationModal } from './app/components/CalibrationModal'
import { DebugPanel } from './app/components/DebugPanel'
import { VideoOverlay } from './app/components/VideoOverlay'
import { CalibrationData } from './detection/types'
import { VideoBehavior, DEFAULT_SPAM_CONFIG } from './spam/types'
import { loadCalibration } from './detection/calibration'

export default function App() {
  const { videoRef, error: cameraError } = useCamera()
  const {
    state: spamState,
    setConfig: setSpamConfig,
    setFiles,
    setVideoContainer,
    onEyesClose,
    onEyesOpen,
    clearAllVideos,
  } = useSpamController()

  const calibration = loadCalibration()
  const [threshold, setThreshold] = useState(calibration?.threshold ?? 0.15)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [isDebugExpanded, setIsDebugExpanded] = useState(false)
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false)
  const [audioFile, setAudioFile] = useState<string | null>(null)
  const [videoFiles, setVideoFiles] = useState<string[]>([])
  const [maxVideos, setMaxVideos] = useState(DEFAULT_SPAM_CONFIG.maxVideos)
  const [videoBehavior, setVideoBehavior] = useState<VideoBehavior>(DEFAULT_SPAM_CONFIG.videoBehavior)

  const { eyeState, ear, smoothedEAR, closedDurationMs, start: startDetection, stop: stopDetection, calibrate } = useEyeDetection({
    videoRef,
    onEyesClose,
    onEyesOpen,
  })

  useEffect(() => {
    setSpamConfig({
      maxVideos,
      videoBehavior,
      fadeOutDurationMs: DEFAULT_SPAM_CONFIG.fadeOutDurationMs,
    })
  }, [setSpamConfig, maxVideos, videoBehavior])

  const handleToggleDetection = useCallback(() => {
    if (isDetecting) {
      stopDetection()
      setIsDetecting(false)
    } else {
      startDetection()
      setIsDetecting(true)
    }
  }, [isDetecting, startDetection, stopDetection])

  const handleSelectAudio = useCallback(async () => {
    const file = await window.electronAPI.selectAudioFile()
    if (file) {
      setAudioFile(file)
      setFiles(file, videoFiles)
    }
  }, [setFiles, videoFiles])

  const handleSelectVideos = useCallback(async () => {
    const files = await window.electronAPI.selectVideoFiles()
    if (files.length > 0) {
      setVideoFiles(files)
      setFiles(audioFile, files)
    }
  }, [setFiles, audioFile])

  const handleThresholdChange = useCallback((value: number) => {
    setThreshold(value)
    calibrate({ openBaseline: value + 0.1, closedBaseline: value - 0.1, threshold: value, timestamp: Date.now() })
  }, [calibrate])

  const handleCalibrate = useCallback(() => {
    setIsCalibrationOpen(true)
  }, [])

  const handleCalibrationComplete = useCallback(
    (data: CalibrationData) => {
      setThreshold(data.threshold)
      calibrate(data)
      setIsCalibrationOpen(false)
    },
    [calibrate]
  )

  const handleMaxVideosChange = useCallback(
    (value: number) => {
      setMaxVideos(value)
      setSpamConfig({ maxVideos: value })
    },
    [setSpamConfig]
  )

  const handleVideoBehaviorChange = useCallback(
    (value: VideoBehavior) => {
      setVideoBehavior(value)
      setSpamConfig({ videoBehavior: value })
    },
    [setSpamConfig]
  )

  const handleContainerReady = useCallback(
    (container: HTMLElement) => {
      setVideoContainer(container)
    },
    [setVideoContainer]
  )

  return (
    <div style={styles.container}>
      <VideoOverlay onContainerReady={handleContainerReady} />
      
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            <span style={styles.gradientText}>Eyes Closed</span>
            <span style={styles.separator}>|</span>
            <span style={styles.titleAccent}>Punisher</span>
          </h1>
          <div style={{
            ...styles.statusBadge,
            background: isDetecting ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: isDetecting ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)',
          }}>
            <span style={{
              ...styles.statusDot,
              background: isDetecting ? '#10b981' : '#64748b',
              boxShadow: isDetecting ? '0 0 12px rgba(16, 185, 129, 0.6)' : 'none',
            }} />
            <span style={{
              ...styles.statusText,
              color: isDetecting ? '#10b981' : '#94a3b8',
            }}>{isDetecting ? 'Monitoring' : 'Standby'}</span>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.grid}>
          <section style={styles.leftPanel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Camera Feed</h2>
              <button 
                style={styles.toggleBtn}
                onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              >
                {isPreviewVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {cameraError && (
              <div style={styles.errorBanner}>
                <span>⚠️ {cameraError}</span>
              </div>
            )}

            <CameraPreview
              videoRef={videoRef}
              isVisible={isPreviewVisible}
              onToggleVisibility={() => setIsPreviewVisible(!isPreviewVisible)}
            />

            <DebugPanel
              isExpanded={isDebugExpanded}
              onToggle={() => setIsDebugExpanded(!isDebugExpanded)}
              ear={ear}
              smoothedEAR={smoothedEAR}
              eyeState={eyeState}
              closedDurationMs={closedDurationMs}
              spamState={spamState}
            />
          </section>

          <aside style={styles.rightPanel}>
            <Controls
              isDetecting={isDetecting}
              onToggleDetection={handleToggleDetection}
              eyeState={eyeState}
              ear={ear}
              smoothedEAR={smoothedEAR}
              threshold={threshold}
              onThresholdChange={handleThresholdChange}
              onCalibrate={handleCalibrate}
              audioFile={audioFile}
              videoFiles={videoFiles}
              onSelectAudio={handleSelectAudio}
              onSelectVideos={handleSelectVideos}
              maxVideos={maxVideos}
              onMaxVideosChange={handleMaxVideosChange}
              videoBehavior={videoBehavior}
              onVideoBehaviorChange={handleVideoBehaviorChange}
              spamState={spamState}
              onClearVideos={clearAllVideos}
            />
          </aside>
        </div>
      </main>

      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        onComplete={handleCalibrationComplete}
        videoRef={videoRef}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #12121c 50%, #0f0f1a 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '16px 24px',
    background: 'rgba(15, 15, 26, 0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  headerContent: {
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '24px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    margin: 0,
  },
  gradientText: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontWeight: 300,
  },
  titleAccent: {
    color: '#f8fafc',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '9999px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  statusText: {
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 0.3s ease',
  },
  main: {
    flex: 1,
    padding: '24px',
    overflow: 'auto',
  },
  grid: {
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 420px',
    gap: '24px',
    height: 'calc(100vh - 140px)',
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minHeight: 0,
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px',
  },
  panelTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#f8fafc',
    margin: 0,
  },
  toggleBtn: {
    padding: '6px 12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  rightPanel: {
    height: '100%',
    minHeight: 0,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    color: '#fca5a5',
    fontSize: '14px',
    fontWeight: 500,
  },
}

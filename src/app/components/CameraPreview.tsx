import React, { useEffect } from 'react'

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>
  isVisible: boolean
  onToggleVisibility: () => void
}

export function CameraPreview({ videoRef, isVisible }: CameraPreviewProps) {
  // Force video to play when visible
  useEffect(() => {
    if (isVisible && videoRef.current) {
      const video = videoRef.current
      if (video.paused) {
        video.play().catch(() => {})
      }
    }
  }, [isVisible, videoRef])

  if (!isVisible) return null

  return (
    <div style={styles.container}>
      <div style={styles.glow} />
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={styles.video}
      />
      <div style={styles.overlay}>
        <div style={styles.scanline} />
        <div style={styles.cornerTopLeft} />
        <div style={styles.cornerTopRight} />
        <div style={styles.cornerBottomLeft} />
        <div style={styles.cornerBottomRight} />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#0f0f1a',
    border: '2px solid rgba(99, 102, 241, 0.3)',
    boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)',
    aspectRatio: '4/3',
    maxHeight: '400px',
  },
  glow: {
    position: 'absolute',
    inset: '-2px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(168, 85, 247, 0.1) 100%)',
    zIndex: -1,
    filter: 'blur(8px)',
    opacity: 0.6,
  },
  video: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  scanline: {
    position: 'absolute',
    inset: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px)',
    animation: 'scanline 8s linear infinite',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    width: '24px',
    height: '24px',
    borderTop: '3px solid rgba(99, 102, 241, 0.6)',
    borderLeft: '3px solid rgba(99, 102, 241, 0.6)',
    borderTopLeftRadius: '8px',
  },
  cornerTopRight: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '24px',
    height: '24px',
    borderTop: '3px solid rgba(99, 102, 241, 0.6)',
    borderRight: '3px solid rgba(99, 102, 241, 0.6)',
    borderTopRightRadius: '8px',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    width: '24px',
    height: '24px',
    borderBottom: '3px solid rgba(99, 102, 241, 0.6)',
    borderLeft: '3px solid rgba(99, 102, 241, 0.6)',
    borderBottomLeftRadius: '8px',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    width: '24px',
    height: '24px',
    borderBottom: '3px solid rgba(99, 102, 241, 0.6)',
    borderRight: '3px solid rgba(99, 102, 241, 0.6)',
    borderBottomRightRadius: '8px',
  },
}

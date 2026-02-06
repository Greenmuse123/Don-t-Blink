import { useRef, useEffect } from 'react'

interface VideoOverlayProps {
  onContainerReady: (container: HTMLElement) => void
  onReset?: () => void
  isSpamActive?: boolean
}

export function VideoOverlay({ onContainerReady, onReset, isSpamActive }: VideoOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      onContainerReady(containerRef.current)
    }
  }, [onContainerReady])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {isSpamActive && onReset && (
        <button
          onClick={onReset}
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            padding: '12px 20px',
            background: 'rgba(239, 68, 68, 0.9)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 10000,
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 1)'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          RESET
        </button>
      )}
    </div>
  )
}

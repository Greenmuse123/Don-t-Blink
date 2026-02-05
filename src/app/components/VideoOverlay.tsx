import { useRef, useEffect } from 'react'

interface VideoOverlayProps {
  onContainerReady: (container: HTMLElement) => void
}

export function VideoOverlay({ onContainerReady }: VideoOverlayProps) {
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
    />
  )
}

import React from 'react'
import { EyeState } from '../../detection/types'
import { SpamState } from '../../spam/spamController'

interface DebugPanelProps {
  isExpanded: boolean
  onToggle: () => void
  ear: number
  smoothedEAR: number
  eyeState: EyeState
  closedDurationMs: number
  spamState: SpamState
}

export function DebugPanel({
  isExpanded,
  onToggle,
  ear,
  smoothedEAR,
  eyeState,
  closedDurationMs,
  spamState,
}: DebugPanelProps) {
  return (
    <div style={styles.container}>
      <button onClick={onToggle} style={styles.toggleButton}>
        {isExpanded ? 'Hide Debug Info' : 'Show Debug Info'}
      </button>

      {isExpanded && (
        <div style={styles.panel}>
          <div style={styles.grid}>
            <div style={styles.item}>
              <span style={styles.label}>Raw EAR:</span>
              <span style={styles.value}>{ear.toFixed(3)}</span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Smoothed EAR:</span>
              <span style={styles.value}>{smoothedEAR.toFixed(3)}</span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Eye State:</span>
              <span style={{ ...styles.value, color: eyeState === EyeState.CLOSED ? '#ff4444' : '#44ff44' }}>
                {eyeState}
              </span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Closed Duration:</span>
              <span style={styles.value}>{closedDurationMs}ms</span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Escalation Level:</span>
              <span style={styles.value}>{spamState.escalationLevel}</span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Spawn Rate:</span>
              <span style={styles.value}>{spamState.spawnRate} videos/2s</span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Active Videos:</span>
              <span style={styles.value}>
                {spamState.activeVideos} / {spamState.maxVideos}
              </span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Spam Active:</span>
              <span style={{ ...styles.value, color: spamState.isActive ? '#ff4444' : '#888' }}>
                {spamState.isActive ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '16px',
  },
  toggleButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#3a3a5a',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  panel: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#0a0a1a',
    borderRadius: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 8px',
    backgroundColor: '#1a1a2e',
    borderRadius: '4px',
    fontSize: '12px',
  },
  label: {
    color: '#888',
  },
  value: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
}

import React from 'react'
import { EyeState } from '../../detection/types'
import { SpamState } from '../../spam/spamController'
import { VideoBehavior } from '../../spam/types'

interface ControlsProps {
  isDetecting: boolean
  onToggleDetection: () => void
  eyeState: EyeState
  ear: number
  smoothedEAR: number
  threshold: number
  onThresholdChange: (value: number) => void
  onCalibrate: () => void
  audioFile: string | null
  videoFiles: string[]
  onSelectAudio: () => void
  onSelectVideos: () => void
  maxVideos: number
  onMaxVideosChange: (value: number) => void
  videoBehavior: VideoBehavior
  onVideoBehaviorChange: (value: VideoBehavior) => void
  spamState: SpamState
  onClearVideos: () => void
}

export function Controls({
  isDetecting,
  onToggleDetection,
  eyeState,
  threshold,
  onThresholdChange,
  onCalibrate,
  audioFile,
  videoFiles,
  onSelectAudio,
  onSelectVideos,
  maxVideos,
  onMaxVideosChange,
  videoBehavior,
  onVideoBehaviorChange,
  spamState,
  onClearVideos,
}: ControlsProps) {
  const isClosed = eyeState === EyeState.CLOSED

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Detection Control</h3>
        
        <div style={styles.detectionRow}>
          <button
            onClick={onToggleDetection}
            style={{
              ...styles.mainButton,
              background: isDetecting 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: isDetecting 
                ? '0 4px 14px rgba(239, 68, 68, 0.4)' 
                : '0 4px 14px rgba(16, 185, 129, 0.4)',
            }}
          >
            <span style={styles.buttonIcon}>{isDetecting ? '⏹' : '▶'}</span>
            {isDetecting ? 'Stop Detection' : 'Start Detection'}
          </button>
          
          <div style={{
            ...styles.eyeIndicator,
            background: isClosed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            borderColor: isClosed ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
          }}>
            <span style={{
              ...styles.eyeDot,
              background: isClosed ? '#ef4444' : '#10b981',
              boxShadow: isClosed ? '0 0 10px rgba(239, 68, 68, 0.6)' : '0 0 10px rgba(16, 185, 129, 0.6)',
            }} />
            <span style={{
              ...styles.eyeText,
              color: isClosed ? '#ef4444' : '#10b981',
            }}>{eyeState}</span>
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Media Files</h3>
        
        <div style={styles.fileCard}>
          <div style={styles.fileRow}>
            <button onClick={onSelectAudio} style={styles.fileButton}>
              <span style={styles.fileIcon}>🎵</span>
              <span>Select Audio</span>
            </button>
            <span style={styles.fileName} title={audioFile || ''}>
              {audioFile ? audioFile.split(/[/\\]/).pop() : 'No file selected'}
            </span>
          </div>
          
          <div style={styles.fileRow}>
            <button onClick={onSelectVideos} style={styles.fileButton}>
              <span style={styles.fileIcon}>🎬</span>
              <span>Select Videos</span>
            </button>
            <span style={styles.fileName}>
              {videoFiles.length > 0 ? `${videoFiles.length} files selected` : 'No files selected'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Configuration</h3>
        
        <div style={styles.controlGroup}>
          <label style={styles.label}>
            <span>Detection Threshold</span>
            <span style={styles.valueBadge}>{threshold.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={0.05}
            max={0.3}
            step={0.01}
            value={threshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            style={styles.slider}
          />
          <div style={styles.sliderLabels}>
            <span style={styles.sliderLabel}>Sensitive</span>
            <span style={styles.sliderLabel}>Lenient</span>
          </div>
        </div>

        <button onClick={onCalibrate} style={styles.calibrateButton}>
          <span style={styles.buttonIcon}>⚙️</span>
          Calibrate Threshold
        </button>

        <div style={styles.controlGroup}>
          <label style={styles.label}>
            <span>Maximum Videos</span>
            <span style={styles.valueBadge}>{maxVideos}</span>
          </label>
          <input
            type="range"
            min={5}
            max={50}
            step={1}
            value={maxVideos}
            onChange={(e) => onMaxVideosChange(parseInt(e.target.value))}
            style={styles.slider}
          />
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>Video Behavior</label>
          <select
            value={videoBehavior}
            onChange={(e) => onVideoBehaviorChange(e.target.value as VideoBehavior)}
            style={styles.select}
          >
            <option value="clear">Clear All on Eyes Open</option>
            <option value="keep">Keep Videos Playing</option>
            <option value="fade">Fade Out Gradually</option>
          </select>
        </div>

        <button onClick={onClearVideos} style={styles.clearButton}>
          <span style={styles.buttonIcon}>🗑️</span>
          Clear All Videos
        </button>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>System Status</h3>
        
        <div style={styles.metricsGrid}>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Active Videos</span>
            <span style={styles.metricValue}>{spamState.activeVideos} / {spamState.maxVideos}</span>
          </div>
          
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Escalation</span>
            <span style={{
              ...styles.metricValue,
              color: spamState.escalationLevel > 0 ? '#f59e0b' : '#94a3b8',
            }}>Level {spamState.escalationLevel}</span>
          </div>
          
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Duration</span>
            <span style={styles.metricValue}>{Math.floor(spamState.closedDurationMs / 1000)}s</span>
          </div>
          
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Spawn Rate</span>
            <span style={styles.metricValue}>{spamState.spawnRate}/2s</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
    borderRadius: '16px',
    padding: '20px',
    height: '100%',
    overflowY: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    margin: '20px 0',
  },
  detectionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  mainButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flex: 1,
    padding: '14px 20px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonIcon: {
    fontSize: '16px',
  },
  eyeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid',
    minWidth: '100px',
    justifyContent: 'center',
  },
  eyeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  eyeText: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  fileCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  fileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    whiteSpace: 'nowrap',
  },
  fileIcon: {
    fontSize: '14px',
  },
  fileName: {
    fontSize: '13px',
    color: '#94a3b8',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  controlGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '10px',
  },
  valueBadge: {
    padding: '2px 8px',
    background: 'rgba(99, 102, 241, 0.2)',
    borderRadius: '4px',
    color: '#818cf8',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'monospace',
  },
  slider: {
    width: '100%',
    height: '6px',
    WebkitAppearance: 'none',
    appearance: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '6px',
  },
  sliderLabel: {
    fontSize: '11px',
    color: '#64748b',
  },
  calibrateButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '16px',
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '13px',
    cursor: 'pointer',
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    color: '#fca5a5',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  metricLabel: {
    fontSize: '10px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#f8fafc',
    fontFamily: 'monospace',
  },
}

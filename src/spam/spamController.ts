import { AudioController } from './audioController'
import { VideoSpawner } from './videoSpawner'
import { SpamConfig, DEFAULT_SPAM_CONFIG } from './types'

const DEBUG = true
const log = (...args: unknown[]) => DEBUG && console.log('[spamController]', ...args)

const ESCALATION_INTERVAL_MS = 2000
const MAX_BURST_SIZE = 5

export interface SpamState {
  isActive: boolean
  escalationLevel: number
  closedDurationMs: number
  spawnRate: number
  activeVideos: number
  maxVideos: number
}

export interface SpamCallbacks {
  onStateChange?: (state: SpamState) => void
}

export class SpamController {
  private audioController: AudioController
  private videoSpawner: VideoSpawner
  private config: SpamConfig = DEFAULT_SPAM_CONFIG
  private callbacks: SpamCallbacks = {}

  private isActive = false
  private escalationLevel = 0
  private closedStartTime: number | null = null
  private escalationInterval: number | null = null

  private audioFile: string | null = null
  private videoFiles: string[] = []
  private fileUsageCounts: Map<string, number> = new Map()

  constructor() {
    this.audioController = new AudioController()
    this.videoSpawner = new VideoSpawner()
  }

  setConfig(config: Partial<SpamConfig>): void {
    this.config = { ...this.config, ...config }
    this.videoSpawner.setConfig(config)
  }

  setCallbacks(callbacks: SpamCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  setFiles(audioFile: string | null, videoFiles: string[]): void {
    this.audioFile = audioFile
    this.videoFiles = videoFiles
    // Initialize usage counts for new files
    this.fileUsageCounts.clear()
    for (const file of videoFiles) {
      this.fileUsageCounts.set(file, 0)
    }
    log('Files updated - audio:', audioFile, 'videos:', videoFiles.length)
  }

  setVideoContainer(container: HTMLElement): void {
    this.videoSpawner.setContainer(container)
  }

  onEyesClose(): void {
    if (this.isActive) {
      log('onEyesClose called but already active, ignoring')
      return
    }
    log('EYES CLOSE EVENT - activating spam!')
    this.isActive = true

    this.closedStartTime = performance.now()
    this.escalationLevel = 0

    this.spawnInitialBurst().catch(err => log('Error in initial burst:', err))
    this.startAudio()
    this.startEscalationTimer()
    this.notifyStateChange()
  }

  async onEyesOpen(): Promise<void> {
    if (!this.isActive) {
      log('onEyesOpen called but not active, ignoring')
      return
    }
    log('EYES OPEN EVENT - deactivating spam')
    this.isActive = false

    this.stopAudio()
    this.stopEscalationTimer()
    await this.handleEyesOpenVideos() // Await to ensure videos clear before continuing
    this.notifyStateChange()

    this.closedStartTime = null
    this.escalationLevel = 0
    // Reset usage counts for next session
    this.fileUsageCounts.clear()
    for (const file of this.videoFiles) {
      this.fileUsageCounts.set(file, 0)
    }
  }

  private async spawnInitialBurst(): Promise<void> {
    log('Spawning initial burst, video files count:', this.videoFiles.length)
    if (this.videoFiles.length === 0) {
      log('No video files to spawn')
      return
    }
    // Spawn popup window - use fair selection
    const selectedVideo = this.getFairVideo()
    log('Spawning popup video (fair):', selectedVideo)
    await this.videoSpawner.spawn(selectedVideo)
    this.notifyStateChange()
  }

  private startEscalationTimer(): void {
    this.escalationInterval = window.setInterval(() => {
      this.escalationTick()
    }, ESCALATION_INTERVAL_MS)
  }

  private stopEscalationTimer(): void {
    if (this.escalationInterval) {
      clearInterval(this.escalationInterval)
      this.escalationInterval = null
    }
  }

  async escalationTick(): Promise<void> {
    if (!this.isActive || this.videoFiles.length === 0) return

    this.escalationLevel++
    const burstSize = Math.min(this.escalationLevel + 1, MAX_BURST_SIZE)

    for (let i = 0; i < burstSize; i++) {
      setTimeout(async () => {
        // Double-check isActive inside timeout in case eyes opened during delay
        if (this.isActive) {
          const selectedVideo = this.getFairVideo()
          await this.videoSpawner.spawn(selectedVideo)
          this.notifyStateChange()
        }
      }, i * 100)
    }

    this.notifyStateChange()
  }

  private startAudio(): void {
    if (this.audioFile) {
      log('Starting audio:', this.audioFile)
      this.audioController.play(this.audioFile)
    } else {
      log('No audio file set, skipping audio')
    }
  }

  private stopAudio(): void {
    this.audioController.stop()
  }

  private async handleEyesOpenVideos(): Promise<void> {
    const behavior = this.config.videoBehavior

    if (behavior === 'clear') {
      await this.videoSpawner.clearAll() // Await to ensure all cleared
    } else if (behavior === 'fade') {
      await this.videoSpawner.fadeOutAll()
    }
  }

  private getFairVideo(): string {
    if (this.videoFiles.length === 0) return ''
    
    // Find the minimum usage count
    let minCount = Infinity
    for (const count of this.fileUsageCounts.values()) {
      if (count < minCount) minCount = count
    }
    
    // Get all files with minimum usage
    const leastUsed: string[] = []
    for (const [file, count] of this.fileUsageCounts) {
      if (count === minCount) leastUsed.push(file)
    }
    
    // Pick random from least used (for variety when multiple have same count)
    const selected = leastUsed[Math.floor(Math.random() * leastUsed.length)]
    
    // Increment usage count
    this.fileUsageCounts.set(selected, (this.fileUsageCounts.get(selected) || 0) + 1)
    
    log('Fair selection - file:', selected.split(/[\\/]/).pop(), 'usage:', this.fileUsageCounts.get(selected), 'minCount:', minCount)
    
    return selected
  }

  private notifyStateChange(): void {
    const closedDurationMs = this.closedStartTime
      ? performance.now() - this.closedStartTime
      : 0

    const state: SpamState = {
      isActive: this.isActive,
      escalationLevel: this.escalationLevel,
      closedDurationMs: Math.floor(closedDurationMs),
      spawnRate: Math.min(this.escalationLevel + 1, MAX_BURST_SIZE),
      activeVideos: this.videoSpawner.getCount(),
      maxVideos: this.videoSpawner.getMaxVideos(),
    }

    this.callbacks.onStateChange?.(state)
  }

  getState(): SpamState {
    const closedDurationMs = this.closedStartTime
      ? performance.now() - this.closedStartTime
      : 0

    return {
      isActive: this.isActive,
      escalationLevel: this.escalationLevel,
      closedDurationMs: Math.floor(closedDurationMs),
      spawnRate: Math.min(this.escalationLevel + 1, MAX_BURST_SIZE),
      activeVideos: this.videoSpawner.getCount(),
      maxVideos: this.videoSpawner.getMaxVideos(),
    }
  }

  clearAllVideos(): void {
    this.videoSpawner.clearAll()
    this.notifyStateChange()
  }

  dispose(): void {
    this.stopEscalationTimer()
    this.audioController.dispose()
    this.videoSpawner.dispose()
  }
}

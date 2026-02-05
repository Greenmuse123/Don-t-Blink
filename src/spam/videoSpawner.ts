import { SpawnedVideo, SpawnStyle, SpamConfig, DEFAULT_SPAM_CONFIG } from './types'

// Type for popup reference - just track IDs since actual windows are in main process
interface PopupReference {
  id: string
  src: string
  createdAt: number
}

const DEBUG = true
const log = (...args: unknown[]) => DEBUG && console.log('[videoSpawner]', ...args)

function generateId(): string {
  return `popup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export class VideoSpawner {
  private popups: Map<string, PopupReference> = new Map()
  private config: SpamConfig = DEFAULT_SPAM_CONFIG

  setContainer(_container: HTMLElement): void {
    // Container not needed for Electron popups - they're native windows
    log('Container set (ignored for native popups)')
  }

  setConfig(config: Partial<SpamConfig>): void {
    this.config = { ...this.config, ...config }
  }

  getConfig(): SpamConfig {
    return { ...this.config }
  }

  async spawn(src: string, _style?: SpawnStyle): Promise<SpawnedVideo | null> {
    log('Spawning popup with:', src)

    await this.cleanupOldestIfNeeded()

    const id = generateId()

    try {
      // Use Electron API to spawn native popup window
      const result = await window.electronAPI.spawnPopup(src, id)

      if (!result.success) {
        log('Failed to spawn popup:', result.error)
        return null
      }

      const popupRef: PopupReference = {
        id,
        src,
        createdAt: Date.now(),
      }

      this.popups.set(id, popupRef)

      log('Popup spawned successfully, total popups:', this.popups.size)

      // Return a SpawnedVideo-compatible object (without actual element)
      return {
        id,
        src,
        element: null as unknown as HTMLVideoElement,
        createdAt: popupRef.createdAt,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      }
    } catch (err) {
      log('Error spawning popup:', err)
      return null
    }
  }

  async spawnMultiple(srcs: string[], count: number, style?: SpawnStyle): Promise<SpawnedVideo[]> {
    const spawned: SpawnedVideo[] = []
    for (let i = 0; i < count; i++) {
      const src = srcs[Math.floor(Math.random() * srcs.length)]
      const popup = await this.spawn(src, style)
      if (popup) spawned.push(popup)
    }
    return spawned
  }

  private async cleanupOldestIfNeeded(): Promise<void> {
    if (this.popups.size >= this.config.maxVideos) {
      const oldest = this.getOldestPopup()
      if (oldest) {
        await this.remove(oldest.id)
      }
    }
  }

  private getOldestPopup(): PopupReference | null {
    let oldest: PopupReference | null = null
    for (const popup of this.popups.values()) {
      if (!oldest || popup.createdAt < oldest.createdAt) {
        oldest = popup
      }
    }
    return oldest
  }

  async remove(id: string): Promise<void> {
    const popup = this.popups.get(id)
    if (popup) {
      this.popups.delete(id)
      log('Removed popup from tracking:', id)
    }
  }

  async clearAll(): Promise<void> {
    log('Clearing all popups, count:', this.popups.size)

    // Use Electron API to clear all native popups
    await window.electronAPI.clearAllPopups()

    this.popups.clear()
    log('All popups cleared')
  }

  async fadeOutAll(): Promise<void> {
    log('Fading out all popups, count:', this.popups.size)

    // Use Electron API to fade out native popups
    await window.electronAPI.fadeOutPopups(this.config.fadeOutDurationMs)

    this.popups.clear()
    log('All popups faded out and cleared')
  }

  getCount(): number {
    return this.popups.size
  }

  getMaxVideos(): number {
    return this.config.maxVideos
  }

  getAllVideos(): SpawnedVideo[] {
    return Array.from(this.popups.values()).map(popup => ({
      id: popup.id,
      src: popup.src,
      element: null as unknown as HTMLVideoElement,
      createdAt: popup.createdAt,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }))
  }

  dispose(): void {
    this.clearAll()
  }
}

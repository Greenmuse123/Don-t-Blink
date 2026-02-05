const FADE_OUT_DURATION_MS = 150

export class AudioController {
  private audioElement: HTMLAudioElement | null = null
  private currentSrc: string | null = null
  private fadeInterval: number | null = null

  constructor() {
    this.audioElement = new Audio()
    this.audioElement.loop = true
    this.audioElement.volume = 1
  }

  play(src: string): void {
    if (!this.audioElement) {
      this.audioElement = new Audio()
      this.audioElement.loop = true
    }

    if (this.currentSrc !== src || this.audioElement.paused) {
      this.stopFade()

      this.audioElement.src = src
      this.currentSrc = src
      this.audioElement.volume = 1
      this.audioElement.currentTime = 0

      const playPromise = this.audioElement.play()
      if (playPromise) {
        playPromise.catch((err) => {
          console.warn('Audio playback failed:', err)
        })
      }
    }
  }

  stop(): void {
    if (!this.audioElement || this.audioElement.paused) {
      return
    }

    this.stopFade()

    const startVolume = this.audioElement.volume
    const startTime = performance.now()

    this.fadeInterval = window.setInterval(() => {
      const elapsed = performance.now() - startTime
      const progress = elapsed / FADE_OUT_DURATION_MS

      if (progress >= 1) {
        this.stopFade()
        if (this.audioElement) {
          this.audioElement.pause()
          this.audioElement.currentTime = 0
          this.audioElement.volume = 1
        }
      } else {
        if (this.audioElement) {
          this.audioElement.volume = startVolume * (1 - progress)
        }
      }
    }, 16)
  }

  private stopFade(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }
  }

  isPlaying(): boolean {
    return this.audioElement ? !this.audioElement.paused : false
  }

  dispose(): void {
    this.stopFade()
    if (this.audioElement) {
      this.audioElement.pause()
      this.audioElement.src = ''
      this.audioElement = null
    }
  }
}

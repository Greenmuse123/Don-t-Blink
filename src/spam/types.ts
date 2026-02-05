export type VideoBehavior = 'clear' | 'keep' | 'fade'

export interface SpamConfig {
  maxVideos: number
  videoBehavior: VideoBehavior
  fadeOutDurationMs: number
}

export interface SpawnedVideo {
  id: string
  src: string
  element: HTMLVideoElement | HTMLImageElement
  createdAt: number
  x: number
  y: number
  width: number
  height: number
}

export interface SpawnStyle {
  type: 'random' | 'fullscreen' | 'cascade'
}

export function isImageFile(src: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico']
  const lowerSrc = src.toLowerCase()
  return imageExtensions.some(ext => lowerSrc.endsWith(ext))
}

export const DEFAULT_SPAM_CONFIG: SpamConfig = {
  maxVideos: 20,
  videoBehavior: 'keep',
  fadeOutDurationMs: 1000,
}

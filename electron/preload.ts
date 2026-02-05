import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  selectAudioFile: () => Promise<string | null>
  selectVideoFiles: () => Promise<string[]>
  getAppVersion: () => Promise<string>
  spawnPopup: (filePath: string, id: string) => Promise<{ success: boolean; error?: string }>
  clearAllPopups: () => Promise<{ success: boolean }>
  fadeOutPopups: (durationMs: number) => Promise<{ success: boolean }>
  getPopupCount: () => Promise<number>
}

const electronAPI: ElectronAPI = {
  selectAudioFile: () => ipcRenderer.invoke('select-audio-file'),
  selectVideoFiles: () => ipcRenderer.invoke('select-video-files'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  spawnPopup: (filePath: string, id: string) => ipcRenderer.invoke('spawn-popup', filePath, id),
  clearAllPopups: () => ipcRenderer.invoke('clear-all-popups'),
  fadeOutPopups: (durationMs: number) => ipcRenderer.invoke('fade-out-popups', durationMs),
  getPopupCount: () => ipcRenderer.invoke('get-popup-count'),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

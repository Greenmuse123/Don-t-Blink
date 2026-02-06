import { app, BrowserWindow, ipcMain, dialog, WebContents, screen } from 'electron'
import path from 'path'
import { pathToFileURL } from 'url'

let mainWindow: BrowserWindow | null = null

// Store for popup windows
const popupWindows: Map<string, BrowserWindow> = new Map()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    show: false,
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer-dist', 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    // Clean up all popups when main window closes
    clearAllPopups()
  })
}

ipcMain.handle('select-audio-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Select Audio File',
    buttonLabel: 'Select Audio',
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('select-video-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Select Media Files (Videos, Images, GIFs)',
    buttonLabel: 'Select Files',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All Media', extensions: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'] },
      { name: 'Video Files', extensions: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'flv', 'wmv'] },
      { name: 'Images & GIFs', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths
  }
  return []
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// Create a popup window with video/image at random position
function createPopupWindow(filePath: string, id: string): BrowserWindow {
  const displays = screen.getAllDisplays()
  const primaryDisplay = displays[0]
  const { width, height } = primaryDisplay.workAreaSize
  
  // Random position and size
  const popupWidth = 400 + Math.random() * 400
  const popupHeight = 300 + Math.random() * 300
  const x = Math.random() * (width - popupWidth)
  const y = Math.random() * (height - popupHeight)
  
  const popup = new BrowserWindow({
    width: Math.floor(popupWidth),
    height: Math.floor(popupHeight),
    x: Math.floor(x),
    y: Math.floor(y),
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    hasShadow: false,
    resizable: false,
    movable: false,
    show: false, // Start hidden, show after load
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow loading local files
    },
  })
  
  // Load a simple HTML page that displays the media
  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i.test(filePath)
  const fileUrl = pathToFileURL(filePath).href
  
  // Create HTML with error handling and proper loading
  const html = isImage ? `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; overflow: hidden; background: transparent; display: flex; align-items: center; justify-content: center; }
        img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .error { color: white; font-family: sans-serif; padding: 20px; }
      </style>
    </head>
    <body>
      <img src="${fileUrl}" onerror="document.body.innerHTML='<div class=\\'error\\'>Failed to load image</div>'" />
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; overflow: hidden; background: transparent; display: flex; align-items: center; justify-content: center; }
        video { max-width: 100%; max-height: 100%; object-fit: contain; }
        .error { color: white; font-family: sans-serif; padding: 20px; }
      </style>
    </head>
    <body>
      <video src="${fileUrl}" autoplay loop muted playsinline onerror="document.body.innerHTML='<div class=\\'error\\'>Failed to load video</div>'" />
    </body>
    </html>
  `
  
  // Use loadURL with the data URL but with proper base
  popup.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
  
  // Show window only after content loads to prevent broken image icon
  popup.once('ready-to-show', () => {
    popup.show()
  })
  
  // Handle load failures
  popup.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error(`Popup failed to load: ${errorDescription} (${errorCode})`)
  })
  
  popup.on('closed', () => {
    popupWindows.delete(id)
  })
  
  popupWindows.set(id, popup)
  return popup
}

// Clear all popup windows
function clearAllPopups(): void {
  for (const [id, popup] of popupWindows) {
    popup.close()
  }
  popupWindows.clear()
}

// Fade out and clear all popups
async function fadeOutAllPopups(durationMs: number = 1000): Promise<void> {
  const popups = Array.from(popupWindows.values())
  const startTime = Date.now()
  
  return new Promise((resolve) => {
    const fadeStep = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const opacity = 1 - progress
      
      for (const popup of popups) {
        if (!popup.isDestroyed()) {
          popup.setOpacity(opacity)
        }
      }
      
      if (progress < 1) {
        setTimeout(fadeStep, 16)
      } else {
        clearAllPopups()
        resolve()
      }
    }
    fadeStep()
  })
}

// Popup management IPC handlers
ipcMain.handle('spawn-popup', async (_event, filePath: string, id: string) => {
  try {
    createPopupWindow(filePath, id)
    return { success: true }
  } catch (err) {
    console.error('Failed to create popup:', err)
    return { success: false, error: String(err) }
  }
})

ipcMain.handle('clear-all-popups', async () => {
  clearAllPopups()
  return { success: true }
})

ipcMain.handle('fade-out-popups', async (_event, durationMs: number) => {
  await fadeOutAllPopups(durationMs)
  return { success: true }
})

ipcMain.handle('get-popup-count', () => {
  return popupWindows.size
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('web-contents-created', (_event: Electron.Event, contents: WebContents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' }
  })
})

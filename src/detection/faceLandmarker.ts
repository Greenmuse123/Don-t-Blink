import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { FaceLandmarkerResult } from './types'

const DEBUG = true
const log = (...args: unknown[]) => DEBUG && console.log('[faceLandmarker]', ...args)

const FACE_LANDMARKER_MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

let faceLandmarker: FaceLandmarker | null = null
let lastVideoTime = -1

export async function initializeFaceLandmarker(): Promise<void> {
  if (faceLandmarker) {
    log('Already initialized')
    return
  }

  log('Initializing FaceLandmarker...')
  log('Loading WASM from CDN...')

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
  )

  log('WASM loaded, creating FaceLandmarker...')

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: FACE_LANDMARKER_MODEL_PATH,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: false,
  })

  log('FaceLandmarker initialized successfully')
}

export function processVideoFrame(video: HTMLVideoElement): FaceLandmarkerResult {
  if (!faceLandmarker) {
    return { landmarks: null, blendshapes: null, presenceScore: 0 }
  }

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime
    const result = faceLandmarker.detectForVideo(video, performance.now())

    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
      const blendshapes = result.faceBlendshapes?.[0]?.categories
      log('Blendshapes available:', blendshapes ? 'yes' : 'no')
      if (blendshapes) {
        const blinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score ?? 0
        const blinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score ?? 0
        log('Blink scores - left:', blinkLeft.toFixed(3), 'right:', blinkRight.toFixed(3))
      }
      return {
        landmarks: result.faceLandmarks[0],
        blendshapes: blendshapes,
        presenceScore: 1.0,
      }
    }
  }

  return { landmarks: null, blendshapes: null, presenceScore: 0 }
}

export function isFaceLandmarkerReady(): boolean {
  return faceLandmarker !== null
}

export function resetFaceLandmarker(): void {
  faceLandmarker = null
  lastVideoTime = -1
}

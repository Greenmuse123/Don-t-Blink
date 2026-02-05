import { NormalizedLandmark, Category } from '@mediapipe/tasks-vision'

export interface EyeIndices {
  upper: number[]
  lower: number[]
  left: number[]
  right: number[]
}

export interface EyeMetricsResult {
  leftEAR: number
  rightEAR: number
  averageEAR: number
  isClosed: boolean
}

export interface CalibrationData {
  openBaseline: number
  closedBaseline: number
  threshold: number
  timestamp: number
}

export interface DetectionConfig {
  threshold: number
  debounceCloseMs: number
  debounceOpenMs: number
  smoothingAlpha: number
}

export enum EyeState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface FaceLandmarkerResult {
  landmarks: NormalizedLandmark[] | null
  blendshapes: Category[] | null
  presenceScore: number
}

import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { EyeIndices, EyeMetricsResult } from './types'

// MediaPipe FaceLandmarker correct eye landmark indices
// Left eye: 33 (outer), 133 (inner), 159/158 (top), 145/144 (bottom)
// Right eye: 362 (outer), 263 (inner), 386/387 (top), 374/373 (bottom)
export const LEFT_EYE_INDICES: EyeIndices = {
  upper: [159, 158],
  lower: [145, 144],
  left: [33],
  right: [133],
}

export const RIGHT_EYE_INDICES: EyeIndices = {
  upper: [386, 387],
  lower: [374, 373],
  left: [362],
  right: [263],
}

function distance(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  return Math.sqrt(dx * dx + dy * dy)
}

function calculateSingleEyeEAR(
  landmarks: NormalizedLandmark[],
  indices: EyeIndices
): number {
  const upperPoints = indices.upper.map((i) => landmarks[i])
  const lowerPoints = indices.lower.map((i) => landmarks[i])
  const leftPoint = landmarks[indices.left[0]]
  const rightPoint = landmarks[indices.right[0]]

  const verticalDistances: number[] = []
  for (let i = 0; i < Math.min(upperPoints.length, lowerPoints.length); i++) {
    verticalDistances.push(distance(upperPoints[i], lowerPoints[i]))
  }
  const avgVertical =
    verticalDistances.reduce((a, b) => a + b, 0) / verticalDistances.length

  const horizontal = distance(leftPoint, rightPoint)

  if (horizontal === 0) return 0

  return avgVertical / horizontal
}

export function calculateEAR(
  landmarks: NormalizedLandmark[]
): Omit<EyeMetricsResult, 'isClosed'> {
  const leftEAR = calculateSingleEyeEAR(landmarks, LEFT_EYE_INDICES)
  const rightEAR = calculateSingleEyeEAR(landmarks, RIGHT_EYE_INDICES)
  const averageEAR = (leftEAR + rightEAR) / 2

  return { leftEAR, rightEAR, averageEAR }
}

export function smoothEAR(
  newValue: number,
  prevSmoothed: number,
  alpha = 0.3
): number {
  return alpha * newValue + (1 - alpha) * prevSmoothed
}

export function isEyeClosed(ear: number, threshold: number): boolean {
  return ear < threshold
}

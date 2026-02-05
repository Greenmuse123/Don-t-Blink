import { CalibrationData } from './types'

const CALIBRATION_STORAGE_KEY = 'eyes-closed-punisher-calibration'

export function getDefaultCalibration(): CalibrationData {
  return {
    openBaseline: 0.25,
    closedBaseline: 0.05,
    threshold: 0.15,
    timestamp: 0,
  }
}

export function loadCalibration(): CalibrationData | null {
  try {
    const stored = localStorage.getItem(CALIBRATION_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as CalibrationData
    }
  } catch {
    console.warn('Failed to load calibration from localStorage')
  }
  return null
}

export function saveCalibration(data: CalibrationData): void {
  try {
    localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(data))
  } catch {
    console.warn('Failed to save calibration to localStorage')
  }
}

export function calculateThreshold(
  openSamples: number[],
  closedSamples: number[]
): number {
  const openAvg = openSamples.reduce((a, b) => a + b, 0) / openSamples.length
  const closedAvg = closedSamples.reduce((a, b) => a + b, 0) / closedSamples.length
  return (openAvg + closedAvg) / 2
}

export function createCalibrationData(
  openSamples: number[],
  closedSamples: number[]
): CalibrationData {
  const openBaseline = openSamples.reduce((a, b) => a + b, 0) / openSamples.length
  const closedBaseline = closedSamples.reduce((a, b) => a + b, 0) / closedSamples.length
  const threshold = (openBaseline + closedBaseline) / 2

  return {
    openBaseline,
    closedBaseline,
    threshold,
    timestamp: Date.now(),
  }
}

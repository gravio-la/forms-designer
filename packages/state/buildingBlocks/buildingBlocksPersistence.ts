import type { BuildingBlocksState } from './buildingBlocksSlice'

const STORAGE_KEY = 'forms-designer/buildingBlocks/v1'

function isBuildingBlocksState(value: unknown): value is BuildingBlocksState {
  if (!value || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  if (!Array.isArray(o.blocks)) return false
  return o.blocks.every(
    (b: unknown) =>
      b && typeof b === 'object' && typeof (b as Record<string, unknown>).name === 'string'
  )
}

export function loadPersistedBuildingBlocksState(): BuildingBlocksState | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as unknown
    if (!isBuildingBlocksState(parsed)) return undefined
    return parsed
  } catch {
    return undefined
  }
}

export function savePersistedBuildingBlocksState(state: BuildingBlocksState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable
  }
}

export function clearPersistedBuildingBlocksState(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

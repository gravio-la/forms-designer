import { useState } from 'react'
import { useDNDHooksContext } from './DNDHooksContext'
import { DraggableMeta } from '@formswizard/types'

export type ActiveDragState = {
  type: 'DRAGBOX' | 'MOVEBOX'
  componentMeta: DraggableMeta
} | null

/**
 * Returns the current active drag data if a drag is in progress, otherwise null.
 * Works for both DRAGBOX (from toolbox) and MOVEBOX (canvas element being moved).
 */
export function useActiveDrag(): ActiveDragState {
  const { useDndMonitor } = useDNDHooksContext()
  const [activeDrag, setActiveDrag] = useState<ActiveDragState>(null)

  useDndMonitor({
    onDragStart(event) {
      const data = event.active.data.current as ActiveDragState
      setActiveDrag(data)
    },
    onDragEnd() {
      setActiveDrag(null)
    },
    onDragCancel() {
      setActiveDrag(null)
    },
  })

  return activeDrag
}

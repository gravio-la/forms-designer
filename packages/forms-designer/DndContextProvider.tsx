'use client'

import { useState } from 'react'
import type { CollisionDetection } from '@dnd-kit/core'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useDraggable,
  useDndMonitor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { DNDHooksContext } from '@formswizard/react-hooks'
import type { DragData } from '@formswizard/react-hooks'
import { CustomDragPreview } from './components'

export type DndContextProviderProps = {
  children: React.ReactNode
  /** When true (default), renders DragOverlay with CustomDragPreview. Set false for minimal providers. */
  showDragOverlay?: boolean
  /** z-index for the drag overlay when shown. Default 10000. */
  dragOverlayZIndex?: number
}

const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  if (pointerCollisions.length > 0) return pointerCollisions
  return rectIntersection(args)
}

export function DndContextProvider({
  children,
  showDragOverlay = true,
  dragOverlayZIndex = 10000,
}: DndContextProviderProps) {
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveDragData(event.active.data.current as DragData)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveDragData(null)
    if (!over) return
    const onDrop = over.data.current?.onDrop
    if (typeof onDrop === 'function') {
      onDrop(active.data.current as DragData)
    }
  }

  function handleDragCancel() {
    setActiveDragData(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DNDHooksContext.Provider value={{ useDraggable, useDroppable, useDndMonitor }}>
        {children}
        {showDragOverlay && (
          <DragOverlay dropAnimation={null} zIndex={dragOverlayZIndex}>
            {activeDragData ? <CustomDragPreview data={activeDragData} /> : null}
          </DragOverlay>
        )}
      </DNDHooksContext.Provider>
    </DndContext>
  )
}

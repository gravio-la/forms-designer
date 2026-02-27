'use client'

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDndMonitor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { DNDHooksContext } from '@formswizard/react-hooks'
import { DragData } from '@formswizard/react-hooks'

type WizardProviderProps = {
  children: React.ReactNode
}

function handleDragEnd(event: any) {
  const { active, over } = event
  if (!over) return
  const onDrop = over.data.current?.onDrop
  if (typeof onDrop === 'function') {
    onDrop(active.data.current as DragData)
  }
}

export function MinimalWizardProvider({ children }: WizardProviderProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  )

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <DNDHooksContext.Provider value={{ useDraggable, useDroppable, useDndMonitor }}>
        {children}
      </DNDHooksContext.Provider>
    </DndContext>
  )
}

'use client'

import { store } from '@formswizard/state'
import { Provider } from 'react-redux'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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
import { CacheProvider } from '@emotion/react'
import createEmotionCache from './createEmotionCache'
import { ThemeWrapper } from './ThemeWrapper'
import { CustomDragPreview } from './components'
import { useState } from 'react'
import { DragData } from '@formswizard/react-hooks'

const clientSideEmotionCache = createEmotionCache()

type WizardProviderProps = {
  children: React.ReactNode
}

function DndKitProvider({ children }: { children: React.ReactNode }) {
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null)

  // MouseSensor: activates after 5px movement — fast response for mouse and pen (which
  // synthesises mouse events on most browsers).
  // TouchSensor: requires a 200 ms hold before drag starts, matching the standard
  // "long-press to drag" gesture. Scroll within the toolbox works naturally for quick swipes.
  // KeyboardSensor: accessible drag-and-drop via keyboard.
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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DNDHooksContext.Provider value={{ useDraggable, useDroppable, useDndMonitor }}>
        {children}
        <DragOverlay dropAnimation={null}>
          {activeDragData ? <CustomDragPreview data={activeDragData} /> : null}
        </DragOverlay>
      </DNDHooksContext.Provider>
    </DndContext>
  )
}

export function WizardProvider({ children }: WizardProviderProps) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <Provider store={store}>
        <ThemeWrapper>
          <DndKitProvider>
            {children}
          </DndKitProvider>
        </ThemeWrapper>
      </Provider>
    </CacheProvider>
  )
}

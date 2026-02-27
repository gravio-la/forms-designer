'use client'

import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDndMonitor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { DNDHooksContext, DragData } from '@formswizard/react-hooks'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { getTheme } from '@formswizard/theme'
import { CacheProvider } from '@emotion/react'
import createEmotionCache from './createEmotionCache'
import { CustomDragPreview } from './components'
import { useState } from 'react'

const theme = getTheme('dark')
const clientSideEmotionCache = createEmotionCache()

type WizardProviderProps = {
  children: React.ReactNode
}

export function StorelessWizardProvider({ children }: WizardProviderProps) {
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

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragData(null)}
        >
          <DNDHooksContext.Provider value={{ useDraggable, useDroppable, useDndMonitor }}>
            <CssBaseline />
            {children}
            <DragOverlay dropAnimation={null}>
              {activeDragData ? <CustomDragPreview data={activeDragData} /> : null}
            </DragOverlay>
          </DNDHooksContext.Provider>
        </DndContext>
      </ThemeProvider>
    </CacheProvider>
  )
}

import { Fab, useTheme, Zoom } from '@mui/material'

import { useCallback, useMemo, useState } from 'react'
import { useDNDHooksContext, DragData } from '@formswizard/react-hooks'
import { removeFieldOrLayout, useAppDispatch } from '@formswizard/state'
import { DraggableComponent } from '@formswizard/types'

export const TrashFAB: () => JSX.Element = () => {
  const { useDroppable, useDndMonitor } = useDNDHooksContext()
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const transitionDuration = useMemo(
    () => ({
      enter: theme.transitions.duration.enteringScreen,
      exit: theme.transitions.duration.leavingScreen,
    }),
    [theme]
  )
  const handleRemove = useCallback(
    (componentMeta: DraggableComponent) => {
      dispatch(removeFieldOrLayout({ componentMeta }))
    },
    [dispatch]
  )

  // Track any active drag to show/hide the FAB
  const [isDragging, setIsDragging] = useState(false)
  useDndMonitor({
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
    onDragCancel: () => setIsDragging(false),
  })

  // The TrashFAB only acts on MOVEBOX drags (canvas items); DRAGBOX drags are ignored
  const onDrop = useCallback(
    (dragData: DragData) => {
      if (dragData.type === 'MOVEBOX' && dragData.componentMeta) {
        handleRemove(dragData.componentMeta as DraggableComponent)
      }
    },
    [handleRemove]
  )

  const { setNodeRef: dropRef, isOver } = useDroppable({
    id: 'trash-fab',
    data: { onDrop },
  })

  return (
    <>
      <Zoom
        in={isDragging}
        timeout={transitionDuration}
        style={{
          transitionDelay: `${isDragging ? transitionDuration.exit : 0}ms`,
        }}
        unmountOnExit
      >
        <Fab
          ref={dropRef}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 10000,
          }}
          size={isOver ? 'large' : 'medium'}
          aria-label={'delete item'}
          color={'secondary'}
        >
          {'❌'}
        </Fab>
      </Zoom>
    </>
  )
}

import { useCallback } from 'react'
import { UISchemaElement } from '@jsonforms/core'
import { useAppDispatch, insertControl, moveControl } from '@formswizard/state'
import { DraggableComponent, DraggableUISchemaElement } from '@formswizard/types'
import { isUISchemaElementWithPath } from '@formswizard/types'

export type UseDropTargetProps = {
  child: UISchemaElement
  current: UISchemaElement
  isPlaceholder?: Boolean
}

export type DragData = {
  type: 'DRAGBOX' | 'MOVEBOX'
  componentMeta: DraggableComponent | DraggableUISchemaElement
}

export const useDropTarget = ({ child, isPlaceholder = false, current }: UseDropTargetProps) => {
  const dispatch = useAppDispatch()

  const handleDrop = useCallback(
    (componentMeta: DraggableComponent, placeBefore = false) => {
      if (isUISchemaElementWithPath(child) && isUISchemaElementWithPath(current)) {
        dispatch(
          insertControl({
            draggableMeta: componentMeta,
            child,
            current,
            isPlaceholder,
            placeBefore,
          })
        )
      }
    },
    [dispatch, child, isPlaceholder, current]
  )

  const handleMove = useCallback(
    (componentMeta: DraggableComponent | DraggableUISchemaElement, placeBefore = false) => {
      dispatch(
        moveControl({
          draggableMeta: componentMeta,
          child,
          placeBefore,
          isPlaceholder,
        })
      )
    },
    [dispatch, child, isPlaceholder]
  )

  // Drop handler: place after the target element
  const onDrop = useCallback(
    (dragData: DragData) => {
      if (!dragData?.componentMeta) {
        console.warn('componentMeta is undefined in onDrop')
        return
      }
      if (dragData.type === 'MOVEBOX') {
        handleMove(dragData.componentMeta)
      } else {
        handleDrop(dragData.componentMeta as DraggableComponent)
      }
    },
    [handleDrop, handleMove]
  )

  // Drop handler: place before the target element (for "insert before" drop zones)
  const onDropAtStart = useCallback(
    (dragData: DragData) => {
      if (!dragData?.componentMeta) {
        console.warn('componentMeta is undefined in onDropAtStart')
        return
      }
      if (dragData.type === 'MOVEBOX') {
        handleMove(dragData.componentMeta, true)
      } else {
        handleDrop(dragData.componentMeta as DraggableComponent, true)
      }
    },
    [handleDrop, handleMove]
  )

  return {
    onDrop,
    onDropAtStart,
  }
}

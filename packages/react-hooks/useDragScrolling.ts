'use client'
import { useDNDHooksContext } from './DNDHooksContext'
import { useScroll } from './useScroll'

/**
 * Subscribes to drag move events and triggers auto-scroll when the dragged
 * item approaches the top or bottom edge of the viewport.
 */
export function useDragScrolling() {
  const { useDndMonitor } = useDNDHooksContext()
  const { updatePosition } = useScroll()

  useDndMonitor({
    onDragMove(event) {
      // activatorEvent holds the original pointer/mouse/touch event that started the drag.
      // event.delta holds the cumulative offset from the drag start position.
      const activator = event.activatorEvent as PointerEvent | MouseEvent | TouchEvent
      let startY = 0
      if ('touches' in activator) {
        startY = activator.touches[0]?.clientY ?? 0
      } else {
        startY = (activator as PointerEvent | MouseEvent).clientY ?? 0
      }
      const currentY = startY + (event.delta?.y ?? 0)
      updatePosition(currentY)
    },
    onDragEnd() {
      // Reset to center so auto-scroll stops
      updatePosition(window.innerHeight / 2)
    },
    onDragCancel() {
      updatePosition(window.innerHeight / 2)
    },
  })
}

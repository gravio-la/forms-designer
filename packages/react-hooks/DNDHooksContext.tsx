import { createContext, useContext } from 'react'
import {
  useDraggable as useDraggableHook,
  useDroppable as useDroppableHook,
  useDndMonitor as useDndMonitorHook,
} from '@dnd-kit/core'

type DNDHooksContextType = {
  useDraggable: typeof useDraggableHook
  useDroppable: typeof useDroppableHook
  useDndMonitor: typeof useDndMonitorHook
}

export const DNDHooksContext = createContext<DNDHooksContextType>({
  useDraggable: () => {
    throw new Error('useDraggable must be used within a DNDHooksProvider')
  },
  useDroppable: () => {
    throw new Error('useDroppable must be used within a DNDHooksProvider')
  },
  useDndMonitor: () => {
    throw new Error('useDndMonitor must be used within a DNDHooksProvider')
  },
})

export const useDNDHooksContext = () => useContext(DNDHooksContext)

import { useId, useMemo } from 'react'
import { DraggableComponent, DraggableUISchemaElement, JsonSchema } from '@formswizard/types'
import { useDNDHooksContext } from './DNDHooksContext'

type UseDragTargetProps = {
  child?: any
  name?: string
  resolvedSchema?: JsonSchema
}

export const useDragTarget = ({ child, name, resolvedSchema }: UseDragTargetProps) => {
  const { useDraggable } = useDNDHooksContext()
  const uid = useId()

  const componentMeta = useMemo<DraggableComponent | DraggableUISchemaElement>(
    () => ({
      name: name || 'Unknown',
      jsonSchemaElement: resolvedSchema,
      uiSchema: child,
    }),
    [name, child, resolvedSchema]
  )

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `movebox-${uid}`,
    data: {
      type: 'MOVEBOX',
      componentMeta,
    },
  })

  return { setNodeRef, listeners, attributes, isDragging, opacity: isDragging ? 0.5 : 1 }
}

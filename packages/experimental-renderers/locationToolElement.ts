import { DraggableElement } from '@formswizard/types'

export const locationToolElements: DraggableElement[] = [
  {
    name: 'Location',
    ToolIconName: 'Map',
    jsonSchemaElement: {
      type: 'string',
      format: 'wktLiteral',
    },
  },
]

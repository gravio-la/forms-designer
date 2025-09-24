import { FormsDesignerToolCollection } from '@formswizard/types'
import { icons as graviolaIcons } from './icons'
import { graviolaRenderers } from './graviolaRenderers'
import { graviolaDraggableComponents } from './graviolaDraggableComponents'
import { graviolaToolSettings } from './graviolaToolSettings'

// Create icon components for graviola tools

export const graviolaToolsCollection: FormsDesignerToolCollection = {
  info: {
    name: 'graviola-tools',
    description: 'Semantic web and linked data tools for complex data relationships',
    categories: ['semantic', 'linked-data', 'relationships']
  },
  draggableElements: graviolaDraggableComponents,
  iconRegistry: graviolaIcons,
  rendererRegistry: graviolaRenderers,
  toolSettings: graviolaToolSettings,
}

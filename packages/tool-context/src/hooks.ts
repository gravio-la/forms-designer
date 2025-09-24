import { JsonSchema } from '@formswizard/types'
import { useToolContext } from './ToolContext'

// Hook to access icon registry
export const useIconRegistry = () => {
  const { iconRegistry } = useToolContext()
  return iconRegistry
}

// Hook to access renderer registry
export const useRendererRegistry = () => {
  const { rendererRegistry } = useToolContext()
  return rendererRegistry
}

// Hook to access cell renderer registry
export const useCellRendererRegistry = () => {
  const { cellRendererRegistry } = useToolContext()
  return cellRendererRegistry
}

// Hook to access AJV format registry
export const useAjvFormatRegistry = () => {
  const { ajvFormatRegistry } = useToolContext()
  return ajvFormatRegistry
}

// Hook to access tool settings
export const useToolSettings = <T extends JsonSchema = JsonSchema>() => {
  const { toolSettings } = useToolContext<T>()
  return toolSettings
}

// Hook to access draggable elements
export const useDraggableElements = () => {
  const { draggableElements } = useToolContext()
  return draggableElements
}

// Hook to access registered collections
export const useRegisteredCollections = () => {
  const { registeredCollections } = useToolContext()
  return registeredCollections
}

// Hook to check if provider is present
export const useIsToolProviderPresent = () => {
  const { isProviderPresent } = useToolContext()
  return isProviderPresent
}

// Hook to get a specific icon by name
export const useIcon = (iconName: string) => {
  const iconRegistry = useIconRegistry()
  return iconRegistry[iconName]
}

// Hook to get all icons
export const useAllIcons = () => {
  const iconRegistry = useIconRegistry()
  return Object.keys(iconRegistry).map(name => ({
    name,
    component: iconRegistry[name],
  }))
}

// Hook to get draggable elements by category
export const useDraggableElementsByCategory = (category?: string) => {
  const draggableElements = useDraggableElements()
  
  if (!category) {
    return draggableElements
  }
  
  return draggableElements.filter(element => 
    'jsonSchemaElement' in element 
      ? (element.jsonSchemaElement as any).category === category
      : (element.uiSchema as any).category === category
  )
}

// Hook to get tool settings by tester
export const useToolSettingsByTester = <T extends JsonSchema = JsonSchema>(tester: any) => {
  const toolSettings = useToolSettings<T>()
  
  return toolSettings.filter(setting => setting.tester === tester)
}

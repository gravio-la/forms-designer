import { JsonSchema } from '@formswizard/types'
import { useToolContext } from './ToolContext'
import { useMemo } from 'react'
import { JsonFormsRendererRegistryEntry, JsonFormsCellRendererRegistryEntry, createAjv } from '@jsonforms/core'
import formatsPlugin from 'ajv-formats'

type RendererRegistry = JsonFormsRendererRegistryEntry[]
type CellRegistry = JsonFormsCellRendererRegistryEntry[]

export interface PreparedJsonFormsStateOptions {
  isPreview?: boolean
  editingRenderers?: RendererRegistry
  editingCells?: CellRegistry
  normalRenderers?: RendererRegistry
  normalCells?: CellRegistry
}

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
export const useIcon = (iconName?: string) => {
  const iconRegistry = useIconRegistry()
  return iconName ? iconRegistry[iconName] : undefined
}

// Hook to get all icons
export const useAllIcons = () => {
  const iconRegistry = useIconRegistry()
  return Object.keys(iconRegistry).map(name => ({
    name,
    component: iconRegistry[name],
  }))
}

export const useDraggableElementsByComponentType = (componentType?: string) => {
  const draggableElements = useDraggableElements()
  const filteredElements = useMemo(() => {
    if (!componentType) {
      return draggableElements
    }
    return draggableElements.filter(element => 
      (element.componentType || 'tool') === componentType
    )
  }, [draggableElements, componentType])
  return filteredElements
}

// Hook to get tool settings by tester
export const useToolSettingsByTester = <T extends JsonSchema = JsonSchema>(tester: any) => {
  const toolSettings = useToolSettings<T>()
  
  return toolSettings.filter(setting => setting.tester === tester)
}

// Hook to prepare JsonForms state with renderers, cells, and AJV
export const usePreparedJsonFormsState = (options: PreparedJsonFormsStateOptions = {}) => {
  const {
    isPreview = false,
    editingRenderers = [],
    editingCells = [],
    normalRenderers = [],
    normalCells = []
  } = options

  const ownRenderers = useRendererRegistry()
  const ownCells = useCellRendererRegistry()
  const ownAjvFormats = useAjvFormatRegistry()

  const renderers: JsonFormsRendererRegistryEntry[] = useMemo(
    () => [...ownRenderers, ...(!isPreview ? editingRenderers : []), ...normalRenderers],
    [ownRenderers, editingRenderers, normalRenderers, isPreview]
  )

  const cells: JsonFormsCellRendererRegistryEntry[] = useMemo(
    () => [...ownCells, ...(!isPreview ? editingCells : []), ...normalCells],
    [ownCells, editingCells, normalCells, isPreview]
  )

  const ajv = useMemo(
    () => {
      const ajvInstance = createAjv({
        formats: {
          ...formatsPlugin.formats,
          ...ownAjvFormats,
        },
      })
      return ajvInstance
    },
    [ownAjvFormats]
  )

  return { renderers, cells, ajv }
}

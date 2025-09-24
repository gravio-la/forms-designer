import React, { createContext, useContext, useMemo, ReactNode } from 'react'
import { ToolContextValue, ToolProviderProps } from './types'
import { JsonSchema } from '@formswizard/types'

// Context
const ToolContext = createContext<ToolContextValue | null>(null)

// Provider component
export const ToolProvider = <T extends JsonSchema = JsonSchema>({
  children,
  toolCollections,
}: ToolProviderProps<T>) => {
  const contextValue = useMemo(() => {
    // Merge all tool collections into a single registry
    const mergedState = toolCollections.reduce(
      (acc, collection) => ({
        iconRegistry: {
          ...acc.iconRegistry,
          ...(collection.iconRegistry || {}),
        },
        rendererRegistry: [
          ...acc.rendererRegistry,
          ...(collection.rendererRegistry || []),
        ],
        cellRendererRegistry: [
          ...acc.cellRendererRegistry,
          ...(collection.cellRendererRegistry || []),
        ],
        ajvFormatRegistry: {
          ...acc.ajvFormatRegistry,
          ...(collection.ajvFormatRegistry || {}),
        },
        toolSettings: [
          ...acc.toolSettings,
          ...(collection.toolSettings || []),
        ],
        draggableElements: [
          ...acc.draggableElements,
          ...(collection.draggableElements || []),
        ],
        registeredCollections: [
          ...acc.registeredCollections,
          collection.info.name,
        ],
      }),
      {
        iconRegistry: {} as Record<string, any>,
        rendererRegistry: [] as any[],
        cellRendererRegistry: [] as any[],
        ajvFormatRegistry: {} as Record<string, any>,
        toolSettings: [] as any[],
        draggableElements: [] as any[],
        registeredCollections: [] as string[],
      }
    )

    return {
      ...mergedState,
      isProviderPresent: true,
    } as ToolContextValue<T>
  }, [toolCollections])

  return (
    <ToolContext.Provider value={contextValue as unknown as ToolContextValue}>
      {children}
    </ToolContext.Provider>
  )
}

// Hook to use the context
export const useToolContext = <T extends JsonSchema = JsonSchema>(): ToolContextValue<T> => {
  const context = useContext(ToolContext)
  
  if (!context) {
    // Return a default context that warns about missing provider but still works
    console.warn(
      'useToolContext: No ToolProvider found. Using empty registries. ' +
      'Consider wrapping your app with <ToolProvider> to register tool collections.'
    )
    
    return {
      iconRegistry: {},
      rendererRegistry: [],
      cellRendererRegistry: [],
      ajvFormatRegistry: {},
      toolSettings: [],
      draggableElements: [],
      registeredCollections: [],
      isProviderPresent: false,
    }
  }

  return context as unknown as ToolContextValue<T>
}
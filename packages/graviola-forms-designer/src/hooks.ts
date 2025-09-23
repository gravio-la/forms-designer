import { useMemo } from 'react'
import { selectUiSchemas, selectJsonSchemaDefinitions, useAppSelector } from '@formswizard/state'
import { collectPrimaryFields, PrimaryFields } from '@formswizard/graviola-renderers'

/**
 * Hook to get UI schemas from the state
 */
export function useUISchemata() {
  return useAppSelector(selectUiSchemas)
}

/**
 * Hook to easily access primary fields for all definitions.
 * 
 * Returns an object mapping definition names to their primary fields:
 * {
 *   Person: { label: 'firstName', description: 'bio', image: 'photo' },
 *   Company: { label: 'name' }
 * }
 * 
 * @returns PrimaryFields object
 */
export function usePrimaryFields(): PrimaryFields {
  const definitions = useAppSelector(selectJsonSchemaDefinitions)
  
  return useMemo(() => {
    return collectPrimaryFields(definitions)
  }, [definitions])
}

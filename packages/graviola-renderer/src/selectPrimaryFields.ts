import { JsonSchema } from '@formswizard/types'

export type PrimaryFieldType = 'label' | 'description' | 'image'

export type PrimaryFields = {
  [definitionName: string]: {
    label?: string
    description?: string
    image?: string
  }
}

/**
 * Helper function that goes through all definitions and collects primary fields.
 * 
 * For each definition, it looks through top-level properties for x-primaryField markers.
 * If multiple fields are marked for the same purpose (label/description/image), 
 * only the first one is used.
 * If no x-primaryField is found for 'label', it falls back to the first string field.
 * 
 * @param definitions - Record of JSON Schema definitions
 * @returns PrimaryFields object mapping definition names to their primary fields
 */
export function collectPrimaryFields(definitions: Record<string, JsonSchema> | null | undefined): PrimaryFields {
  if (!definitions) {
    return {}
  }
  
  const result: PrimaryFields = {}
  
  Object.entries(definitions).forEach(([definitionName, definition]) => {
    if (!definition || typeof definition !== 'object' || !definition.properties) {
      return
    }
    
    const primaryFields: { label?: string; description?: string; image?: string } = {}
    let firstStringField: string | undefined
    
    // Go through all top-level properties
    Object.entries(definition.properties).forEach(([propertyName, propertySchema]) => {
      if (!propertySchema || typeof propertySchema !== 'object') {
        return
      }
      
      // Check for x-primaryField marker
      const xPrimaryField = (propertySchema as any)['x-primaryField'] as PrimaryFieldType
      
      if (xPrimaryField && ['label', 'description', 'image'].includes(xPrimaryField)) {
        // Only set if not already set (first one wins)
        if (!primaryFields[xPrimaryField]) {
          primaryFields[xPrimaryField] = propertyName
        } else {
          console.debug(`Multiple primary fields found for '${xPrimaryField}' in definition '${definitionName}'. Using first one: '${primaryFields[xPrimaryField]}'`)
        }
      }
      
      // Track first string field as fallback for label
      if (!firstStringField && 
          propertyName.startsWith('@') === false &&
          propertySchema.type === 'string' && 
          !primaryFields.label) {
        firstStringField = propertyName
      }
    })
    
    // If no label field was found via x-primaryField, use first string field
    if (!primaryFields.label && firstStringField) {
      primaryFields.label = firstStringField
    }
    
    // Only add to result if we found at least one field
    if (Object.keys(primaryFields).length > 0) {
      result[definitionName] = primaryFields
    }
  })
  
  return result
}

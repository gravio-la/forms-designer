import { generateDefaultUISchema, UISchemaElement } from '@jsonforms/core'
import { JsonSchema, ScopeOverrides } from '@formswizard/types'
import { deepMap } from './deepMap'

/**
 * Generates a default UI schema with scope overrides.
 * 
 * A scope override looks like 
 * ```json
 * {
 *  "#/properties/name": {
 *    "type": "Control",
 *    "options": {
 *      "dropdown": true
 *    }
 *   }
 * }
 * ```
 * 
 * @param schema - The JSON schema to generate the default UI schema for.
 * @param scopeOverrides - The scope overrides to apply to the default UI schema.
 * @returns The default UI schema with scope overrides.  
 */
export const generateDefaultUISchemaWithScopeOverrides = (schema: JsonSchema, scopeOverrides: ScopeOverrides) => {
  const matchScopeAndReplace = (schemaElement: any) => {
    if (schemaElement.scope && scopeOverrides[schemaElement.scope]) {
      return scopeOverrides[schemaElement.scope]
    }
    return undefined
  }
  const defaultUISchema = generateDefaultUISchema(schema)
  return deepMap(defaultUISchema, matchScopeAndReplace)
}
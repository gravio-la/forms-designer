import type { ToolSettings, JsonSchema, RankedTester } from "@formswizard/types"
import { isJsonSchema } from "@formswizard/types"
import { ToolsettingParts } from "@formswizard/fieldsettings"

import { inlineSemanticFormsRendererTester } from "./inlineSemanticFormsRendererTester"
import { materialArrayOfLinkedItemRendererTester } from "./graviolaRenderers"
import { getDefinitions, getDefintitionKey, resolveSchema } from "@formswizard/utils"

const getAvailableDefinitions = (rootSchema: JsonSchema) => {
  return Object.keys(getDefinitions(rootSchema))
}

const getTypeNameFromDefintion: (defintion: string, rootSchema: JsonSchema) => string = (defintion, rootSchema) => {
  const definition = getDefinitions(rootSchema)[defintion]
  if (!isJsonSchema(definition)) {
    return 'http://schema.org/Thing'
  }
  return (definition as any)?.properties?.['@type']?.const as string || 'http://schema.org/Thing'
}

/**
 * Check if a property is a linked object (has @id and @type properties when resolved)
 */
const isLinkedObjectProperty = (property: JsonSchema, rootSchema: JsonSchema): boolean => {
  if (!isJsonSchema(property)) return false
  
  const resolvedProperty = resolveSchema(property, undefined, rootSchema)
  return Boolean(resolvedProperty?.properties?.['@id'] && resolvedProperty?.properties?.['@type'])
}

/**
 * Check if a property is an array of linked objects (array with items that have @id and @type when resolved)
 */
const isArrayOfLinkedObjectProperty = (property: JsonSchema, rootSchema: JsonSchema): boolean => {
  if (!isJsonSchema(property) || property.type !== 'array') return false
  
  if (typeof property.items === 'object' && property.items !== null) {
    const resolvedItems = resolveSchema(property.items, undefined, rootSchema)
    return Boolean(resolvedItems?.properties?.['@id'] && resolvedItems?.properties?.['@type'])
  }
  
  return false
}

/**
 * Check if a property already has an x-inverseOf extension (should be excluded from dropdown)
 */
const hasInverseOfExtension = (property: JsonSchema): boolean => {
  return Boolean((property as any)['x-inverseOf'])
}

/**
 * Get all available inverse properties from the schema
 */
const getAvailableInverseProperties = (rootSchema: JsonSchema) => {
  const definitions = getDefinitions(rootSchema)
  const definitionsKey = getDefintitionKey(rootSchema)
  const inverseProperties: Array<{ title: string; const: string | null }> = []
  
  // Always add the "not an inverse property" option
  inverseProperties.push({
    title: 'not an inverse Property',
    const: null
  })
  
  // Iterate through all definitions
  Object.keys(definitions).forEach(definitionName => {
    const definition = definitions[definitionName]
    if (!isJsonSchema(definition) || !definition.properties) return
    
    // Iterate through all properties in this definition
    Object.keys(definition.properties).forEach(propertyName => {
      const property = definition.properties![propertyName]
      if (!isJsonSchema(property)) return
      
      // Skip properties that already have inverse relations
      if (hasInverseOfExtension(property)) return
      
      // Check if it's a linked object property (single or array)
      const isLinkedSingle = isLinkedObjectProperty(property, rootSchema)
      const isLinkedArray = isArrayOfLinkedObjectProperty(property, rootSchema)
      
      if (isLinkedSingle || isLinkedArray) {
        // Get the display title - use the property's title if available, otherwise use the property name
        const propertyTitle = (property as any).title || propertyName
        const displayTitle = `${definitionName} -> ${propertyTitle}`
        const propertyPath = `#/${definitionsKey}/${definitionName}/properties/${propertyName}`
        
        inverseProperties.push({
          title: displayTitle,
          const: propertyPath
        })
      }
    })
  })
  
  return inverseProperties
}

const isJsonSchemaObject = (value: any): value is JsonSchema => {
  return isJsonSchema(value) && typeof value === 'object' && value !== null
}

export const graviolaToolSettings: ToolSettings<JsonSchema> = [
  {
    tester: inlineSemanticFormsRendererTester as RankedTester<JsonSchema>,
    mapWizardSchemaToToolData: (wizardSchema, uiSchema) => {
      const typeName = wizardSchema?.$ref?.split('/').pop() || 'Root'
      const inverseOf = (wizardSchema as any)['x-inverseOf']?.inverseOf?.[0] || null
      return {
        dropdown: uiSchema?.options?.dropdown,
        chips: uiSchema?.options?.chips,
        typeName: typeName,
        isInversePropertyOf: inverseOf,
      }
    },
    mapToolDataToWizardSchema: (toolData, wizardSchema, rootSchema) => {
      const defintion = toolData.typeName || 'Root'
      const defiitionsKey = getDefintitionKey(rootSchema)
      const result: JsonSchema = {
        ...wizardSchema,
        $ref: `#/${defiitionsKey}/${defintion}`,
      }
      
      // Handle x-inverseOf extension
      if (toolData.isInversePropertyOf) {
        (result as any)['x-inverseOf'] = {
          inverseOf: [toolData.isInversePropertyOf]
        }
      } else {
        // Remove x-inverseOf if it exists and user selected "not an inverse Property"
        delete (result as any)['x-inverseOf']
      }
      
      return result
    },
    mapToolDataToWizardUischema: (toolData, wizardUiSchema, rootSchema) => {
      const defintion = toolData.typeName
      const typeIRI = defintion ? getTypeNameFromDefintion(defintion, rootSchema) : 'http://schema.org/Thing'
      return {
        ...wizardUiSchema,
        options: {
          ...(wizardUiSchema.options ?? {}),
          dropdown: toolData.dropdown,
          chips: toolData.chips,
          context: {
            typeIRI: typeIRI,
          },
        },
      }
    },
    jsonSchema: (rootSchema) => ({
      type: 'object',
      properties: {
        dropdown: {
          type: 'boolean',
          title: 'show as dropdown',
        },
        chips: {
          type: 'boolean',
          title: 'show as chips',
        },
        typeName: {
          title: 'to which definition should be linked',
          enum: getAvailableDefinitions(rootSchema),
        },
        isInversePropertyOf: {
          title: 'is inverse property of',
          oneOf: getAvailableInverseProperties(rootSchema),
        },
      },
    }),
    toolSettingsMixins: [ToolsettingParts.Title],
  },
  {
    tester: materialArrayOfLinkedItemRendererTester as RankedTester<JsonSchema>,
    mapWizardSchemaToToolData: (wizardSchema, uiSchema) => {
      const typeName = (wizardSchema?.items as JsonSchema | undefined)?.$ref?.split('/').pop() || 'Root'
      const inverseOf = (wizardSchema as any)['x-inverseOf']?.inverseOf?.[0] || null
      return {
        chips: uiSchema?.options?.chips,
        dropdown: uiSchema?.options?.dropdown,
        typeName: typeName,
        isInversePropertyOf: inverseOf,
      }
    },
    mapToolDataToWizardSchema: (toolData, wizardSchema, rootSchema) => {
      const defintion = toolData.typeName
      const definitionsKey = getDefintitionKey(rootSchema)
      const existingItems = isJsonSchemaObject(wizardSchema.items) ? wizardSchema.items : {}
      const result = {
        ...wizardSchema,
        items: {
          ...existingItems,
          $ref: `#/${definitionsKey}/${defintion}`,
        },
      } as JsonSchema
      
      // Handle x-inverseOf extension
      if (toolData.isInversePropertyOf) {
        (result as any)['x-inverseOf'] = {
          inverseOf: [toolData.isInversePropertyOf]
        }
      } else {
        // Remove x-inverseOf if it exists and user selected "not an inverse Property"
        delete (result as any)['x-inverseOf']
      }
      
      return result
    },
    mapToolDataToWizardUischema: (toolData, wizardUiSchema, rootSchema) => {
      const defintion = toolData.typeName
      const typeIRI = defintion ? getTypeNameFromDefintion(defintion, rootSchema) : 'http://schema.org/Thing'
      return {
        ...wizardUiSchema,
        options: {
          ...(wizardUiSchema.options ?? {}),
          dropdown: toolData.dropdown,
          chips: toolData.chips,
          context: {
            typeIRI: typeIRI,
          },
        },
      }
    },
    jsonSchema: (rootSchema) => ({
      type: 'object',
      properties: {
        chips: {
          title: 'show as chips',
          type: 'boolean'
        },

        dropdown: {
          title: 'show as dropdown',
          type: 'boolean'
        },
        typeName: {
          title: 'to which definition should be linked',
          enum: getAvailableDefinitions(rootSchema),
        },
        isInversePropertyOf: {
          title: 'is inverse property of',
          oneOf: getAvailableInverseProperties(rootSchema),
        },
      },
    }),
    toolSettingsMixins: [ToolsettingParts.Title],
  },
]
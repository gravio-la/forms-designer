import { ToolsettingParts } from '@formswizard/fieldsettings'
import type { ToolSetting, JsonSchema } from '@formswizard/types'
import { materialEnumArrayRendererTester } from '@jsonforms/material-renderers'

type OneOfOption = { value: string; title?: string }

/**
 * Detect whether `schema.items` uses the oneOf-const pattern
 * (`{ oneOf: [{ const: "a" }, { const: "b", title: "B" }] }`)
 * as opposed to the plain enum pattern (`{ enum: ["a","b"] }`).
 */
const hasOneOfItems = (schema: JsonSchema): boolean => {
  const items = (schema as any)?.items
  if (!items || typeof items !== 'object' || Array.isArray(items)) return false
  return (
    Array.isArray(items.oneOf) &&
    items.oneOf.length > 0 &&
    items.oneOf.every((entry: any) => entry.const !== undefined)
  )
}

const jsonSchema = (_rootSchema: JsonSchema, selectedSchema: JsonSchema): JsonSchema => {
  if (hasOneOfItems(selectedSchema)) {
    return {
      type: 'object',
      properties: {
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              title: { type: 'string' },
            },
            required: ['value'],
          },
        },
      },
    }
  }
  return {
    type: 'object',
    properties: {
      options: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  }
}

const mapWizardSchemaToToolData = (wizardSchema: JsonSchema | null, _uiSchema: any) => {
  if (!wizardSchema) return { options: [] }
  const items = (wizardSchema as any)?.items
  if (!items) return { options: [] }

  if (hasOneOfItems(wizardSchema)) {
    return {
      options: (items.oneOf as any[]).map((entry: any) => ({
        value: entry.const ?? '',
        ...(entry.title !== undefined ? { title: entry.title } : {}),
      })),
    }
  }

  return { options: items.enum ?? [] }
}

const deduplicateStrings = (values: string[]): string[] => {
  const seen = new Set<string>()
  return values
    .map((v) => v ?? '')
    .filter((v) => {
      if (seen.has(v)) return false
      seen.add(v)
      return true
    })
}

const deduplicateOneOf = (options: OneOfOption[]): OneOfOption[] => {
  const seen = new Set<string>()
  return options
    .map((opt) => ({ ...opt, value: opt.value ?? '' }))
    .filter((opt) => {
      if (seen.has(opt.value)) return false
      seen.add(opt.value)
      return true
    })
}

const mapToolDataToWizardSchema = (toolData: any, wizardSchema: JsonSchema): JsonSchema => {
  if (!Array.isArray(toolData.options)) return wizardSchema as JsonSchema
  const items = (wizardSchema as any)?.items

  if (hasOneOfItems(wizardSchema)) {
    let options = deduplicateOneOf(toolData.options ?? [])
    if (options.length === 0) options = [{ value: '' }]
    return {
      ...wizardSchema,
      items: {
        ...items,
        oneOf: options.map((opt) => ({
          const: opt.value,
          ...(opt.title ? { title: opt.title } : {}),
        })),
      },
    } as JsonSchema
  }

  let enumValues = deduplicateStrings(toolData.options ?? [])
  if (enumValues.length === 0) enumValues = ['']
  return {
    ...wizardSchema,
    items: { ...items, enum: enumValues },
  } as JsonSchema
}

const mapToolDataToWizardUischema = (_toolData: any, wizardUiSchema: any) => ({
  ...wizardUiSchema,
})

const MultiSelectToolSettings: ToolSetting = {
  mapWizardSchemaToToolData,
  mapToolDataToWizardSchema,
  mapToolDataToWizardUischema,
  jsonSchema,
  tester: materialEnumArrayRendererTester,
  toolSettingsMixins: [ToolsettingParts.Title],
}

export default MultiSelectToolSettings

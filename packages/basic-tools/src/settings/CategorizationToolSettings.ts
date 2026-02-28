import { ToolsettingParts } from '@formswizard/fieldsettings'
import type { ToolSetting, JsonSchema, ScopeOverrides } from '@formswizard/types'
import { isLayout, type UISchemaElement } from '@jsonforms/core'

function categoryHasControls(elements: UISchemaElement[]): boolean {
  return elements.some(
    (el) =>
      el.type === 'Control' ||
      (isLayout(el) && categoryHasControls((el as any).elements ?? []))
  )
}

const jsonSchema = {
  type: 'object',
  properties: {
    variant: {
      type: 'string',
      enum: ['stepper', 'tabs'],
      title: 'Variant',
    },
    showNavButtons: {
      type: 'boolean',
      title: 'Show navigation buttons',
    },
    categories: {
      type: 'array',
      title: 'Tabs',
      items: {
        type: 'string',
      },
    },
  },
}

const mapWizardSchemaToToolData = (_wizardSchema: JsonSchema | null, uiSchema: any) => {
  const elements: any[] = uiSchema?.elements ?? []
  return {
    variant: uiSchema?.options?.variant ?? 'stepper',
    showNavButtons: uiSchema?.options?.showNavButtons === true,
    categories: elements.map((el: any) => el.label ?? ''),
  }
}

const mapToolDataToWizardSchema = (_toolData: any, wizardSchema: JsonSchema | null) => {
  return { ...wizardSchema }
}

const mapToolDataToWizardUischema = (toolData: any, wizardUiSchema: any) => {
  const oldElements: any[] = wizardUiSchema?.elements ?? []
  const newLabels: string[] = toolData.categories ?? []

  // Build new elements array: match by index, preserve existing children
  const newElements: any[] = newLabels.map((label: string, idx: number) => {
    if (idx < oldElements.length) {
      return { ...oldElements[idx], label }
    }
    return { type: 'Category', label, elements: [] }
  })

  // Protect categories that were removed but contain Controls -- append them back
  for (let i = newLabels.length; i < oldElements.length; i++) {
    const cat = oldElements[i]
    if (categoryHasControls(cat.elements ?? [])) {
      newElements.push(cat)
    }
  }

  return {
    ...wizardUiSchema,
    elements: newElements,
    options: {
      ...(wizardUiSchema?.options ?? {}),
      variant: toolData.variant ?? 'stepper',
      showNavButtons: toolData.showNavButtons === true,
    },
  }
}

const uischemaScopeOverrides: ScopeOverrides = {
  '#/properties/categories': {
    type: 'Control',
    scope: '#/properties/categories',
    options: {
      showSortButtons: true,
    },
  } as UISchemaElement,
}

const CategorizationToolSettings: ToolSetting = {
  mapWizardSchemaToToolData,
  mapToolDataToWizardSchema,
  mapToolDataToWizardUischema,
  jsonSchema,
  uischemaScopeOverrides,
  tester: (uiSchema) => (uiSchema?.type === 'Categorization' ? 2 : 0),
  toolSettingsMixins: [ToolsettingParts.Title],
}

export default CategorizationToolSettings

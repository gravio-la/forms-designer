import { ToolSetting } from "@formswizard/types"
import { inlineSemanticFormsRendererTester } from "./inlineSemanticFormsRendererTester"

export const graviolaToolSetting: ToolSetting = {
  tester: inlineSemanticFormsRendererTester,
  mapWizardSchemaToToolData: (wizardSchema, uiSchema) => {
    return {
      dropdown: uiSchema?.options?.dropdown,
    }
  },
  mapToolDataToWizardSchema: (toolData, wizardSchema) => {
    return {
      ...wizardSchema,
    }
  },
  mapToolDataToWizardUischema: (toolData, wizardUiSchema) => {
    return {
      ...wizardUiSchema,
      options: {
        ...(wizardUiSchema.options ?? {}),
        dropdown: toolData.dropdown,
      },
    }
  },
  jsonSchema: {
    type: 'object',
    properties: {
      dropdown: { type: 'boolean' },
    },
  },
  toolSettingsMixins: [],
}
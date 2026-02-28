import { ToolSetting, JsonSchema, ScopeOverrides } from '@formswizard/types'

const jsonSchema = {
  type: 'object',
  properties: {
    text: {
      type: 'string',
      title: 'Label text',
    },
  },
}

const mapWizardSchemaToToolData = (wizardSchema: JsonSchema | null, uiSchema: any) => {
  return {
    text: uiSchema.text,
  }
}

const mapToolDataToWizardUischema = (toolData: any, wizardUiSchema: any) => {
  return {
    ...wizardUiSchema,
    text: toolData.text ?? '',
  }
}
const mapToolDataToWizardSchema = (toolData: any, wizardSchema: JsonSchema | null) => {
  return {
    ...wizardSchema,
  }
}

const LabelToolSetting: ToolSetting = {
  mapWizardSchemaToToolData,
  mapToolDataToWizardSchema,
  mapToolDataToWizardUischema,
  jsonSchema,
  tester: (uiSchema) => (['Label', 'Alert'].includes(uiSchema.type) ? 1 : 0),
  toolSettingsMixins: [],
}
export default LabelToolSetting


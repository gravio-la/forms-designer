import { ToolSettingsMixin } from '@formswizard/types'

const TitlePart: ToolSettingsMixin = {
  jsonSchemaElement: {
    label: {
      type: 'string',
    },
  },
  mapWizardToAddonData: (previousData, wizardSchema, uiSchema) => {
    return {
      ...previousData,
      label: uiSchema.label,
    }
  },

  mapAddonDataToWizardUISchema: (toolData, uiSchema, rootSchema) => {
    return {
      ...uiSchema,
      label: toolData.label,
    }
  },
}

const DescriptionPart: ToolSettingsMixin = {
  jsonSchemaElement: {
    description: {
      type: 'string',
    },
  },
  mapWizardToAddonData: (previousData, wizardSchema) => ({
    ...previousData,
    description: wizardSchema?.description ?? '',
  }),
  mapAddonDataToWizardUISchema: (toolData, uiSchema) => uiSchema,
  mapAddonDataToWizardSchema: (toolData, wizardSchema) => {
    const { description } = toolData || {}
    if (description !== undefined && description !== '') {
      return { ...wizardSchema, description }
    }
    const { description: _removed, ...rest } = wizardSchema || {}
    return rest
  },
}

// const TextPart = {
//   jsonSchema: {
//     type: 'object',
//     properties: {
//       label: {
//         type: 'string',
//       },
//     },
//   },
//   mapAddonDataToWizardSchema: null,
//   mapWizardToAddonData: (previousData, wizardSchema: JsonSchema7, uiSchema: any) => {
//     return {
//       ...previousData,
//       label: uiSchema.label,
//     }
//   },

//   mapAddonDataToWizardUISchema: (toolData, uiSchema: any) => {
//     return {
//       ...uiSchema,
//       label: toolData.label,
//     }
//   },
// }

export const ToolsettingParts = {
  Title: TitlePart,
  Description: DescriptionPart,
}


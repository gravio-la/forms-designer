import { ToolSettingsMixin } from '@formswizard/types'

export const DEFAULT_LABEL_IN_UISCHEMA = true

type LabelTarget = 'schema' | 'uiSchema' | 'both'

/**
 * TitlePart — smart label mixin that detects where the label lives and
 * writes back to the same location(s).
 *
 * | Variant | schema.title | uiSchema.label | _labelTarget | Reads from        |
 * |---------|--------------|----------------|--------------|-------------------|
 * | V1      | set          | not set        | 'schema'     | schema.title      |
 * | V2      | not set      | set            | 'uiSchema'   | uiSchema.label    |
 * | V3      | both set     | both set       | 'both'       | uiSchema.label    |
 * | V4      | not set      | not set        | default*     | '' (empty)        |
 *
 * *V4 default is controlled by DEFAULT_LABEL_IN_UISCHEMA.
 */
const TitlePart: ToolSettingsMixin = {
  jsonSchemaElement: {
    label: {
      type: 'string',
    },
  },
  mapWizardToAddonData: (previousData, wizardSchema, uiSchema) => {
    const hasSchemaTitle = wizardSchema?.title != null && wizardSchema.title !== ''
    const hasUiLabel = uiSchema?.label != null && uiSchema.label !== ''

    let labelTarget: LabelTarget
    let label: string

    if (hasSchemaTitle && hasUiLabel) {
      labelTarget = 'both'
      label = uiSchema.label
    } else if (hasSchemaTitle) {
      labelTarget = 'schema'
      label = wizardSchema!.title as string
    } else if (hasUiLabel) {
      labelTarget = 'uiSchema'
      label = uiSchema.label
    } else {
      labelTarget = DEFAULT_LABEL_IN_UISCHEMA ? 'uiSchema' : 'schema'
      label = ''
    }

    return {
      ...previousData,
      label,
      _labelTarget: labelTarget,
    }
  },

  mapAddonDataToWizardUISchema: (toolData, uiSchema) => {
    const target: LabelTarget = toolData?._labelTarget ?? (DEFAULT_LABEL_IN_UISCHEMA ? 'uiSchema' : 'schema')
    if (target === 'uiSchema' || target === 'both') {
      return {
        ...uiSchema,
        label: toolData.label,
      }
    }
    return uiSchema
  },

  mapAddonDataToWizardSchema: (toolData, wizardSchema) => {
    const target: LabelTarget = toolData?._labelTarget ?? (DEFAULT_LABEL_IN_UISCHEMA ? 'uiSchema' : 'schema')
    if (target === 'schema' || target === 'both') {
      const label = toolData?.label
      if (label !== undefined && label !== '') {
        return { ...wizardSchema, title: label }
      }
      const { title: _removed, ...rest } = wizardSchema || {}
      return rest
    }
    return wizardSchema
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


export const ToolsettingParts = {
  Title: TitlePart,
  Description: DescriptionPart,
}


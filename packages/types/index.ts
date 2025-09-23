import {
  Labelable,
  Scopable,
  UISchemaElement,
  JsonFormsRendererRegistryEntry,
  JsonSchema4,
  JsonSchema7,
} from '@jsonforms/core'
import { JSONSchema4, JSONSchema7 } from 'json-schema'

export type JsonSchema = JSONSchema7 | JSONSchema4| JsonSchema4 | JsonSchema7;

export type JsonSchemaDefinition = JsonSchema | boolean

export const isJsonSchema = (
  schema: JsonSchemaDefinition | null | undefined
): schema is JsonSchema => {
  return schema !== null && schema !== undefined && typeof schema === 'object'
}

export type ScopableUISchemaElement = UISchemaElement & Scopable & Labelable

export const isScopableUISchemaElement = (element: any): element is ScopableUISchemaElement => element.scope

export type DraggableMeta = {
  name: string
  ToolIconName?: string
}

export type DraggableComponent = DraggableMeta & {
  jsonSchemaElement: JsonSchema
  uiSchema?: UISchemaElement
}

export type DraggableUISchemaElement = DraggableMeta & {
  uiSchema: UISchemaElement
}

export type DraggableElement = DraggableComponent | DraggableUISchemaElement

export type JsonFormsEditState = {
  jsonSchema: JsonSchema
  uiSchema?: any
  selectedElementKey?: string | null
  editMode: boolean
}

export type TesterContext<T extends JsonSchema = JsonSchema> = {
    rootSchema: T;
    config: any;
}
export type RankedTester<T extends JsonSchema = JsonSchema> = (uischema: UISchemaElement, schema: T, context: TesterContext) => number;

export type ToolSettingsMixin<T extends JsonSchema = JsonSchema> = {
  mapWizardToAddonData: (previousData, wizardSchema: T | null, uiSchema: any) => any
  mapAddonDataToWizardSchema?: (toolData: any, wizardSchema: T, rootSchema: T) => T
  mapAddonDataToWizardUISchema: (toolData: any, uiSchema: any, rootSchema: T) => any
  jsonSchemaElement: T['properties']
}

export type ToolSettingsJsonSchema<T extends JsonSchema = JsonSchema> = T | ((rootSchema: T) => T)

export type ToolSetting<T extends JsonSchema = JsonSchema> = {
  mapWizardSchemaToToolData: (wizardSchema: T | null, uiSchema: any) => any
  mapToolDataToWizardSchema: (toolData: any, wizardSchema: T, rootSchema: T) => T
  mapToolDataToWizardUischema: (toolData: any, wizardUiSchema: any, rootSchema: T) => any
  tester: RankedTester<T>
  jsonSchema: ToolSettingsJsonSchema<T>
  toolSettingsMixins: ToolSettingsMixin<T>[]
}

export type ToolSettingFunction<T extends JsonSchema = JsonSchema> = (jsonSchema: T) => ToolSetting<T>
export type ToolSettings<T extends JsonSchema = JsonSchema> = ToolSetting<T>[]

export type PluggableToolDefinition<T extends JsonSchema = JsonSchema> = {
  rendererRegistry: JsonFormsRendererRegistryEntry[]
  dropRendererRegistry: JsonFormsRendererRegistryEntry[]
  toolSettings: ToolSettings<T>
  toolBoxElements: DraggableElement[]
}

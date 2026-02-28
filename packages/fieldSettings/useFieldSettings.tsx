import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import maxBy from 'lodash-es/maxBy'
import {
  selectSelectedElementJsonSchema,
  selectSelectedPath,
  selectUIElementFromSelection,
  updateJsonSchemaByPath,
  useAppDispatch,
  useAppSelector,
  selectSelectionDisplayName,
  selectJsonSchemaDefinitions,
  selectRootJsonSchema,
} from '@formswizard/state'

import { useToolSettings } from '@formswizard/tool-context'
import { UISchemaElement } from '@jsonforms/core'
import { JsonSchema, ToolSetting, isJsonSchema } from '@formswizard/types'
import { filterNullOrUndef, generateDefaultUISchemaWithScopeOverrides } from '@formswizard/utils'


  



export type ToolSettingsDefinition = {
  setToolDataBuffer: (value: ((prevState: any) => any) | any) => void

  toolSettingsJsonSchema: JsonSchema | null
  selectedElementJsonSchema: JsonSchema | null
  handleChange: (event) => void
  tooldataBuffer: any
  uiSchema: UISchemaElement | null
  selectedPath?: string | null | undefined
  selectionDisplayName: string | null | undefined
}

export function useFinalizedToolSettings(): ToolSettingsDefinition {
  const dispatch = useAppDispatch()
  const [tooldataBuffer, setToolDataBuffer] = useState<any>(null)

  // Use tool settings from context instead of local definitions
  const toolSettingsFromContext = useToolSettings()

  const selectedPath = useAppSelector(selectSelectedPath)
  const rootJsonSchema = useAppSelector(selectRootJsonSchema)
  const UIElementFromSelection = useAppSelector(selectUIElementFromSelection)
  const selectedElementJsonSchema = useAppSelector(selectSelectedElementJsonSchema)
  const definitions = useAppSelector(selectJsonSchemaDefinitions)
  const selectionDisplayName = useAppSelector(selectSelectionDisplayName)
  const prevSelectedPath = useRef(null)
  const stableToolSettingsJsonSchemaRef = useRef<
    Record<string, { schema: JsonSchema; uiSchema: UISchemaElement }> | null
  >(null)
  const context = useMemo(
    () => ({
      rootSchema: rootJsonSchema,
      config: {},
    }),
    [rootJsonSchema]
  )
  const toolSettings = useMemo(() => {
    if (!UIElementFromSelection) return null
    const tool = maxBy(toolSettingsFromContext, (d: ToolSetting) => {
      const num = d.tester && d.tester(UIElementFromSelection, isJsonSchema(selectedElementJsonSchema) ? selectedElementJsonSchema : {}, context)
      return num || null
    })
    if (!tool) return null
    return tool && tool.tester && tool.tester(UIElementFromSelection, isJsonSchema(selectedElementJsonSchema) ? selectedElementJsonSchema : {}, context) > 0
      ? tool
      : null
  }, [selectedElementJsonSchema, UIElementFromSelection, context, definitions])



  const [toolSettingsJsonSchema, toolSettingsUISchema] = useMemo<[JsonSchema | null, UISchemaElement | null]>(
    () => {
      if (!toolSettings || !selectedPath) {
        stableToolSettingsJsonSchemaRef.current = null
        return [null, null]
      }
        
        // If we already have a stable schema for this selection and rootJsonSchema hasn't changed,
        // return the stable version to prevent render loops and flickering
        // But allow updates when selectedPath changes (handled by useEffect reset)
      if (stableToolSettingsJsonSchemaRef.current?.[selectedPath]) {
        const cached = stableToolSettingsJsonSchemaRef.current[selectedPath]
        return [cached.schema, cached.uiSchema]
      }
        
        // Handle function-based jsonSchema that depends on rootJsonSchema
      const selectedSchema = isJsonSchema(selectedElementJsonSchema) ? selectedElementJsonSchema : ({} as JsonSchema)
      const resolvedJsonSchema =
        typeof toolSettings.jsonSchema === 'function'
          ? toolSettings.jsonSchema(rootJsonSchema, selectedSchema)
          : toolSettings.jsonSchema

      const uischemaScopeOverrides =
        typeof toolSettings.uischemaScopeOverrides === 'function'
          ? toolSettings.uischemaScopeOverrides(rootJsonSchema, selectedSchema)
          : toolSettings.uischemaScopeOverrides ?? {}
          
      const computedSchema = {
        ...resolvedJsonSchema,
        properties: {
          ...toolSettings.toolSettingsMixins.reduce(
            (prev, curr) => ({ ...prev, ...curr.jsonSchemaElement }),
            {}
          ),
          ...resolvedJsonSchema.properties,
        },
      } as JsonSchema
        
        
      const computedUISchema = generateDefaultUISchemaWithScopeOverrides(
        computedSchema,
        uischemaScopeOverrides
      )

      // Store the stable schema reference
      stableToolSettingsJsonSchemaRef.current = {}
      stableToolSettingsJsonSchemaRef.current[selectedPath] = {
        schema: computedSchema,
        uiSchema: computedUISchema,
      }

      return [computedSchema, computedUISchema]
    },
    [toolSettings, rootJsonSchema, selectedPath]
  )

  const handleChange = (event) => {
    setToolDataBuffer(event.data)
    if (event.data == null || Object.keys(event.data).length === 0) return
    mapToolToWizard(event.data)
  }

  const getToolData = useCallback(
    () =>
      toolSettings
        ? toolSettings.toolSettingsMixins.reduce(
            (prev, curr) => curr.mapWizardToAddonData(prev, selectedElementJsonSchema ?? null, UIElementFromSelection),
            toolSettings.mapWizardSchemaToToolData(selectedElementJsonSchema ?? null, UIElementFromSelection)
          )
        : null,
    [selectedElementJsonSchema, toolSettings, UIElementFromSelection]
  )

  const mapToolToWizard = useCallback(
    (data) => {
      if (!toolSettings || !UIElementFromSelection || !selectedPath) return
      const updatedJsonSchema = toolSettings.mapToolDataToWizardSchema(data, selectedElementJsonSchema ?? {}, rootJsonSchema)
      const updatedUIschema = toolSettings.mapToolDataToWizardUischema(data, UIElementFromSelection, rootJsonSchema)

      const ToolsettingAddonsSchemaMapper = filterNullOrUndef(
        toolSettings.toolSettingsMixins.map((t) => t.mapAddonDataToWizardSchema)
      )
      const ToolsettingAddonsUISchemaMapper = filterNullOrUndef(
        toolSettings.toolSettingsMixins.map((t) => t.mapAddonDataToWizardUISchema)
      )
      const updatedJsonSchemaFromAddons = ToolsettingAddonsSchemaMapper.reduce(
        (prev, curr) => curr(data, prev, rootJsonSchema),
        updatedJsonSchema
      )
      const updatedUIschemaWithAddons = ToolsettingAddonsUISchemaMapper.reduce(
        (prev, curr) => curr(data, prev, rootJsonSchema),
        updatedUIschema
      )

      dispatch(
        updateJsonSchemaByPath({
          path: selectedPath,
          updatedSchema: updatedJsonSchemaFromAddons,
          updatedUIschema: updatedUIschemaWithAddons,
        })
      )
    },
    [UIElementFromSelection, dispatch, selectedElementJsonSchema, selectedPath, toolSettings, rootJsonSchema]
  )

  useEffect(() => {
    if (prevSelectedPath.current === selectedPath) return
    
    // Reset stable schema when selection changes to allow recomputation for new element
    stableToolSettingsJsonSchemaRef.current = null
    
    setToolDataBuffer(getToolData())
    //@ts-ignore
    prevSelectedPath.current = selectedPath
  }, [getToolData, selectedPath, tooldataBuffer])

  return {
    handleChange,
    uiSchema: toolSettingsUISchema,
    toolSettingsJsonSchema,
    tooldataBuffer,
    setToolDataBuffer,
    selectionDisplayName,
    selectedPath,
    selectedElementJsonSchema: selectedElementJsonSchema ?? null,
  }
}

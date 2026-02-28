import { createSelector, createSlice, PayloadAction, Reducer } from '@reduxjs/toolkit'
import { generateDefaultUISchema, Scopable, UISchemaElement, Paths, isLayout, Layout } from '@jsonforms/core'
import { RootState } from '../store'
import {
  deeplySetNestedProperty,
  deeplyUpdateNestedSchema,
  pathSegmentsToJSONPointer,
  pathSegmentsToPath,
  pathSegmentsToScope,
  pathToPathSegments,
  recursivelyMapSchema,
  removeUISchemaElement,
  scopeToPathSegments,
  updateScopeOfUISchemaElement,
  updateUISchemaElement,
  deeplyRemoveNestedProperty,
  deeplyRenameNestedProperty,
  deeplyUpdateReference,
  resolveScopeWithoutRef,
  resolveSchema,
  getAllScopesInSchema
} from '@formswizard/utils'

import {
  DraggableComponent,
  DraggableUISchemaElement,
  ScopableUISchemaElement,
  JsonSchema,
  UISchemaElementWithPath,
} from '@formswizard/types'
import { exampleInitialState, JsonFormsEditState } from './exampleState'
import jsonpointer from 'jsonpointer'
export const isDraggableComponent = (element: any): element is DraggableComponent =>
  element.name && element.jsonSchemaElement
export const isScopableUISchemaElement = (element: any): element is ScopableUISchemaElement => element.scope
export const isDraggableUISchemaElement = (element: any): element is DraggableUISchemaElement => element.uiSchema
export const selectJsonSchema = (state: RootState) => state.jsonFormsEdit.jsonSchema

export const selectUiSchema = (state: RootState) => state.jsonFormsEdit.uiSchema

export const selectUiSchemas = (state: RootState) => state.jsonFormsEdit.uiSchemas

// export const selectSelectedElementKey = (state: RootState) => state.jsonFormsEdit.selectedElementKey
export const selectSelectedPath = (state: RootState) => state.jsonFormsEdit.selectedPath

//TODO: document further
export const selectUIElementByScope: (uiSchema: UISchemaElement, scope: string) => UISchemaElement | undefined = (
  uiSchema,
  scope
) => {
  //TODO: make this code cleaner by using a functional recursive findestate.jsonSchema.propertiesr
  let uiElement: UISchemaElement | undefined = undefined
  recursivelyMapSchema(uiSchema, (uischema: UISchemaElement) => {
    if (isScopableUISchemaElement(uischema) && uischema.scope === scope) {
      uiElement = uischema
      return uischema as UISchemaElement
    }
  })
  return uiElement
}
export const selectUIElementByPath = (uiSchema: UISchemaElement, path: string) => {
  const pathSegments = path?.split('.') || []
  const scope = pathSegmentsToScope(pathSegments)
  return selectUIElementByScope(uiSchema, scope)
}

export const getParentUISchemaElements: (
  uiSchemaPath: string,
  uiSchema: UISchemaElement
) => UISchemaElement[] | undefined = (uiSchemaPath, uiSchema) => {
  const pathSegments = pathToPathSegments(uiSchemaPath)
  if (pathSegments.length < 2) {
    return []
  }
  const parentPathSegments = pathSegments.slice(0, pathSegments.length - 1)
  return jsonpointer.get(uiSchema, pathSegmentsToJSONPointer(parentPathSegments)) || []
}
export const pathPointsToElements: (uiSchemaPath: string, uiSchema: UISchemaElement) => Boolean = (
  uiSchemaPath,
  uiSchema
) => {
  const pathSegments = pathToPathSegments(uiSchemaPath)
  const parentPathSegments = pathSegments.slice(0, pathSegments.length - 1)
  return Array.isArray(jsonpointer.get(uiSchema, pathSegmentsToJSONPointer(parentPathSegments)))
}

export const findScopeWithinUISchemaElement: (
  uiSchemaPath: string,
  uiSchema: UISchemaElement,
  forward?: boolean
) => { scope: string; offset: number; path: string } | undefined = (uiSchemaPath, uiSchema, forward) => {
  const pathSegments = pathToPathSegments(uiSchemaPath)
  if (pathSegments.length < 2) {
    throw new Error('Invalid path, path should lead to an element part of an array, thus be at least 2 segments long')
  }
  const parentPathSegments = pathSegments.slice(0, pathSegments.length - 1)
  const index = parseInt(pathSegments[pathSegments.length - 1])
  if (isNaN(index)) {
    throw new Error('Invalid path, path should lead to an element part of an array')
  }
  const elements = jsonpointer.get(uiSchema, pathSegmentsToJSONPointer(parentPathSegments))
  if (!Array.isArray(elements)) {
    throw new Error('parent is not an array')
  }

  const test = forward ? (i: number) => i < elements.length : (i: number) => i >= 0,
    incrementor = forward ? 1 : -1
  for (let i = index; test(i); i += incrementor) {
    const scope: string | undefined = (elements[i] as Scopable).scope
    if (scope) {
      return {
        scope,
        offset: i - index,
        path: pathSegmentsToPath([...parentPathSegments, i.toString()]),
      }
    }
  }
  //if we reach this point, we didn't find a scope in the array, so we look in the parent
  if (parentPathSegments.length >= 2) {
    const parentElementPath = pathSegmentsToPath(parentPathSegments.slice(0, parentPathSegments.length - 1))
    return findScopeWithinUISchemaElement(parentElementPath, uiSchema, forward)
  }
  return undefined
}
const getIndexAndParentPathOfUISchemaElement: (uiSchemaPath: string) => {
  index: number | undefined
  parentPath: string | undefined
} = (uiSchemaPath) => {
  const pathSegments = pathToPathSegments(uiSchemaPath)
  if (pathSegments.length < 2) {
    return {
      index: undefined,
      parentPath: undefined,
    }
  }
  const parentPathSegments = pathSegments.slice(0, pathSegments.length - 1)
  const index = parseInt(pathSegments[pathSegments.length - 1])
  return {
    index: isNaN(index) ? undefined : index,
    parentPath: pathSegmentsToPath(parentPathSegments),
  }
}




const concatScope = (groupScope: string, newKey: string) => `${groupScope}/properties/${newKey}`

const getUiSchemaWithScope: (
  uiSchema: UISchemaElement | undefined,
  oldScope: string,
  newScope: string
) => ScopableUISchemaElement = (uiSchema, oldScope, newScope) => {
  const scopedUiSchema = uiSchema && updateScopeOfUISchemaElement(oldScope, newScope, uiSchema)
  return {
    type: 'Control',
    ...(scopedUiSchema || {}),
    scope: newScope,
  }
}

const traverseUISchema = (uiSchema: UISchemaElement, callback: (uiSchema: UISchemaElement) => void) => {
  callback(uiSchema)
  if (isLayout(uiSchema) && uiSchema.elements) {
    uiSchema.elements.forEach(element => traverseUISchema(element, callback))
  }
}

const collectScopes: (uiSchema: UISchemaElement) => string[] = (uiSchema) => {
  const scopes: string[] = []
  traverseUISchema(uiSchema, (uiSchema: UISchemaElement) => {
    if (isScopableUISchemaElement(uiSchema) && uiSchema.scope) {
      scopes.push(uiSchema.scope)
    }
  })
  return scopes
}

/**
 * this function returns the scope of the nearest Group element
 * if any, otherwise it returns null. It traverses up the structure path and collects all scopes,
 * then returns the last one found.
 * @param structurePath the path to the current element
 * @param uiSchema the uiSchema to search in
 */
const getCurrentGroupScope = (structurePath: string | undefined, uiSchema: any): string | null => {
  if (!structurePath) return null
  const structurePathSegments = pathToPathSegments(structurePath)

  // Traverse up the structure path to find all Group element scopes
  let currentElements = uiSchema.elements
  let lastFoundScope: string | null = null

  for (let i = 0; i < structurePathSegments.length - 1; i += 2) {
    const elementIndex = parseInt(structurePathSegments[i + 1])

    if (isNaN(elementIndex) || !currentElements || !currentElements[elementIndex]) {
      continue
    }

    const element = currentElements[elementIndex]

    // Check if this is a Group element with a scope in options
    if (element.type === 'Group' && element.options && element.options.scope) {
      lastFoundScope = element.options.scope
    }

    // Move to the next level
    if (element.elements) {
      currentElements = element.elements
    }
  }

  return lastFoundScope
}



export const jsonFormsEditSlice = createSlice({
  name: 'jsonFormEdit',
  initialState: exampleInitialState,
  reducers: {
    // selectElement: (state: JsonFormsEditState, action: PayloadAction<string | undefined>) => {
    //   state.selectedElementKey = action.payload
    // },
    selectPath: (state: JsonFormsEditState, action: PayloadAction<string | undefined>) => {
      if (state.selectedPath === action.payload) {
        state.selectedPath = undefined
        return
      }
      state.selectedPath = action.payload
    },
    loadTemplate: (state: JsonFormsEditState, action: any) => {
      const templateData = action.payload
      const { jsonSchema, uiSchema } = templateData.Template
      if (!jsonSchema || !uiSchema) {
        return
      }
      // state.selectedElementKey = null

      state.jsonSchema = jsonSchema
      state.uiSchema = uiSchema
    },

    removeField: (state: JsonFormsEditState, action: PayloadAction<{ path: string }>) => {
      const { path } = action.payload
      state.jsonSchema = deeplyRemoveNestedProperty(state.jsonSchema, path)
    },
    updateJsonSchemaByPath: (
      state: JsonFormsEditState,
      action: PayloadAction<{ path: string; updatedSchema: any; updatedUIschema: any }>
    ) => {
      // path is the path to the uiSchema element e.g. elements.0.elements.0
      const { path, updatedSchema, updatedUIschema } = action.payload
      // Root element has path "" -- update it directly; it has no scope so no JSON Schema update needed
      if (path === '') {
        Object.assign(state.uiSchema, updatedUIschema)
        return
      }
      const uiSchema = jsonpointer.get(state.uiSchema, pathSegmentsToJSONPointer(pathToPathSegments(path)))
      jsonpointer.set(state.uiSchema, pathSegmentsToJSONPointer(pathToPathSegments(path)), updatedUIschema)
      // only update json schema if ui schema has a scope
      if (uiSchema?.scope) {
        const rootSchema = {
          ...state.jsonSchema,
          [state.definitionsKey]: {
            Root: state.jsonSchema,
            ...state.definitions,
          },
        } as JsonSchema
        const schema = resolveScopeWithoutRef(rootSchema, uiSchema.scope)
        if (schema) {
          Object.assign(schema, updatedSchema)
        }
      }
    },
    removeFieldOrLayout: (state: JsonFormsEditState, action: PayloadAction<{ componentMeta: DraggableComponent }>) => {
      // instead of using an abritrary path, we use the scope of the uiSchema element to remove the json schema part
      // and the path of the uiSchema element to remove the uiSchema part
      const { uiSchema } = action.payload.componentMeta
      const { path } = uiSchema as any
      if (!path) {
        console.warn('only elements with path are removeable ')
        return
      }
      const pathSegments = pathToPathSegments(path)
      const parent = getParentUISchemaElements(path, state.uiSchema)
      const elIndex = parseInt(pathSegments[pathSegments.length - 1])

      if (path === state.selectedPath) {
        state.selectedPath = undefined
        // state.selectedElementKey = undefined
      }

      if (parent) {
        parent.splice(elIndex, 1)
        // state.uiSchema = removeUISchemaElement(scope, state.uiSchema)
      }
      // if (scope) {
      //   state.jsonSchema = deeplyRemoveNestedProperty(state.jsonSchema, pathSegmentsToPath(scopeToPathSegments(scope)))
      // }
      //  state.jsonSchema = collectSchemaGarbage(state.jsonSchema, state.uiSchema)
    },
    // renameField: (state: JsonFormsEditState, action: PayloadAction<{ path: string; newFieldName: string }>) => {
    //   //TODO: handle renaming key within data produced by the form in the current session
    //   const { path, newFieldName } = action.payload
    //   if (newFieldName.includes('.')) {
    //     throw new Error('Field name cannot contain a dot')
    //   }
    //   const pathSegments = path?.split('.') || []
    //   state.jsonSchema = deeplyRenameNestedProperty(state.jsonSchema, pathSegments, newFieldName)
    //   if (state.uiSchema?.elements) {
    //     const strippedPath = pathSegments.length > 0 ? pathSegments.slice(0, pathSegments.length - 1) : []
    //     const newScope = pathSegmentsToScope([...strippedPath, newFieldName])
    //     const scope = pathSegmentsToScope(pathSegments)
    //     state.uiSchema = updateScopeOfUISchemaElement(scope, newScope, state.uiSchema)
    //   }
    //   //state.uiSchema = updateScopeOfUISchemaElement()
    // },
    renameField: (state: JsonFormsEditState, action: PayloadAction<{ path: string; newFieldName: string }>) => {
      //TODO: handle renaming key within data produced by the form in the current session
      const { path, newFieldName } = action.payload
      if (newFieldName.includes('.')) {
        throw new Error('Field name cannot contain a dot')
      }
      const uiSchema = jsonpointer.get(state.uiSchema, pathSegmentsToJSONPointer(pathToPathSegments(path)))
      state.jsonSchema = deeplyRenameNestedProperty(state.jsonSchema, scopeToPathSegments(uiSchema.scope), newFieldName)
      if (state.uiSchema?.elements) {
        const segments = scopeToPathSegments(uiSchema.scope)
        segments.splice(segments.length - 1, 1, newFieldName)
        const newScope = pathSegmentsToScope(segments)
        // const scope = pathSegmentsToScope(strippedPath)
        state.uiSchema = updateScopeOfUISchemaElement(uiSchema.scope, newScope, state.uiSchema)
      }
      //state.uiSchema = updateScopeOfUISchemaElement()
    },
    renameSchemaDefinition: (state: JsonFormsEditState, action: PayloadAction<{ oldName: string; newName: string }>) => {
      const { oldName, newName } = action.payload
      if (!state.definitions[oldName]) {
        throw new Error(`Definition ${oldName} not found`)
      }
      if (state.definitions[newName]) {
        throw new Error(`Definition ${newName} already exists`)
      }
      state.definitions[newName] = state.definitions[oldName]
      delete state.definitions[oldName]
      state.jsonSchema = deeplyUpdateReference(state.jsonSchema, `#/${state.definitionsKey}/${oldName}`, `#/${state.definitionsKey}/${newName}`)
      if (state.selectedDefinition === oldName) {
        state.selectedDefinition = newName
      }
    },
    addSchemaDefinition: (state: JsonFormsEditState, action: PayloadAction<{ name: string; definition: JsonSchema, uiSchema?: UISchemaElement }>) => {
      const { name, definition, uiSchema } = action.payload
      if (state.definitions[name]) {
        throw new Error(`Definition ${name} already exists`)
      }
      state.definitions[name] = definition
      state.uiSchemas[name] = uiSchema || generateDefaultUISchema(definition as any)
    },
    updateUISchemaByScope: (
      state: JsonFormsEditState,
      action: PayloadAction<{ scope: string; uiSchema: UISchemaElement }>
    ) => {
      const { scope, uiSchema } = action.payload
      state.uiSchema = updateUISchemaElement(scope, uiSchema, state.uiSchema)
    },

    switchDefinition: (state: JsonFormsEditState, action: PayloadAction<{ definition: string }>) => {
      const { definition } = action.payload
      const currentDefinitionKey = state.selectedDefinition
      if (currentDefinitionKey === definition) {
        return
      }

      state.uiSchemas[currentDefinitionKey] = state.uiSchema
      state.definitions[currentDefinitionKey] = state.jsonSchema
      state.selectedPath = undefined

      state.selectedDefinition = definition
      state.uiSchema = state.uiSchemas[definition] || { type: 'VerticalLayout', elements: [] }
      state.jsonSchema = state.definitions[definition] || { type: 'object', properties: {} }
    },
    /**
     *
     * the path is used to find the parent element in the uiSchema
     * the new element is inserted at the index of the parent element
     * to detect the jsonschema path findScope will search backwards in the uiSchema
     * for a scope, if it doesn't find a scope it searches forward, otherwise it will
     * use the root scope
     *
     * and optional uiSchemaPath can be provided to override the path used to find the parent element
     * this is needed for empty layouts
     *
     * @param state
     * @param action
     */

    insertControl: (
      state: JsonFormsEditState,
      action: PayloadAction<{
        child: UISchemaElementWithPath
        current?: UISchemaElementWithPath
        isPlaceholder?: Boolean
        draggableMeta: DraggableComponent | DraggableUISchemaElement
        placeBefore?: Boolean
      }>
    ) => {
      const { child, current, draggableMeta, placeBefore = false, isPlaceholder = false } = action.payload
      if (child.path === undefined) throw 'path is undefined'
      const path = child.path === '' ? 'elements.0' : isPlaceholder ? child.path + '.elements.0' : child.path,
        pathSegments = pathToPathSegments(path),
        oldUISchemaElements = getParentUISchemaElements(path, state.uiSchema),
        elIndex = parseInt(pathSegments[pathSegments.length - 1]),
        targetIndex = elIndex + (placeBefore ? 0 : 1)
      if (isNaN(elIndex)) {
        console.error('cannot get the index of the current ui element, dropped on, the path is', path)
        return
      }

      let uiSchema = draggableMeta.uiSchema || { type: 'Control' }
      if (isDraggableComponent(draggableMeta)) {

        const { name, jsonSchemaElement } = draggableMeta
        const currentGroupScope = getCurrentGroupScope(current?.structurePath, state.uiSchema)

        const groupScope = currentGroupScope || '#'
        const groupPath = scopeToPathSegments(groupScope)
        let newKey = name
        const oldScope = concatScope('#', newKey)
        let newScope = concatScope(groupScope, newKey)
        const scopes = getAllScopesInSchema(state.uiSchema)
        //After collecting all scopes, that are already present in the uiSchema, we probably want to find a unique new name
        for (
          let i = 1;
          scopes.includes(newScope);
          i++
        ) {
          newKey = `${draggableMeta.name}_${i}`
          newScope = concatScope(groupScope, newKey)
        }
        uiSchema = getUiSchemaWithScope(uiSchema, oldScope, newScope)

        if (jsonSchemaElement?.['$ref']) {
          const ref = jsonSchemaElement['$ref']
          const resolvedSchema = resolveSchema(state.jsonSchema, "", state.jsonSchema)
          //get last part of ref
          const refDefinitionKey = ref.split('/').pop() as string
          if (!resolvedSchema) {
            //create a new definition
            state.definitions[refDefinitionKey] = {
              "type": "object",
              "properties": {
                "title": {
                  "type": "string"
                }
              }
            }
          }
        }
        state.jsonSchema = deeplySetNestedProperty(
          state.jsonSchema,
          groupPath,
          newKey,
          jsonSchemaElement,
          true
        )
      }
      if (oldUISchemaElements && uiSchema) {
        oldUISchemaElements.splice(targetIndex, 0, uiSchema)
      } else {
        console.error('cannot insert ui element', uiSchema, 'at index', targetIndex, 'into', oldUISchemaElements)
      }
      // buildSchemaFromUISchema(state.uiSchema)
    },

    moveControl: (
      state: JsonFormsEditState,
      action: PayloadAction<{
        child: UISchemaElement & { path?: string; structurePath?: string }
        uiSchemaPath?: string
        draggableMeta: DraggableComponent | DraggableUISchemaElement
        placeBefore?: Boolean
        isPlaceholder?: Boolean
      }>
    ) => {
      const { child, draggableMeta, placeBefore = false, isPlaceholder = false } = action.payload
      if (child.path === undefined) throw 'elements path of moving component is undefined'
      // When dropping on empty layout placeholder, target path is inside the layout (same as insertControl)
      const targetPath =
        child.path === '' ? 'elements.0' : isPlaceholder ? child.path + '.elements.0' : child.path
      // this is the move target
      const { index, parentPath } = getIndexAndParentPathOfUISchemaElement(targetPath)
      if (index === undefined || !parentPath) {
        console.error('Invalid path of target element')
        return
      }
      // this is the move source
      const { path: sourcePath } = draggableMeta.uiSchema as any
      const { index: sourceIndex, parentPath: sourceParentPath } = getIndexAndParentPathOfUISchemaElement(sourcePath)
      if (sourceIndex === undefined || !sourceParentPath) {
        console.error('Invalid path of move source element')
        return
      }
      if (sourcePath === targetPath || targetPath.startsWith(sourcePath + '.')) {
        console.warn('Cannot move a layout inside itself or its descendants')
        return
      }
      const targetIndex = index + (placeBefore ? 0 : 1)
      // const sourceIndex = getIndexFromPath(sourcePath)

      if (index === undefined || !parentPath) {
        throw new Error(
          'Invalid path, path should lead to an element part of an array, thus be at least 2 segments long'
        )
      }
      // const pointer = pathSegmentsToJSONPointer(pathToPathSegments(parentPath))

      const targetElements = jsonpointer.get(state.uiSchema, pathSegmentsToJSONPointer(pathToPathSegments(parentPath)))
      const sourceElements = jsonpointer.get(
        state.uiSchema,
        pathSegmentsToJSONPointer(pathToPathSegments(sourceParentPath))
      )

      if (!Array.isArray(targetElements) || !Array.isArray(sourceElements)) {
        throw new Error("target or source elements are not an array, can't move element")
      }
      const [movedElement] = sourceElements.splice(sourceIndex, 1)
      targetElements.splice(targetIndex, 0, movedElement)
      state.selectedPath = undefined
    },
    resetWizard: () => structuredClone(exampleInitialState),
    loadImportedSchema: (
      state: JsonFormsEditState,
      action: PayloadAction<{ jsonSchema: JsonSchema; uiSchema: any; uiSchemas?: Record<string, any> }>
    ) => {
      const { jsonSchema, uiSchema, uiSchemas } = action.payload
      if (!jsonSchema || !uiSchema) return

      const definitionsKey: 'definitions' | '$defs' =
        (jsonSchema as any).$defs != null ? '$defs' : jsonSchema.definitions != null ? 'definitions' : 'definitions'
      state.definitionsKey = definitionsKey

      const definitionsBlock = jsonSchema[definitionsKey] as Record<string, JsonSchema> | undefined
      if (definitionsBlock && typeof definitionsBlock === 'object' && definitionsBlock.Root != null) {
        state.jsonSchema = definitionsBlock.Root
        const { Root: _, ...rest } = definitionsBlock
        state.definitions = rest
      } else {
        const { definitions: _d, $defs: _defs, ...rootOnly } = jsonSchema as JsonSchema & { definitions?: unknown; $defs?: unknown }
        state.jsonSchema = rootOnly as JsonSchema
        state.definitions = {}
      }

      state.uiSchema = uiSchema
      state.uiSchemas = uiSchemas && typeof uiSchemas === 'object' ? { ...uiSchemas } : {}
      if (state.uiSchemas.Root == null) {
        state.uiSchemas.Root = uiSchema
      }
        state.selectedDefinition = 'Root'
      state.selectedPath = undefined
    },

    /**
     * AI-friendly reducer: add a single field to the form.
     * parentScope: JSON Schema scope of a nested object parent (e.g. "#/properties/address").
     *             Omit or pass "" to add at root.
     * parentLabel: label of a Category or Group UI element to add the control into.
     *             Takes priority for UI placement when parentScope has no matching Group.
     */
    aiAddField: (
      state: JsonFormsEditState,
      action: PayloadAction<{
        parentScope?: string
        parentLabel?: string
        name: string
        schema: Record<string, unknown>
        required?: boolean
        uiOptions?: Record<string, unknown>
      }>
    ) => {
      const { parentScope, parentLabel, name, schema, required, uiOptions } = action.payload

      // Compute jsonSchema parent path segments from scope
      const jsonParentSegments = parentScope ? scopeToPathSegments(parentScope) : []

      // Add property to jsonSchema (ensurePath creates intermediate objects)
      state.jsonSchema = deeplySetNestedProperty(
        state.jsonSchema,
        jsonParentSegments,
        name,
        schema as JsonSchema,
        true,
      )

      // Handle required array
      if (required) {
        if (jsonParentSegments.length === 0) {
          const reqArr = (state.jsonSchema as any).required
          if (Array.isArray(reqArr)) {
            if (!reqArr.includes(name)) reqArr.push(name)
          } else {
            ;(state.jsonSchema as any).required = [name]
          }
        } else {
          let nested: any = state.jsonSchema
          for (const seg of jsonParentSegments) {
            nested = nested?.properties?.[seg]
          }
          if (nested) {
            if (Array.isArray(nested.required)) {
              if (!nested.required.includes(name)) nested.required.push(name)
            } else {
              nested.required = [name]
            }
          }
        }
      }

      // Build full JSON Forms scope for the new Control
      const fullScope = parentScope
        ? `${parentScope}/properties/${name}`
        : `#/properties/${name}`

      const control: UISchemaElement = {
        type: 'Control',
        scope: fullScope,
        ...(uiOptions ? { options: uiOptions } : {}),
      } as any

      // Insert Control into uiSchema: search by parentScope (Group) or parentLabel (Category)
      const appended = aiAppendToLayout(state.uiSchema as any, control, parentScope, parentLabel)
      if (!appended && state.uiSchema && isLayout(state.uiSchema as any)) {
        ;(state.uiSchema as any as Layout).elements.push(control)
      }
    },

    /**
     * AI-friendly reducer: add a layout container (Categorization, Category, Group, etc.).
     * parentScope: find a Group by options.scope to nest inside.
     * parentLabel: find a layout by label to nest inside (useful for Categories).
     * scope: when the new layout is a Group backed by a jsonSchema sub-object, set this
     *        as options.scope AND ensure the jsonSchema path exists.
     */
    aiAddLayout: (
      state: JsonFormsEditState,
      action: PayloadAction<{
        parentScope?: string
        parentLabel?: string
        layoutType: 'Group' | 'Category' | 'Categorization' | 'VerticalLayout' | 'HorizontalLayout'
        label?: string
        scope?: string
        options?: Record<string, unknown>
        /** JSON Forms rule placed at the TOP LEVEL of the element (not inside options).
         *  e.g. { "effect": "HIDE", "condition": { "scope": "#/properties/motorisiert", "schema": { "const": false } } } */
        rule?: Record<string, unknown>
      }>
    ) => {
      const { parentScope, parentLabel, layoutType, label, scope, options, rule } = action.payload

      const layoutOptions: Record<string, unknown> = {
        ...(scope ? { scope } : {}),
        ...(options ?? {}),
      }

      const newLayout: UISchemaElement = {
        type: layoutType,
        elements: [],
        ...(label !== undefined ? { label } : {}),
        ...(rule !== undefined ? { rule } : {}),
        ...(Object.keys(layoutOptions).length > 0 ? { options: layoutOptions } : {}),
      } as any

      const appended = aiAppendToLayout(state.uiSchema as any, newLayout, parentScope, parentLabel)
      if (!appended) {
        if (state.uiSchema && isLayout(state.uiSchema as any)) {
          ;(state.uiSchema as any as Layout).elements.push(newLayout)
        } else {
          state.uiSchema = { type: 'VerticalLayout', elements: [newLayout] } as any
        }
      }

      // If Group is backed by a jsonSchema object, ensure the path exists
      if (scope && layoutType === 'Group') {
        const segments = scopeToPathSegments(scope)
        if (segments.length > 0) {
          const lastName = segments[segments.length - 1] as string
          const parentSegments = segments.slice(0, -1)
          try {
            state.jsonSchema = deeplySetNestedProperty(
              state.jsonSchema,
              parentSegments,
              lastName,
              { type: 'object', properties: {} } as JsonSchema,
              true,
            )
          } catch {
            // path already exists — no-op
          }
        }
      }
    },

    /**
     * AI-friendly reducer: remove a field or layout by its JSON Forms scope.
     * Removes the Control/layout from uiSchema and the corresponding property from jsonSchema.
     */
    aiRemoveElement: (
      state: JsonFormsEditState,
      action: PayloadAction<{ scope: string }>
    ) => {
      const { scope } = action.payload

      // Remove from uiSchema
      const next = removeUISchemaElement(scope, state.uiSchema as UISchemaElement)
      if (next) state.uiSchema = next as any

      // Remove from jsonSchema (only meaningful for Controls, not bare layouts)
      const segments = scopeToPathSegments(scope)
      if (segments.length > 0) {
        try {
          state.jsonSchema = deeplyRemoveNestedProperty(
            state.jsonSchema,
            pathSegmentsToPath(segments),
          )
        } catch {
          // property might not exist — no-op
        }
      }
    },

    /**
     * AI-friendly reducer: update the JSON Schema and/or UI options of an existing field.
     * scope: the full JSON Forms scope of the field (e.g. "#/properties/vorname").
     */
    aiUpdateField: (
      state: JsonFormsEditState,
      action: PayloadAction<{
        scope: string
        schema?: Record<string, unknown>
        required?: boolean
        uiOptions?: Record<string, unknown>
      }>
    ) => {
      const { scope, schema, required, uiOptions } = action.payload
      const segments = scopeToPathSegments(scope)

      // Update jsonSchema property
      if (schema && segments.length > 0) {
        try {
          state.jsonSchema = deeplyUpdateNestedSchema(
            state.jsonSchema,
            segments,
            schema as JsonSchema,
          )
        } catch {
          // field does not exist — no-op
        }
      }

      // Update required array on parent
      if (required !== undefined && segments.length > 0) {
        const fieldName = segments[segments.length - 1] as string
        const parentSegments = segments.slice(0, -1)
        let parent: any = state.jsonSchema
        for (const seg of parentSegments) {
          parent = parent?.properties?.[seg]
        }
        if (parent) {
          if (required) {
            if (!Array.isArray(parent.required)) parent.required = []
            if (!parent.required.includes(fieldName)) parent.required.push(fieldName)
          } else if (Array.isArray(parent.required)) {
            parent.required = parent.required.filter((r: string) => r !== fieldName)
          }
        }
      }

      // Update uiSchema Control options
      if (uiOptions !== undefined) {
        const updated = recursivelyMapSchema(state.uiSchema as UISchemaElement, (el) => {
          if ((el as any).scope === scope) {
            return { ...el, options: { ...((el as any).options ?? {}), ...uiOptions } } as UISchemaElement
          }
          return el
        })
        if (updated) state.uiSchema = updated as any
      }
    },

    /**
     * AI-friendly reducer: rename a field identified by its current scope.
     * Delegates to the existing renameField logic after translating scope → path.
     */
    aiRenameField: (
      state: JsonFormsEditState,
      action: PayloadAction<{ scope: string; newName: string }>
    ) => {
      const { scope, newName } = action.payload
      const segments = scopeToPathSegments(scope)
      if (segments.length === 0) return

      // Find the uiSchema Control path for this scope using jsonpointer lookup
      let uiSchemaPath: string | undefined
      recursivelyMapSchema(state.uiSchema as UISchemaElement, (el) => {
        if ((el as any).scope === scope && (el as any).path !== undefined) {
          uiSchemaPath = (el as any).path
        }
        return el
      })

      if (!uiSchemaPath) return

      // Re-use existing renameField logic
      state.jsonSchema = deeplyRenameNestedProperty(state.jsonSchema, segments, newName)
      if (state.uiSchema?.elements) {
        const newScope = pathSegmentsToScope([...segments.slice(0, -1), newName])
        state.uiSchema = updateScopeOfUISchemaElement(scope, newScope, state.uiSchema as UISchemaElement) as any
      }
    },

    /**
     * AI-friendly reducer: move an existing Control to a different layout container.
     * Only operates on the uiSchema — the jsonSchema is untouched because the field
     * keeps its scope and property definition.
     *
     * scope:              Full JSON Forms scope of the Control to move, e.g. "#/properties/verfuegbarVon".
     * targetParentLabel:  Label of the target layout to move into (e.g. "Von-Bis").
     * targetParentScope:  options.scope of the target Group (alternative to label).
     *
     * If the target layout is not found, the element is appended to the root.
     */
    aiMoveElement: (
      state: JsonFormsEditState,
      action: PayloadAction<{
        scope: string
        targetParentLabel?: string
        targetParentScope?: string
      }>
    ) => {
      const { scope, targetParentLabel, targetParentScope } = action.payload

      // 1. Clone the element BEFORE reassigning state.uiSchema (draft proxy safety)
      const element = aiFindControlByScope(state.uiSchema, scope)
      if (!element) return

      // 2. Remove from current location (returns a new plain object)
      const withoutElement = removeUISchemaElement(scope, state.uiSchema as UISchemaElement)
      if (withoutElement) state.uiSchema = withoutElement as any

      // 3. Insert into target layout; fall back to root append when not found
      const appended = aiAppendToLayout(state.uiSchema as any, element, targetParentScope, targetParentLabel)
      if (!appended && state.uiSchema && isLayout(state.uiSchema as any)) {
        ;(state.uiSchema as any as Layout).elements.push(element)
      }
    },

    /**
     * AI-friendly reducer: update top-level properties of a layout element.
     *
     * Finds the layout by label (primary, works for Category/Group) or by
     * options.scope (secondary, for Groups backed by a JSON Schema object).
     *
     * Supports:
     *   rule       — sets/replaces the JSON Forms rule directly on the element (NOT inside options)
     *   options    — merges into element.options
     *   newLabel   — renames the element
     *
     * This is the correct way to apply SHOW/HIDE rules to layout containers.
     */
    aiUpdateLayout: (
      state: JsonFormsEditState,
      action: PayloadAction<{
        label?: string
        scope?: string
        rule?: Record<string, unknown>
        options?: Record<string, unknown>
        newLabel?: string
      }>
    ) => {
      const { label, scope, rule, options, newLabel } = action.payload

      const updated = recursivelyMapSchema(state.uiSchema as UISchemaElement, (el) => {
        const matchByLabel = label !== undefined && (el as any).label === label
        const matchByScope = scope !== undefined && (el as any).options?.scope === scope

        if (matchByLabel || matchByScope) {
          return {
            ...el,
            ...(rule !== undefined ? { rule } : {}),
            ...(newLabel !== undefined ? { label: newLabel } : {}),
            ...(options !== undefined
              ? { options: { ...((el as any).options ?? {}), ...options } }
              : {}),
          } as UISchemaElement
        }
        return el
      })

      if (updated) state.uiSchema = updated as any
    },
  },
})

/**
 * Recursively find a Control element by its scope.
 * Returns a plain-object clone (not an Immer draft proxy) so it's safe
 * to re-insert after the parent uiSchema has been reassigned.
 */
function aiFindControlByScope(uiElement: any, scope: string): UISchemaElement | null {
  if (!uiElement || typeof uiElement !== 'object') return null
  if ((uiElement as any).scope === scope) {
    // JSON-round-trip to detach from Immer draft proxy before reassignment
    return JSON.parse(JSON.stringify(uiElement)) as UISchemaElement
  }
  for (const child of ((uiElement as any).elements ?? [])) {
    const found = aiFindControlByScope(child, scope)
    if (found) return found
  }
  return null
}

/**
 * Recursively search uiSchema for a layout container matching parentScope (via options.scope)
 * or parentLabel (via label). Appends newElement to the matching container's elements.
 * Returns true if the element was successfully appended.
 */
function aiAppendToLayout(
  uiElement: any,
  newElement: UISchemaElement,
  parentScope?: string,
  parentLabel?: string,
): boolean {
  if (!uiElement || typeof uiElement !== 'object') return false
  if (!isLayout(uiElement)) return false

  const el = uiElement as any
  const matchByScope = parentScope && el.options?.scope === parentScope
  const matchByLabel = parentLabel && el.label === parentLabel

  if (matchByScope || matchByLabel) {
    if (!uiElement.elements) uiElement.elements = []
    uiElement.elements.push(newElement)
    return true
  }

  for (const child of (uiElement.elements ?? [])) {
    if (aiAppendToLayout(child, newElement, parentScope, parentLabel)) {
      return true
    }
  }
  return false
}

export const {
  insertControl,
  // selectElement,
  selectPath,
  renameField,
  removeFieldOrLayout,
  removeField,
  switchDefinition,
  updateUISchemaByScope,
  updateJsonSchemaByPath,
  loadTemplate,
  moveControl,
  renameSchemaDefinition,
  addSchemaDefinition,
  resetWizard,
  loadImportedSchema,
  aiAddField,
  aiAddLayout,
  aiRemoveElement,
  aiUpdateField,
  aiRenameField,
  aiMoveElement,
  aiUpdateLayout,
} = jsonFormsEditSlice.actions

export const jsonFormsEditReducer: Reducer<JsonFormsEditState> = jsonFormsEditSlice.reducer


export const selectUIElementFromSelection: (state: RootState) => UISchemaElement | ScopableUISchemaElement | null =
  createSelector(selectSelectedPath, selectUiSchema, (selectedPath, uiSchema) => {
    if (selectedPath == null) return null
    // Root element has path "" -- return the root uiSchema directly
    if (selectedPath === '') return uiSchema
    // if type is layout name is actually an index
    if (selectedPath.includes('-')) {
      const [UiElementType, UiElementName] = selectedPath.split('-')
      return null
    }
    return jsonpointer.get(uiSchema, pathSegmentsToJSONPointer(pathToPathSegments(selectedPath))) as
      | UISchemaElement
      | ScopableUISchemaElement
  })

export const selectSelectedElementJsonSchema: (state: RootState) => JsonSchema | null | undefined = createSelector(
  selectJsonSchema,
  selectUIElementFromSelection,
  (jsonSchema, selectedUiSchema) => {
    if (!selectedUiSchema || !isScopableUISchemaElement(selectedUiSchema) || !selectedUiSchema.scope) {
      return null
    }

    return resolveScopeWithoutRef(jsonSchema, selectedUiSchema.scope)
  }
)

export const selectJsonSchemaDefinitions: (state: RootState) => Record<string, JsonSchema> | null =
  (state: RootState) => {
    return state.jsonFormsEdit.definitions
  }

export const selectCurrentDefinition: (state: RootState) => string = (state: RootState) => {
  return state.jsonFormsEdit.selectedDefinition
}

export const selectSelectionDisplayName: (state: RootState) => string | null = createSelector(
  selectSelectedElementJsonSchema,
  selectUIElementFromSelection,
  (selectedJsonSchema, selectedUiSchema) => {
    if (selectedUiSchema && isScopableUISchemaElement(selectedUiSchema)) {
      return prettyPrintScope(selectedUiSchema.scope)
    }
    if (selectedJsonSchema?.title || (selectedUiSchema as any)?.label) {
      return selectedJsonSchema?.title || (selectedUiSchema as any)?.label || null
    }
    // Pure UI elements (Label, Alert) have no scope; show type for display
    if (selectedUiSchema?.type && ['Label', 'Alert'].includes(selectedUiSchema.type)) {
      return selectedUiSchema.type
    }
    // Layout types at root (Group, Categorization, VerticalLayout, HorizontalLayout)
    if (selectedUiSchema?.type) {
      const variant = (selectedUiSchema as any)?.options?.variant
      if (selectedUiSchema.type === 'Categorization') {
        return variant === 'tabs' ? 'Tabs' : 'Stepper'
      }
      return selectedUiSchema.type
    }
    return null
  }
)
export const selectSelectedKeyName: (state: RootState) => string | null = createSelector(
  selectSelectedElementJsonSchema,
  selectUIElementFromSelection,
  (selectedJsonSchema, selectedUiSchema) => {
    if (!selectedJsonSchema) {
      return null
    }
    if (isScopableUISchemaElement(selectedUiSchema)) {
      return selectedUiSchema?.scope?.split('/').pop() ?? null
    }
    return null
  }
)

export const selectRootJsonSchema: (state: RootState) => JsonSchema = createSelector(
  [
    selectJsonSchema,
    selectJsonSchemaDefinitions,
    (state: RootState) => state.jsonFormsEdit.definitionsKey,
  ],
  (jsonSchema, definitions, definitionsKey) => {
    return {
      ...jsonSchema,
      [definitionsKey]: {
        Root: jsonSchema,
        ...definitions,
      },
    } as JsonSchema
  }
)

const prettyPrintScope = (scope) =>
  scope
    .split('/')
    .filter((s) => s !== '#' && s !== 'properties')
    .join(' > ')

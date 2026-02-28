import type { JsonSchema, DraggableComponent } from '@formswizard/types'
import type { UISchemaElement } from '@jsonforms/core'
import cloneDeep from 'lodash-es/cloneDeep'
import last from 'lodash-es/last'
import { getAllScopesInSchema, scopeToPathSegments } from '@formswizard/utils'

export type ResolveSchemaFn = (
  rootSchema: JsonSchema,
  scope: string,
  rootSchemaForResolving: JsonSchema
) => JsonSchema

export interface AddBuildingBlockPayload {
  item: {
    componentMeta: {
      uiSchema: UISchemaElement & { label?: string; scope?: string }
    }
  }
  jsonSchema: JsonSchema
  ToolIconName?: string
}

/**
 * Build a minimal JSON Schema object containing only the properties referenced
 * by the scopes found in the uiSchema.
 *
 * Each scope like `#/properties/address/properties/street` is resolved against
 * the full jsonSchema, then placed at the correct nested position inside the
 * returned block schema.
 *
 * NOTE: $ref resolution inside resolved sub-schemas is NOT yet supported.
 * A future implementation should copy referenced definitions into the block.
 */
export function buildBlockSchema(
  scopes: string[],
  rootSchema: JsonSchema,
  resolveSchema: ResolveSchemaFn
): JsonSchema {
  const blockSchema: JsonSchema & { properties: Record<string, any> } = {
    type: 'object',
    properties: {},
  }

  for (const scope of scopes) {
    const resolvedLeafSchema = resolveSchema(rootSchema, scope, rootSchema)
    const segments = scopeToPathSegments(scope)

    if (segments.length === 0) continue

    let current: Record<string, any> = blockSchema.properties
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const isLast = i === segments.length - 1

      if (isLast) {
        current[segment] = cloneDeep(resolvedLeafSchema)
      } else {
        if (!current[segment]) {
          current[segment] = { type: 'object', properties: {} }
        }
        current = current[segment].properties
      }
    }
  }

  return blockSchema
}

/**
 * Given a candidate name and a list of existing names, return a unique variant
 * by appending `_1`, `_2`, etc. if needed.
 */
export function deduplicateBlockName(
  candidate: string,
  existingNames: string[]
): string {
  if (!existingNames.includes(candidate)) return candidate
  for (let i = 1; ; i++) {
    const variant = `${candidate}_${i}`
    if (!existingNames.includes(variant)) return variant
  }
}

/**
 * Derive the group name from the uiSchema: prefer `label`, fall back to the
 * last path segment of `scope`, then "Untitled".
 */
export function deriveGroupName(
  uiSchema: UISchemaElement & { label?: string; scope?: string }
): string {
  if (uiSchema.label) return uiSchema.label
  if (uiSchema.scope) {
    const segments = scopeToPathSegments(uiSchema.scope)
    return (last(segments) as string) ?? 'Untitled'
  }
  return 'Untitled'
}

/**
 * Pure function that produces the DraggableComponent to be stored as a
 * building block.
 */
export function createBuildingBlock(
  payload: AddBuildingBlockPayload,
  existingBlockNames: string[],
  resolveSchema: ResolveSchemaFn
): DraggableComponent {
  const { item, jsonSchema, ToolIconName } = payload
  const uiSchema = item.componentMeta.uiSchema
  const scopes = getAllScopesInSchema(uiSchema)

  const rawName = deriveGroupName(uiSchema)
  const name = deduplicateBlockName(rawName, existingBlockNames)

  const jsonSchemaElement = buildBlockSchema(scopes, jsonSchema, resolveSchema)

  return {
    name,
    uiSchema,
    jsonSchemaElement,
    ToolIconName,
  }
}

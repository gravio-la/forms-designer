import type { JsonSchema, DraggableComponent } from '@formswizard/types'
import { isLayout, type UISchemaElement } from '@jsonforms/core'
import cloneDeep from 'lodash-es/cloneDeep'
import last from 'lodash-es/last'
import {
  getAllScopesInSchema,
  scopeToPathSegments,
  pathSegmentsToScope,
  updateScopeOfUISchemaElement,
} from '@formswizard/utils'

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
 * Compute the longest common prefix across all path segment arrays.
 * For a single non-empty array, returns all but the last segment (the leaf),
 * so the leaf property is always preserved in the block schema.
 */
function computeCommonPrefix(segsArray: string[][]): string[] {
  const nonempty = segsArray.filter((s) => s.length > 0)
  if (nonempty.length === 0) return []
  if (nonempty.length === 1) return nonempty[0].slice(0, -1)
  const first = nonempty[0]
  let prefixLen = first.length
  for (const segs of nonempty.slice(1)) {
    let i = 0
    while (i < prefixLen && i < segs.length && segs[i] === first[i]) i++
    prefixLen = i
  }
  return first.slice(0, prefixLen)
}

/**
 * Build a minimal JSON Schema object containing only the properties referenced
 * by the scopes found in the uiSchema.
 *
 * `prefixLengthToStrip` path segments are removed from the front of every
 * scope before building the nested property tree. This prevents the block's
 * parent-path segments from being duplicated when `insertControl` later wraps
 * the result under the block name key.
 *
 * NOTE: $ref resolution inside resolved sub-schemas is NOT yet supported.
 * A future implementation should copy referenced definitions into the block.
 */
export function buildBlockSchema(
  scopes: string[],
  rootSchema: JsonSchema,
  resolveSchema: ResolveSchemaFn,
  prefixLengthToStrip = 0
): JsonSchema {
  const blockSchema: JsonSchema & { properties: Record<string, any> } = {
    type: 'object',
    properties: {},
  }

  for (const scope of scopes) {
    const resolvedLeafSchema = resolveSchema(rootSchema, scope, rootSchema)
    const segments = scopeToPathSegments(scope).slice(prefixLengthToStrip)

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
 *
 * Only the scopes of the child elements are used for schema extraction —
 * the root Group's own `scope` property is its visual binding, not a field.
 *
 * The common prefix shared by all child scopes is stripped from the block's
 * JSON schema so that `insertControl` doesn't double-wrap properties when it
 * stores the result under the block name key.
 *
 * All uiSchema scopes (including the Group's own) are remapped to start with
 * `#/properties/<name>` so `insertControl`'s scope-remapping logic can find
 * and update them when the block is placed anywhere in the form.
 */
export function createBuildingBlock(
  payload: AddBuildingBlockPayload,
  existingBlockNames: string[],
  resolveSchema: ResolveSchemaFn
): DraggableComponent {
  const { item, jsonSchema, ToolIconName } = payload
  const uiSchema = item.componentMeta.uiSchema

  const rawName = deriveGroupName(uiSchema)
  const name = deduplicateBlockName(rawName, existingBlockNames)

  // Collect scopes from children only — the root Group element's own `scope`
  // is its rendering binding, not a property to extract into the block schema.
  const childElements: UISchemaElement[] = isLayout(uiSchema)
    ? ((uiSchema as any).elements ?? [])
    : []
  const childScopes: string[] = childElements.flatMap((el) => getAllScopesInSchema(el))

  // Compute how many leading path segments to strip so the block schema only
  // contains leaf-level properties (no redundant parent key).
  const allSegments = childScopes.map(scopeToPathSegments).filter((s) => s.length > 0)
  const commonPrefix = computeCommonPrefix(allSegments)

  const jsonSchemaElement = buildBlockSchema(childScopes, jsonSchema, resolveSchema, commonPrefix.length)

  // Normalize ALL uiSchema scopes so they start with #/properties/<name>.
  // When commonPrefix is empty (flat group), use '#' as the base so that every
  // scope of the form #/properties/foo becomes #/properties/<name>/properties/foo.
  // This ensures insertControl's scope-remapping logic always finds a match.
  const originalPrefixScope = commonPrefix.length > 0 ? pathSegmentsToScope(commonPrefix) : '#'
  const targetPrefixScope = `#/properties/${name}`
  const normalizedUiSchema =
    originalPrefixScope !== targetPrefixScope
      ? (updateScopeOfUISchemaElement(originalPrefixScope, targetPrefixScope, uiSchema) ?? uiSchema)
      : uiSchema

  return {
    name,
    uiSchema: normalizedUiSchema,
    jsonSchemaElement,
    ToolIconName,
  }
}

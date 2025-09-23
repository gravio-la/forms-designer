import { InlineCondensedSemanticFormsRenderer, InlineDropdownRenderer, materialArrayChipsLayoutTester, MaterialArrayOfLinkedItemChipsRenderer, MaterialArrayOfLinkedItemRenderer, materialLinkedObjectControlTester, MaterialLinkedObjectRenderer } from '@graviola/edb-linked-data-renderer';
import { and, isObjectArray, JsonFormsRendererRegistryEntry, rankWith, schemaMatches } from '@jsonforms/core';
import { inlineSemanticFormsRendererTester } from './inlineSemanticFormsRendererTester';
import { inlineDropdownRendererTester } from './inlineDropdownRendererTester';
import { resolveSchema } from '@formswizard/utils';

export const materialArrayOfLinkedItemRendererTester = rankWith(
  5,
  schemaMatches((schema, rootSchema) => {
    if (
        schema.type === "array" &&
        typeof schema.items === "object"
    ) {
      const resolvedSchema = resolveSchema(schema.items, undefined, rootSchema)
      return Boolean(resolvedSchema?.properties?.['@id'] && resolvedSchema?.properties?.['@type'])
    }
    return false
  }),
)

export const graviolaRenderers: JsonFormsRendererRegistryEntry[] = [
  {
    tester: inlineDropdownRendererTester,
    renderer: InlineDropdownRenderer,
  },
  {
    tester: materialLinkedObjectControlTester,
    renderer: MaterialLinkedObjectRenderer,
  },
  {
    tester: materialArrayOfLinkedItemRendererTester,
    renderer: MaterialArrayOfLinkedItemRenderer,
  },
  {
    tester: inlineSemanticFormsRendererTester,
    renderer: InlineCondensedSemanticFormsRenderer,
  },
  {
    tester: materialArrayChipsLayoutTester,
    renderer: MaterialArrayOfLinkedItemChipsRenderer,
  },
]
import { InlineCondensedSemanticFormsRenderer, InlineDropdownRenderer, materialLinkedObjectControlTester, MaterialLinkedObjectRenderer } from '@graviola/edb-linked-data-renderer';
import { JsonFormsRendererRegistryEntry } from '@jsonforms/core';
import { inlineSemanticFormsRendererTester } from './inlineSemanticFormsRendererTester';
import { inlineDropdownRendererTester } from './inlineDropdownRendererTester';

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
    tester: inlineSemanticFormsRendererTester,
    renderer: InlineCondensedSemanticFormsRenderer,
  },
]
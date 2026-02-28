import type { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
import { basicRenderer } from '@formswizard/designer-basic-renderer'
import { materialRenderers } from '@jsonforms/material-renderers'
import {
  categorizationPreviewTester,
  MaterialPreviewCategorizationLayoutRenderer,
} from '@formswizard/designer-renderer'

export const renderers: JsonFormsRendererRegistryEntry[] = [
  ...materialRenderers,
  ...basicRenderer,
  {
    tester: categorizationPreviewTester,
    renderer: MaterialPreviewCategorizationLayoutRenderer,
  },
]

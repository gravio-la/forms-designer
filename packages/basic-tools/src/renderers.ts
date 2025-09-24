import { basicRenderer } from '@formswizard/designer-basic-renderer'
import { materialRenderers } from '@jsonforms/material-renderers'

export const renderers = [
  ...materialRenderers,
  ...basicRenderer
]

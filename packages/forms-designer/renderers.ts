import { materialRenderers } from '@jsonforms/material-renderers'
import { basicRenderer } from '@formswizard/designer-basic-renderer'

export const renderers = [
  ...materialRenderers,
  ...basicRenderer
]
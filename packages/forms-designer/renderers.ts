import { materialRenderers } from '@jsonforms/material-renderers'
import { basicRenderer } from '@formswizard/designer-basic-renderer'
import { graviolaRenderers } from '@formswizard/graviola-renderers'

export const renderers = [
  ...materialRenderers,
  ...graviolaRenderers,
  ...basicRenderer
]
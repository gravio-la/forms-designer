import { DraggableComponent } from '@formswizard/types'
import { JsonForms } from '@jsonforms/react'
import { materialCells, materialRenderers } from '@jsonforms/material-renderers'
import { UISchemaElement, JsonSchema as JsonFormsJsonSchema } from '@jsonforms/core'
import { basicRenderer } from '@formswizard/designer-basic-renderer'
import { selectJsonSchemaDefinitions, useAppSelector } from '@formswizard/state'

export const DropTargetFormsPreview: React.FC<{ metadata: DraggableComponent }> = ({ metadata }) => {
  const name = metadata.name
  const definitions = useAppSelector(selectJsonSchemaDefinitions)
  return !name ? null : (
    <>
      {metadata.jsonSchemaElement && (
        <JsonForms
          data={{}}
          renderers={[...materialRenderers, ...basicRenderer]}
          cells={materialCells}
          uischema={
            {
              type: 'VerticalLayout',
              elements: [
                {
                  type: 'Control',
                  scope: `#/properties/${name}`,
                  ...(metadata.uiSchema || {}),
                },
              ],
            } as UISchemaElement
          }
          schema={
            {
              definitions: definitions,
              type: 'object',
              properties: {
                [name]: metadata.jsonSchemaElement,
              },
            } as JsonFormsJsonSchema
          }
        />
      )}
    </>
  )
}

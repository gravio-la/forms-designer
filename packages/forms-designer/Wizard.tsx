import { useCallback, useMemo, useState } from 'react'
import { materialCells } from '@jsonforms/material-renderers'
import { JsonForms } from '@jsonforms/react'
import { useJsonSchema } from '@formswizard/state'
import { selectUiSchema, useAppSelector, selectPreviewModus } from '@formswizard/state'
import { extendUiSchemaWithPath } from '@formswizard/utils'
import {
  horizontalLayoutTester,
  HorizontalLayoutWithDropZoneRenderer,
  verticalLayoutTester,
  VerticalLayoutWithDropZoneRenderer,
} from '@formswizard/designer-renderer'
import { JsonFormsRendererRegistryEntry, JsonSchema as JsonFormsJsonSchema } from '@jsonforms/core'
import { useDragScrolling } from '@formswizard/react-hooks'
import { Box, BoxProps } from '@mui/material'
import { renderers } from './renderers'

const additionalRenderers = [
  {
    tester: verticalLayoutTester,
    renderer: VerticalLayoutWithDropZoneRenderer,
  },
  {
    tester: horizontalLayoutTester,
    renderer: HorizontalLayoutWithDropZoneRenderer,
  },
]

export type WizardProps = {
  renderers?: JsonFormsRendererRegistryEntry[],
}
export function Wizard({ renderers: ownRenderers , ...props }: WizardProps & BoxProps) {
  const [data, setData] = useState({})

  const handleFormChange = useCallback(({ data }: { data: any }) => setData(data), [setData])
  const schema = useJsonSchema()

  const uiSchema = useAppSelector(selectUiSchema)
  const uiSchemaWithPath = useMemo(() => extendUiSchemaWithPath(uiSchema), [uiSchema])
  const previewModus = useAppSelector(selectPreviewModus)
  const finalRenderers: JsonFormsRendererRegistryEntry[] = useMemo(
    () => [...(ownRenderers || []), ...additionalRenderers, ...renderers],
    [ownRenderers]
  )
  const previewRenderers: JsonFormsRendererRegistryEntry[] = useMemo(
    () => [...(ownRenderers || []), ...renderers],
    [ownRenderers]
  )
  useDragScrolling()
  return (
    <Box {...props}>
      <JsonForms
        data={data}
        renderers={previewModus ? previewRenderers : finalRenderers}
        cells={materialCells}
        onChange={handleFormChange}
        schema={schema as JsonFormsJsonSchema}
        uischema={uiSchemaWithPath}
        readonly={!previewModus}
      />
    </Box>
  )
}

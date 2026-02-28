import { materialCells, materialRenderers } from '@jsonforms/material-renderers'
import { JsonForms } from '@jsonforms/react'
import type { JsonSchema as JsonFormsJsonSchema } from '@jsonforms/core'
import { useFinalizedToolSettings } from './useFieldSettings'
import { Box, Divider, Grid } from '@mui/material'
import { useToolContext } from '@formswizard/tool-context'
import { useJsonFormsI18n } from '@formswizard/i18n'
import EditableFieldKeyDisplay from './EditableFieldKeyDisplay'

export function FieldSettingsView() {
  const { handleChange, toolSettingsJsonSchema, tooldataBuffer, uiSchema } = useFinalizedToolSettings()
  const { registeredCollections } = useToolContext()
  const i18n = useJsonFormsI18n(registeredCollections)

  return (
    <>
      <Box sx={{ px: 1.5, py: 1 }}>
        <EditableFieldKeyDisplay />
      </Box>
      <Divider />
      <Grid container direction={'column'} spacing={2} sx={{ p: 2 }}>
        <Grid>
          <Box>
            {!!toolSettingsJsonSchema && !!tooldataBuffer && (
              <JsonForms
                data={tooldataBuffer}
                schema={toolSettingsJsonSchema as JsonFormsJsonSchema}
                uischema={uiSchema || undefined}
                renderers={materialRenderers}
                cells={materialCells}
                onChange={handleChange}
                i18n={i18n}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  )
}

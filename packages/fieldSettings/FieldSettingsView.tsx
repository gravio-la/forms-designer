import { materialCells, materialRenderers } from '@jsonforms/material-renderers'
import { JsonForms } from '@jsonforms/react'
import type { JsonSchema as JsonFormsJsonSchema } from '@jsonforms/core'
import { useToolSettings } from './useFieldSettings'
import { Box, Grid, Toolbar, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'
import { selectPath, useAppDispatch } from '@formswizard/state'

import EditableFieldKeyDisplay from './EditableFieldKeyDisplay'
import { ToolSettings } from '@formswizard/types'

type FieldSettingsViewProps = {
  additionalToolSettings?: ToolSettings
}

export function FieldSettingsView({ additionalToolSettings }: FieldSettingsViewProps) {
  const { handleChange, toolSettingsJsonSchema, tooldataBuffer } = useToolSettings({
    additionalToolSettings,
  })
  const dispatch = useAppDispatch()

  const handleClose = () => {
    dispatch(selectPath(undefined))
  }

  return (
    <>
      <Toolbar sx={{ position: 'relative' }}>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          aria-label="close"
        >
          <Close fontSize="small" />
        </IconButton>
        <EditableFieldKeyDisplay></EditableFieldKeyDisplay>
      </Toolbar>
      <Grid container direction={'column'} spacing={2} sx={{ p: 2 }}>
        <Grid item>
          <Box>
            {!!toolSettingsJsonSchema && !!tooldataBuffer && (
              <JsonForms
                data={tooldataBuffer}
                schema={toolSettingsJsonSchema as JsonFormsJsonSchema}
                renderers={materialRenderers}
                cells={materialCells}
                onChange={handleChange}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, IconButton, Popover, TextField, Button, Tooltip, Typography } from '@mui/material'
import Edit from '@mui/icons-material/Edit'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import {
  renameField,
  removeFieldOrLayout,
  selectUIElementFromSelection,
  useAppDispatch,
  useAppSelector,
} from '@formswizard/state'
import type { DraggableComponent } from '@formswizard/types'
import { useDesignerTranslation } from '@formswizard/i18n'
import { useWizardSelection } from './useWizardSelection'

function EditableFieldKeyDisplay() {
  const dispatch = useAppDispatch()
  const { t } = useDesignerTranslation()
  const { selectedKeyName, selectedPath, selectionDisplayName, selectedElementJsonSchema } = useWizardSelection()
  const UIElementFromSelection = useAppSelector(selectUIElementFromSelection)

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [newKey, setNewKey] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const keyIsEditable = Boolean(selectedKeyName)
  const isRootLayout = selectedPath === ''

  useEffect(() => {
    if (typeof selectedKeyName === 'string') setNewKey(selectedKeyName)
  }, [selectedKeyName])

  const handleOpenRename = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }, [])

  const handleCloseRename = useCallback(() => {
    setAnchorEl(null)
    if (typeof selectedKeyName === 'string') setNewKey(selectedKeyName)
  }, [selectedKeyName])

  const handleConfirmRename = useCallback(() => {
    if (typeof selectedPath !== 'string') return
    dispatch(renameField({ path: selectedPath, newFieldName: newKey }))
    setAnchorEl(null)
  }, [newKey, selectedPath, dispatch])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleConfirmRename()
      if (e.key === 'Escape') handleCloseRename()
    },
    [handleConfirmRename, handleCloseRename],
  )

  const handleDelete = useCallback(() => {
    if (!selectedPath || !UIElementFromSelection) return
    dispatch(
      removeFieldOrLayout({
        componentMeta: {
          name: '',
          jsonSchemaElement: selectedElementJsonSchema || {},
          uiSchema: { ...UIElementFromSelection, path: selectedPath },
        } as unknown as DraggableComponent,
      }),
    )
  }, [dispatch, selectedPath, UIElementFromSelection, selectedElementJsonSchema])

  const popoverOpen = Boolean(anchorEl)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
      <Typography variant="subtitle2" noWrap sx={{ flex: 1, minWidth: 0 }}>
        {selectionDisplayName}
      </Typography>
      {keyIsEditable && (
        <Tooltip title={t('fieldSettings.renameTooltip')}>
          <IconButton size="small" onClick={handleOpenRename}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={isRootLayout ? t('fieldSettings.deleteRootDisabledTooltip') : t('fieldSettings.deleteTooltip')}>
        <span>
          <IconButton size="small" onClick={handleDelete} disabled={isRootLayout}>
            <DeleteOutline fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleCloseRename}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 1.5, display: 'flex', gap: 1, alignItems: 'center' } } }}
        TransitionProps={{
          onEntered: () => inputRef.current?.focus(),
        }}
      >
        <TextField
          inputRef={inputRef}
          size="small"
          label={t('fieldSettings.renameTitle')}
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          sx={{ minWidth: 160 }}
        />
        <Button size="small" variant="contained" onClick={handleConfirmRename} disableElevation>
          {t('fieldSettings.renameConfirm')}
        </Button>
      </Popover>
    </Box>
  )
}

export default EditableFieldKeyDisplay

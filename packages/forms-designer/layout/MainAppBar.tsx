import { IconButton, Tooltip, useTheme, AppBar, Toolbar, Box, ToggleButton, ToggleButtonGroup, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material'
import {
  useAppDispatch,
  toggleColorMode,
  togglePreviewModus,
  selectPreviewModus,
  useAppSelector,
  resetWizard,
  clearPersistedJsonFormsEditState,
} from '@formswizard/state'
import Brightness7 from '@mui/icons-material/Brightness7'
import Brightness4 from '@mui/icons-material/Brightness4'
import NoteAdd from '@mui/icons-material/NoteAdd'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import { ExportSchemaModal, ImportSchemaModal } from '../components'
import { i18nInstance, useDesignerTranslation } from '@formswizard/i18n'
import { useEffect, useState } from 'react'

export function MainAppBar() {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ position: 'relative', flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ResetFormButton />
          <ExportSchemaButton />
          <ImportSchemaButton />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <PreviewModeToggle />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 2,
            marginLeft: 'auto',
          }}
        >
          <LanguageSelector />
          <DarkModeSwitch />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export function PreviewModeToggle() {
  const { t } = useDesignerTranslation()
  const dispatch = useAppDispatch()
  const previewModus = useAppSelector(selectPreviewModus)

  const handleChange = (_: React.MouseEvent<HTMLElement>, value: 'edit' | 'preview' | null) => {
    if (!value) return
    const shouldBePreview = value === 'preview'
    if (shouldBePreview !== previewModus) dispatch(togglePreviewModus())
  }

  return (
    <ToggleButtonGroup
      value={previewModus ? 'preview' : 'edit'}
      exclusive
      onChange={handleChange}
      size="small"
      sx={{ '& .MuiToggleButton-root': { color: 'inherit', borderColor: 'rgba(255,255,255,0.3)', py: 0.5, px: 1.5 } }}
    >
      <ToggleButton value="edit">{t('appBar.edit')}</ToggleButton>
      <ToggleButton value="preview">{t('appBar.preview')}</ToggleButton>
    </ToggleButtonGroup>
  )
}

export function LanguageSelector() {
  const [language, setLanguage] = useState(i18nInstance.language)

  useEffect(() => {
    const handler = (lng: string) => setLanguage(lng)
    i18nInstance.on('languageChanged', handler)
    return () => { i18nInstance.off('languageChanged', handler) }
  }, [])

  const handleChange = (event: SelectChangeEvent<string>) => {
    i18nInstance.changeLanguage(event.target.value)
  }

  return (
    <FormControl size="small">
      <Select
        value={language}
        onChange={handleChange}
        sx={{
          color: 'inherit',
          minWidth: 90,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.23)',
          },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            minHeight: 'auto',
          },
        }}
      >
        <MenuItem value="en">EN</MenuItem>
        <MenuItem value="de">DE</MenuItem>
      </Select>
    </FormControl>
  )
}

export function ResetFormButton() {
  const { t } = useDesignerTranslation()
  const dispatch = useAppDispatch()

  const handleClick = () => {
    if (window.confirm(t('appBar.resetConfirm'))) {
      clearPersistedJsonFormsEditState()
      dispatch(resetWizard())
    }
  }

  return (
    <Tooltip title={t('appBar.newFormTooltip')}>
      <span>
        <IconButton onClick={handleClick} color="inherit" aria-label={t('appBar.newForm')}>
          <NoteAdd />
        </IconButton>
      </span>
    </Tooltip>
  )
}

export function ExportSchemaButton() {
  const { t } = useDesignerTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip title={t('appBar.exportSchemaTooltip')}>
        <span>
          <IconButton onClick={() => setOpen(true)} color="inherit" aria-label={t('appBar.exportSchema')}>
            <FileDownloadIcon />
          </IconButton>
        </span>
      </Tooltip>
      <ExportSchemaModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function ImportSchemaButton() {
  const { t } = useDesignerTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip title={t('appBar.importSchemaTooltip')}>
        <span>
          <IconButton onClick={() => setOpen(true)} color="inherit" aria-label={t('appBar.importSchema')}>
            <FileUploadIcon />
          </IconButton>
        </span>
      </Tooltip>
      <ImportSchemaModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function DarkModeSwitch() {
  const theme = useTheme()

  const dispatch = useAppDispatch()
  const handleClicked = () => {
    dispatch(toggleColorMode())
  }


  return (
    <Box
      sx={{
        display: 'flex',

        alignItems: 'center',
        justifyContent: 'center',
        // bgcolor: 'background.default',
        // color: 'text.primary',
        borderRadius: 1,
        p: 1,
      }}
    >
      <IconButton sx={{ ml: 1 }} onClick={handleClicked} color="inherit">
        {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Box>
  )
}

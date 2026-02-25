import { IconButton, Typography, useTheme, AppBar, Toolbar, Box, Grid, Switch, ToggleButton, ToggleButtonGroup } from '@mui/material'
import {
  useAppDispatch,
  toggleColorMode,
  togglePreviewModus,
  selectPreviewModus,
  useAppSelector,
} from '@formswizard/state'
import Brightness7 from '@mui/icons-material/Brightness7'
import Brightness4 from '@mui/icons-material/Brightness4'
import { InterfaceModeChooser } from '../components'
import { i18nInstance } from '@formswizard/i18n'
import { useEffect, useState } from 'react'

export function MainAppBar() {
  const dispatch = useAppDispatch()
  const previewModus = useAppSelector(selectPreviewModus)
  const handleTogglePreview = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(togglePreviewModus())
  }
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Grid container flex={1} alignItems="center">
          <Grid item md={6}></Grid>
          <Grid item md={3} sx={{ flexWrap: 'nowrap', display: 'flex' }}>
            <Typography variant="h6" noWrap component="div">
              preview
            </Typography>
            <Switch checked={previewModus} onChange={handleTogglePreview} />
          </Grid>
          <Grid
            item
            md={3}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 2,
              ' > *': {
                mr: 0,
              },
              ' > button': {
                mr: 0,
              },
            }}
          >
            <LanguageSelector />
            <InterfaceModeChooser />
            <DarkModeSwitch></DarkModeSwitch>
            {/* <TemplateModalButton>Templates</TemplateModalButton> */}
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  )
}

function LanguageSelector() {
  const [language, setLanguage] = useState(i18nInstance.language)

  useEffect(() => {
    const handler = (lng: string) => setLanguage(lng)
    i18nInstance.on('languageChanged', handler)
    return () => { i18nInstance.off('languageChanged', handler) }
  }, [])

  const handleChange = (_: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (value) i18nInstance.changeLanguage(value)
  }

  return (
    <ToggleButtonGroup
      value={language}
      exclusive
      onChange={handleChange}
      size="small"
      sx={{ '& .MuiToggleButton-root': { color: 'inherit', borderColor: 'rgba(255,255,255,0.3)', py: 0.5, px: 1.5 } }}
    >
      <ToggleButton value="en">EN</ToggleButton>
      <ToggleButton value="de">DE</ToggleButton>
    </ToggleButtonGroup>
  )
}

function DarkModeSwitch() {
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

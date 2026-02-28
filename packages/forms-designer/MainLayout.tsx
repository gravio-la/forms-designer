'use client'

import type { FunctionComponent, ReactNode } from 'react'
import { useRef, useState, useEffect } from 'react'
import { Box, Button, ButtonBase, Container, Drawer, Paper, Tab, Tabs, Toolbar, useTheme, useMediaQuery } from '@mui/material'
import { Wizard, WizardProps } from './Wizard'
import { Toolbox } from '@formswizard/toolbox'
import { FieldSettingsView, useFinalizedToolSettings } from '@formswizard/fieldsettings'
import { MainAppBar } from './layout/MainAppBar'
import { MobileAppBar } from './layout/MobileAppBar'
import { TrashFAB } from './components'
import { EditableTab } from './components/EditableTab'
import { AddDefinitionButton } from './components/AddDefinitionButton'
import { selectCurrentDefinition, selectJsonSchemaDefinitions, selectPath, selectPreviewModus, switchDefinition, togglePreviewModus, useAppDispatch, useAppSelector, renameSchemaDefinition } from '@formswizard/state'
import Close from '@mui/icons-material/Close'
import { useDNDHooksContext } from '@formswizard/react-hooks'
import useAutoDeselectOnOutsideClick from './useAutoDeselectOnOutsideClick'
import { JsonSchema } from '@formswizard/types'

interface OwnProps {
  appBar?: ReactNode
  multipleDefinitions?: boolean
  createNewDefinition?: (name: string) => { name: string, definition: JsonSchema }
}

type Props = OwnProps & Partial<WizardProps>


const a11yProps = (index: number) => {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const drawerWidth = 240
export const MainLayout: FunctionComponent<Props> = ({ appBar, multipleDefinitions, createNewDefinition, ...wizardProps }) => {
  const wizardPaperRef = useRef<null | HTMLDivElement>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useAppDispatch()
  const previewModus = useAppSelector(selectPreviewModus)
  const { selectedPath } = useFinalizedToolSettings()
  const { useDndMonitor } = useDNDHooksContext()

  const [mobileLeftOpen, setMobileLeftOpen] = useState(false)
  const [mobileRightOpen, setMobileRightOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useDndMonitor({
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
    onDragCancel: () => setIsDragging(false),
  })

  useEffect(() => {
    if (isDragging && isMobile) {
      setMobileLeftOpen(false)
      setMobileRightOpen(false)
    }
  }, [isDragging, isMobile])

  useEffect(() => {
    if (previewModus && isMobile) {
      setMobileLeftOpen(false)
      setMobileRightOpen(false)
    }
  }, [previewModus, isMobile])

  useEffect(() => {
    if (selectedPath == null && isMobile) {
      setMobileRightOpen(false)
    }
  }, [selectedPath, isMobile])

  const handleTogglePreview = (_event: React.MouseEvent) => {
    dispatch(togglePreviewModus())
  }
  const { handleClickOutside } = useAutoDeselectOnOutsideClick(wizardPaperRef)
  const definitions = useAppSelector(selectJsonSchemaDefinitions)
  const currentDefinition = useAppSelector(selectCurrentDefinition)
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    dispatch(switchDefinition({ definition: newValue }))
  }

  const handleRenameDefinition = (oldName: string, newName: string) => {
    if (oldName !== newName) {
      dispatch(renameSchemaDefinition({ oldName, newName }));
    }
  }

  const handleCloseFieldSettings = () => {
    dispatch(selectPath(undefined))
  }

  const leftDrawerOpen = isMobile ? mobileLeftOpen : !previewModus
  const rightDrawerOpen = isMobile ? mobileRightOpen : selectedPath != null && !previewModus

  return (
    <>
      <Box
        component={'main'}
        sx={{
          display: 'flex',
          flexGrow: 1,
          minHeight: '100vh',
          ...(isMobile && { flexDirection: 'column' }),
        }}
        onClick={handleClickOutside}
      >
        {appBar || (isMobile
          ? (
            <Box component="header" sx={{ flexShrink: 0 }}>
              <MobileAppBar
                leftDrawerOpen={mobileLeftOpen}
                onToggleLeftDrawer={() => setMobileLeftOpen((v) => !v)}
                rightDrawerOpen={mobileRightOpen}
                onToggleRightDrawer={() => setMobileRightOpen((v) => !v)}
              />
            </Box>
            )
          : (
            <MainAppBar />
            ))}
        {previewModus && !isMobile && (
          <Button color="warning" onClick={handleTogglePreview} size="large">
            <span style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>disable preview mode</span>
          </Button>
        )}
        {isMobile ? (
          <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <Drawer
              variant="temporary"
              anchor="left"
              open={leftDrawerOpen}
              onClose={() => setMobileLeftOpen(false)}
              ModalProps={{ keepMounted: true }}
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                zIndex: theme.zIndex.drawer + 2,
                [`& .MuiDrawer-paper`]: {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                },
              }}
            >
              <Toolbar />
              <Toolbox />
            </Drawer>
            <Container maxWidth={false} ref={wizardPaperRef} sx={{ px: 0 }}>
              <Toolbar />
              <Box display="flex" flexDirection="row" alignItems='center'>
                {multipleDefinitions && <>
                  <Tabs
                    value={currentDefinition}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    aria-label="form definitions tabs"
                  >
                    <Tab key="Root" value={"Root"} label="Root" {...a11yProps(0)} />
                    {Object.keys(definitions || {}).filter(def => def !== "Root").map((def, index) => (
                      <EditableTab
                        definitionName={def}
                        key={def}
                        value={def}
                        {...a11yProps(index + 1)}
                        onRename={handleRenameDefinition}
                        readonly={previewModus}
                      />
                    ))}
                  </Tabs>
                  <AddDefinitionButton createNewDefinition={createNewDefinition} />
                </>}
              </Box>
              <Paper elevation={0} square sx={{ p: 1, m: 0, width: '100%' }}>
                <Wizard {...wizardProps} />
              </Paper>
            </Container>
            <Drawer
              variant="temporary"
              anchor="right"
              open={rightDrawerOpen}
              onClose={() => setMobileRightOpen(false)}
              ModalProps={{ keepMounted: true }}
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                zIndex: theme.zIndex.drawer + 2,
                [`& .MuiDrawer-paper`]: {
                  width: drawerWidth + 100,
                  boxSizing: 'border-box',
                  overflow: 'visible',
                },
              }}
            >
              <ButtonBase
                onClick={handleCloseFieldSettings}
                aria-label="close"
                sx={{
                  position: 'absolute',
                  left: 0,
                  transform: 'translateX(-100%) translateY(48px)',
                  width: 24,
                  height: 64,
                  bgcolor: 'background.paper',
                  borderRadius: '8px 0 0 8px',
                  boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Close sx={{ fontSize: 16 }} />
              </ButtonBase>
              <FieldSettingsView />
            </Drawer>
          </Box>
        ) : (
          <>
            <Drawer
              variant="persistent"
              anchor="left"
              open={leftDrawerOpen}
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                },
              }}
            >
              <Toolbar />
              <Toolbox />
            </Drawer>
            <Container maxWidth={false} ref={wizardPaperRef}>
              <Toolbar />
              <Box display="flex" flexDirection="row" alignItems='center'>
                {multipleDefinitions && <>
                  <Tabs
                    value={currentDefinition}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    aria-label="form definitions tabs"
                  >
                    <Tab key="Root" value={"Root"} label="Root" {...a11yProps(0)} />
                    {Object.keys(definitions || {}).filter(def => def !== "Root").map((def, index) => (
                      <EditableTab
                        definitionName={def}
                        key={def}
                        value={def}
                        {...a11yProps(index + 1)}
                        onRename={handleRenameDefinition}
                        readonly={previewModus}
                      />
                    ))}
                  </Tabs>
                  <AddDefinitionButton createNewDefinition={createNewDefinition} />
                </>}
              </Box>
              <Paper elevation={12} square sx={{ p: 2, m: 4 }}>
                <Wizard {...wizardProps} />
              </Paper>
            </Container>
            <Drawer
              variant="persistent"
              anchor="right"
              open={rightDrawerOpen}
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                  width: drawerWidth + 100,
                  boxSizing: 'border-box',
                  overflow: 'visible',
                },
              }}
            >
              <ButtonBase
                onClick={handleCloseFieldSettings}
                aria-label="close"
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: theme => theme.mixins.toolbar?.minHeight ?? 64,
                  transform: 'translateX(-100%) translateY(55px)',
                  width: 24,
                  height: 64,
                  bgcolor: 'background.paper',
                  borderRadius: '8px 0 0 8px',
                  boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Close sx={{ fontSize: 16 }} />
              </ButtonBase>
              <Toolbar />
              <FieldSettingsView />
            </Drawer>
          </>
        )}
      </Box>
      <TrashFAB />
    </>
  )
}

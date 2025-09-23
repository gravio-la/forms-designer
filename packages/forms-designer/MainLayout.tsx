'use client'

import type { FunctionComponent, ReactNode } from 'react'
import { useRef } from 'react'
import { Box, Button, Container, Drawer, Paper, Tab, Tabs, Toolbar } from '@mui/material'
import { Wizard, WizardProps } from './Wizard'
import { Toolbox, ToolboxProps } from '@formswizard/toolbox'
import { FieldSettingsView, useToolSettings } from '@formswizard/fieldsettings'
import { MainAppBar } from './layout/MainAppBar'
import { TrashFAB } from './components'
import { EditableTab } from './components/EditableTab'
import { AddDefinitionButton } from './components/AddDefinitionButton'
import { selectCurrentDefinition, selectJsonSchemaDefinitions, selectPreviewModus, switchDefinition, togglePreviewModus, useAppDispatch, useAppSelector, renameSchemaDefinition } from '@formswizard/state'
import useAutoDeselectOnOutsideClick from './useAutoDeselectOnOutsideClick'
import { JsonSchema, ToolSettings } from '@formswizard/types'

interface OwnProps {
  appBar?: ReactNode
  additionalToolSettings?: ToolSettings
  toolboxProps?: ToolboxProps
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
export const MainLayout: FunctionComponent<Props> = ({ appBar, additionalToolSettings, toolboxProps, multipleDefinitions, createNewDefinition, ...wizardProps }) => {
  const wizardPaperRef = useRef<null | HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const previewModus = useAppSelector(selectPreviewModus)
  const { selectedPath } = useToolSettings()
  const handleTogglePreview = (event: any) => {
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
  };

  return (
    <>
      <Box component={'main'} sx={{ display: 'flex', flexGrow: 1, minHeight: '100vh' }} onClick={handleClickOutside}>
        {appBar || <MainAppBar />}
        {previewModus && (
          <Button color="warning" onClick={handleTogglePreview} size="large">
            <span style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>disable preview mode</span>
          </Button>
        )}
        <Drawer
          variant="persistent"
          anchor="left"
          open={!previewModus}
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
          <Toolbox {...toolboxProps} />
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
          open={Boolean(Boolean(selectedPath) && !previewModus)}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth + 100,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar></Toolbar>

          <FieldSettingsView additionalToolSettings={additionalToolSettings}></FieldSettingsView>
        </Drawer>
      </Box>
      <TrashFAB />
    </>
  )
}

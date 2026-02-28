import * as React from 'react'

import { DragBox } from './DragBox'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Tab, Box, Typography, IconButton, Collapse } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import BuildingBlocks from './BuildingBlocks'
import { useDraggableElementsByComponentType, useRegisteredCollections } from '@formswizard/tool-context'
import { useJsonFormsI18n } from '@formswizard/i18n'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ExpandLess from '@mui/icons-material/ExpandLess'
import type { DraggableElement } from '@formswizard/types'

const CATEGORY_ORDER = ['basic', 'layout', 'advanced'] as const

function groupByCategory(elements: DraggableElement[]): { category: string; items: DraggableElement[] }[] {
  const map = new Map<string, DraggableElement[]>()
  for (const el of elements) {
    const cat = el.category || 'basic'
    const list = map.get(cat)
    if (list) {
      list.push(el)
    } else {
      map.set(cat, [el])
    }
  }

  const result: { category: string; items: DraggableElement[] }[] = []
  for (const cat of CATEGORY_ORDER) {
    const items = map.get(cat)
    if (items) {
      result.push({ category: cat, items })
      map.delete(cat)
    }
  }
  for (const [category, items] of map) {
    result.push({ category, items })
  }
  return result
}

export function Toolbox() {
  const [activeTab, setActiveTab] = React.useState('1')
  const draggableComponents = useDraggableElementsByComponentType('tool')
  const registeredCollections = useRegisteredCollections()
  const { translate } = useJsonFormsI18n(registeredCollections)

  const groups = useMemo(() => groupByCategory(draggableComponents), [draggableComponents])

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const toggle = useCallback(
    (category: string) => setCollapsed((prev) => ({ ...prev, [category]: !prev[category] })),
    []
  )

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setActiveTab(newValue)
    },
    [setActiveTab]
  )

  return (
    <TabContext value={activeTab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={handleTabChange} aria-label="switch between tools and templates">
          <Tab label="Tools" value="1" />
          <Tab label="Blocks" value="2" />
        </TabList>
      </Box>
      <TabPanel value="1" sx={{ p: 0 }}>
        <Box sx={{ overflow: 'auto' }}>
          {groups.map(({ category, items }) => {
            const expanded = !collapsed[category]
            const categoryLabel =
              translate?.(`toolbox.category.${category}`, category) ??
              category.charAt(0).toUpperCase() + category.slice(1)
            return (
              <Box key={category}>
                <Box
                  onClick={() => toggle(category)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1,
                    py: 0.5,
                    cursor: 'pointer',
                    bgcolor: 'action.hover',
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    {categoryLabel}
                  </Typography>
                  <IconButton size="small" tabIndex={-1}>
                    {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                  </IconButton>
                </Box>
                <Collapse in={expanded}>
                  <Box sx={{ '& > div': { margin: 1 } }}>
                    {items.map((component) => {
                      const displayName =
                        translate?.(`tools.${component.name}`, component.name) ?? component.name
                      return (
                        <DragBox
                          name={displayName}
                          ToolIconName={component.ToolIconName}
                          key={component.name}
                          componentMeta={component}
                        />
                      )
                    })}
                  </Box>
                </Collapse>
              </Box>
            )
          })}
        </Box>
      </TabPanel>
      <TabPanel value="2" sx={{ p: 0 }}>
        <BuildingBlocks></BuildingBlocks>
      </TabPanel>
    </TabContext>
  )
}

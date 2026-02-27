import React, { useId } from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'
import { Stack } from '@mui/system'
import { useDNDHooksContext } from '@formswizard/react-hooks'
import { DraggableMeta } from '@formswizard/types'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { useIcon } from '@formswizard/tool-context'

type DragBoxProps = {
  name: string
  img?: string
  componentMeta: Partial<DraggableMeta>
  ToolIconName?: string
}

export const DragBox = ({
  name = 'Eingabefeld',
  img = '',
  componentMeta,
  ToolIconName = 'TocOutlined',
}: DragBoxProps) => {
  const { useDraggable } = useDNDHooksContext()
  const uid = useId()
  const ToolIcon = useIcon(ToolIconName) || null

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `dragbox-${uid}`,
    data: {
      type: 'DRAGBOX',
      componentMeta,
    },
  })

  return (
    <Box ref={setNodeRef} sx={{ opacity: isDragging ? 0.4 : 1 }}>
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" gap={1}>
            {/* Drag handle: touch-action:none scoped only to this element so that
                swiping the rest of the card still scrolls the toolbox list naturally.
                Works for mouse (immediate), touch (200 ms hold via TouchSensor),
                and pen (synthesised mouse events). */}
            <Box
              {...listeners}
              {...attributes}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'grab',
                touchAction: 'none',
                color: 'text.disabled',
                flexShrink: 0,
                '&:hover': { color: 'text.secondary' },
              }}
              aria-label={`Drag ${name}`}
            >
              <DragIndicatorIcon fontSize="small" />
            </Box>
            {ToolIcon && (
              <Box sx={{ color: 'secondary.dark', display: 'flex', alignItems: 'center' }}>
                <ToolIcon />
              </Box>
            )}
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              {name || ''}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

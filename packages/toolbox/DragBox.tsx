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
      {/* Listeners on the Card so that:
          - Mouse: click + move 5px anywhere on card → drag starts immediately
          - Touch: long-press (200 ms hold) anywhere on card → drag starts; quick swipe → native scroll
          - Pen: same as mouse via synthesised events
          The drag handle below keeps touch-action:none for immediate response from that zone,
          while the rest of the card body retains default touch-action so fast swipes still scroll. */}
      <Card {...listeners} {...attributes} sx={{ cursor: 'grab', userSelect: 'none' }}>
        <CardContent>
          <Stack direction="row" alignItems="center" gap={1}>
            {/* Visual drag affordance — no separate listeners needed here anymore,
                but touch-action:none keeps the handle zone scroll-free on touch so the
                200 ms delay feels snappier when starting from the grip icon. */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                touchAction: 'none',
                color: 'text.disabled',
                flexShrink: 0,
              }}
              aria-hidden
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

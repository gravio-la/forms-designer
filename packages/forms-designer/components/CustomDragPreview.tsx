import React from 'react'
import { Card, CardContent, Typography, Stack } from '@mui/material'
import { useIcon } from '@formswizard/tool-context'
import TocOutlined from '@mui/icons-material/TocOutlined'
import { DragData } from '@formswizard/react-hooks'

type CustomDragPreviewProps = {
  data: DragData
}

/**
 * Rendered inside dnd-kit's DragOverlay while a drag is in progress.
 * Shown for both DRAGBOX (toolbox item) and MOVEBOX (canvas element) drags.
 * Position tracking and portal rendering are handled by DragOverlay in WizardProvider.
 */
export function CustomDragPreview({ data }: CustomDragPreviewProps) {
  const { type, componentMeta } = data
  let name = componentMeta?.name || 'Component'
  const toolIconName = componentMeta?.ToolIconName || 'TocOutlined'

  // For canvas elements show only the leaf name (strip schema path prefix)
  if (type === 'MOVEBOX') {
    name = name.split('.').pop() || name
  }

  const ToolIcon = useIcon(toolIconName) || TocOutlined

  return (
    <Card
      sx={{
        opacity: 0.85,
        transform: 'rotate(2deg)',
        boxShadow: 6,
        minWidth: 150,
        pointerEvents: 'none',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack
          direction="row"
          alignItems="center"
          gap={1.5}
          sx={{
            '& .MuiSvgIcon-root': {
              fontSize: '1.2rem',
              color: 'secondary.dark',
            },
          }}
        >
          <ToolIcon />
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

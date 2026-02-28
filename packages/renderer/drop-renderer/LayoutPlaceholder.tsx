import type { OwnPropsOfRenderer, UISchemaElement } from '@jsonforms/core'
import { useId } from 'react'
import { Box } from '@mui/material'
import { DropTargetFormsPreview } from './DropTargetFormsPreview'
import { useDNDHooksContext, useDropTarget, useActiveDrag } from '@formswizard/react-hooks'

type EmptyLayoutElementProps = {
  child: UISchemaElement
  current: UISchemaElement
  path: string
  elements: UISchemaElement[]
  layoutRendererProps: OwnPropsOfRenderer
  direction: 'row' | 'column'
}

type StyledPlaceholderProps = {
  onDrop: (data: any) => void
}
const StyledPlaceholderElementBox = ({ onDrop }: StyledPlaceholderProps) => {
  const { useDroppable } = useDNDHooksContext()
  const uid = useId()
  const activeDrag = useActiveDrag()

  const { setNodeRef: dropRef, isOver } = useDroppable({
    id: `placeholder-${uid}`,
    data: { onDrop },
  })

  return (
    <Box
      ref={dropRef}
      sx={{
        border: `1px dashed gray`,
        borderRadius: '5px',
        boxSizing: 'border-box',
        padding: '1em 2em',
        minWidth: 200,
        minHeight: 100,
        margin: '1em',
        display: 'flex',
        backgroundColor: (theme) => (isOver ? theme.palette.action.focus : 'transparent'),
      }}
    >
      {isOver && activeDrag?.componentMeta ? (
        // @ts-ignore
        <DropTargetFormsPreview metadata={activeDrag.componentMeta} />
      ) : (
        <span style={{ margin: 'auto' }}> Placeholder</span>
      )}
    </Box>
  )
}

function LayoutPlaceholder({ child, current }: EmptyLayoutElementProps) {
  const { onDropAtStart } = useDropTarget({ child, isPlaceholder: true, current })

  return (
    <Box>
      <StyledPlaceholderElementBox onDrop={onDropAtStart} />
    </Box>
  )
}

export default LayoutPlaceholder

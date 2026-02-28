import { useCallback } from 'react'
import { Card, IconButton } from '@mui/material'
import { Box, Stack } from '@mui/system'
import { useAppDispatch, useAppSelector, addBuildingBlock, removeBuildingBlock } from '@formswizard/state'
import { DragBox } from './DragBox'
import { useDNDHooksContext } from '@formswizard/react-hooks'
import type { DragData } from '@formswizard/react-hooks'
import { useDraggableElementsByComponentType, useRegisteredCollections } from '@formswizard/tool-context'
import { useJsonFormsI18n } from '@formswizard/i18n'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { pathToPathSegments } from '@formswizard/utils'
import type { UISchemaElement } from '@jsonforms/core'

function BuildingBlocks() {
  const buildingBlocks = useAppSelector((state) => state.buildingBlocks.blocks)
  const draggableComponents = useDraggableElementsByComponentType('block')
  const registeredCollections = useRegisteredCollections()
  const { translate } = useJsonFormsI18n(registeredCollections)
  const jsonSchema = useAppSelector((state) => state.jsonFormsEdit.jsonSchema)
  const storeUiSchema = useAppSelector((state) => state.jsonFormsEdit.uiSchema)
  const dispatch = useAppDispatch()
  const { useDroppable } = useDNDHooksContext()

  const onDrop = useCallback(
    (dragData: DragData) => {
      if (dragData?.type !== 'MOVEBOX') return
      const rawUiSchema = dragData?.componentMeta?.uiSchema
      if (rawUiSchema?.type !== 'Group') return
      // Use the path from the decorated drag data only as a lookup key into the
      // clean Redux store uiSchema, so no runtime-only properties (path,
      // structurePath) leak into the stored building block.
      const path: string | undefined = (rawUiSchema as any).path
      if (!path) return
      const cleanUiSchema = pathToPathSegments(path).reduce(
        (cur: any, key) => cur?.[key],
        storeUiSchema
      ) as UISchemaElement | undefined
      if (!cleanUiSchema) return
      dispatch(addBuildingBlock({
        item: { componentMeta: { ...dragData.componentMeta, uiSchema: cleanUiSchema as any } },
        jsonSchema,
        ToolIconName: 'ViewQuilt',
      }))
    },
    [dispatch, jsonSchema, storeUiSchema]
  )

  const { setNodeRef: dropRef, isOver } = useDroppable({
    id: 'building-blocks-drop',
    data: { onDrop },
  })

  return (
    <>
      {buildingBlocks.map((component, index) => {
        const displayName = translate?.(`tools.${component.name}`, component.name) ?? component.name
        return (
          <Box key={component.name} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1 }}>
              <DragBox
                ToolIconName={component.ToolIconName}
                name={displayName}
                componentMeta={component}
              />
            </Box>
            <IconButton
              size="small"
              onClick={() => dispatch(removeBuildingBlock(index))}
              sx={{ flexShrink: 0, ml: 0.5 }}
              aria-label={`Remove ${displayName}`}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        )
      })}
      {draggableComponents.map((component) => {
        const displayName = translate?.(`tools.${component.name}`, component.name) ?? component.name
        return (
          <DragBox
            ToolIconName={component.ToolIconName}
            name={displayName}
            key={component.name}
            componentMeta={component}
          />
        )
      })}
      <Card
        ref={dropRef}
        sx={{
          height: 200,
          width: '100%',
          display: 'flex',
          color: isOver ? 'green' : 'inherit',
        }}
      >
        <Box
          sx={{
            border: '2px dashed  green',
            padding: 2,
            margin: 2,
            display: 'flex',
            flex: 1,
          }}
        >
          <Stack sx={{ margin: 'auto' }}>{isOver ? 'D R O P' : 'Drop Group to create new Building Block'}</Stack>
        </Box>
      </Card>
    </>
  )
}

export default BuildingBlocks

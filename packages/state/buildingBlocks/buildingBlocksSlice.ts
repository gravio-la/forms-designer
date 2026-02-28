import { resolveSchema } from '@jsonforms/core'
import { createSlice, type PayloadAction, type Reducer } from '@reduxjs/toolkit'
import type { DraggableComponent } from '@formswizard/types'
import { createBuildingBlock, type AddBuildingBlockPayload } from './buildingBlockHelper'

export type BuildingBlocksState = {
  blocks: DraggableComponent[]
}

const initialState: BuildingBlocksState = {
  blocks: [],
}

export const buildingBlocksSlice = createSlice({
  name: 'buildingBlocks',
  initialState,
  reducers: {
    addBuildingBlock: (
      state: BuildingBlocksState,
      action: PayloadAction<AddBuildingBlockPayload>
    ) => {
      const existingNames = state.blocks.map((b) => b.name)
      const block = createBuildingBlock(
        action.payload,
        existingNames,
        resolveSchema as any
      )
      state.blocks.push(block)
    },
    removeBuildingBlock: (
      state: BuildingBlocksState,
      action: PayloadAction<number>
    ) => {
      state.blocks.splice(action.payload, 1)
    },
  },
})

export { type AddBuildingBlockPayload } from './buildingBlockHelper'

export const { addBuildingBlock, removeBuildingBlock } =
  buildingBlocksSlice.actions

export const buildingBlocksReducer: Reducer<BuildingBlocksState> =
  buildingBlocksSlice.reducer

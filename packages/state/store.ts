import { configureStore, ThunkAction, Action, EnhancedStore } from '@reduxjs/toolkit'
import { jsonFormsEditReducer } from './wizard/jsonFormsEditSlice'
import { appBarReducer } from './appBar/appBarSlice'
import { buildingBlocksReducer } from './buildingBlocks/buildingBlocksSlice'
import { formDataReducer } from './formSlice'
// Define the root reducer type
type RootReducer = {
  formData: ReturnType<typeof formDataReducer>,
  jsonFormsEdit: ReturnType<typeof jsonFormsEditReducer>,
  AppBar: ReturnType<typeof appBarReducer>,
  buildingBlocks: ReturnType<typeof buildingBlocksReducer>,
}

// Create the store with explicit typing
export const store: EnhancedStore<RootReducer> = configureStore({
  reducer: {
    formData: formDataReducer,
    jsonFormsEdit: jsonFormsEditReducer,
    AppBar: appBarReducer,
    buildingBlocks: buildingBlocksReducer,
  },
})

export type AppStore = typeof store
export type AppDispatch = AppStore['dispatch']
export type RootState = ReturnType<AppStore['getState']>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>

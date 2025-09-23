'use client'

import { store } from '@formswizard/state'
import { Provider } from 'react-redux'
import { DndProvider, useDrag, useDrop, useDragLayer, useDragDropManager } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DNDHooksContext } from '@formswizard/react-hooks'
import { CacheProvider } from '@emotion/react'
import createEmotionCache from './createEmotionCache'
import { ThemeWrapper } from './ThemeWrapper'


const clientSideEmotionCache = createEmotionCache()

type WizardProviderProps = {
  children: React.ReactNode
}
export function WizardProvider({ children }: WizardProviderProps) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <Provider store={store}>
        <ThemeWrapper>
          <DndProvider backend={HTML5Backend}>
            <DNDHooksContext.Provider value={{ useDrag, useDrop, useDragLayer, useDragDropManager }}>
              {children}
            </DNDHooksContext.Provider>
          </DndProvider>
        </ThemeWrapper>
      </Provider>
    </CacheProvider>
  )
}

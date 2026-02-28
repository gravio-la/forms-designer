'use client'

import { store } from '@formswizard/state'
import { Provider } from 'react-redux'
import { CacheProvider } from '@emotion/react'
import createEmotionCache from './createEmotionCache'
import { ThemeWrapper } from './ThemeWrapper'
import { DndContextProvider } from './DndContextProvider'

const clientSideEmotionCache = createEmotionCache()

type WizardProviderProps = {
  children: React.ReactNode
}

export function WizardProvider({ children }: WizardProviderProps) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <Provider store={store}>
        <ThemeWrapper>
          <DndContextProvider showDragOverlay>
            {children}
          </DndContextProvider>
        </ThemeWrapper>
      </Provider>
    </CacheProvider>
  )
}

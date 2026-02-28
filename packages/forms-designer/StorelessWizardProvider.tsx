'use client'

import { CssBaseline, ThemeProvider } from '@mui/material'
import { getTheme } from '@formswizard/theme'
import { CacheProvider } from '@emotion/react'
import createEmotionCache from './createEmotionCache'
import { DndContextProvider } from './DndContextProvider'

const theme = getTheme('dark')
const clientSideEmotionCache = createEmotionCache()

type WizardProviderProps = {
  children: React.ReactNode
}

export function StorelessWizardProvider({ children }: WizardProviderProps) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <DndContextProvider showDragOverlay>
          <CssBaseline />
          {children}
        </DndContextProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}

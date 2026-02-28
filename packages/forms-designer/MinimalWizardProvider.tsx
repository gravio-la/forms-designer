'use client'

import { DndContextProvider } from './DndContextProvider'

type WizardProviderProps = {
  children: React.ReactNode
}

export function MinimalWizardProvider({ children }: WizardProviderProps) {
  return <DndContextProvider showDragOverlay={false}>{children}</DndContextProvider>
}

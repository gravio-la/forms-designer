'use client'

import { MainLayout } from './MainLayout'
import { WizardProvider } from './WizardProvider'
import { basicDraggableComponents } from '@formswizard/toolbox'
import { DraggableElement } from '@formswizard/types'

const WizardAppBasic = () => {
  return (
    <MainLayout
      multipleDefinitions={false}
      toolboxProps={{ draggableComponents: [...basicDraggableComponents] as DraggableElement[] }} />
  )
}

export function WizardApp() {
  return (
    <WizardProvider>
      <WizardAppBasic />
    </WizardProvider>
  )
}
'use client'

import React from 'react'
import { MainLayout } from './MainLayout'
import { WizardProvider } from './WizardProvider'
import { GraviolaProvider, graviolaRenderers, graviolaToolSetting, graviolaDraggableComponents } from '@formswizard/graviola-renderers'
import { useJsonSchema } from '@formswizard/state'
import { basicDraggableComponents } from '@formswizard/toolbox'
const GraviolaProviderWithSchema = ({ children }: { children: React.ReactNode }) => {
  const schema = useJsonSchema()
  return <GraviolaProvider schema={schema}>{children}</GraviolaProvider>
}

export function WizardApp() {
  return (
    <WizardProvider>
      <GraviolaProviderWithSchema>
        <MainLayout additionalToolSettings={[graviolaToolSetting]} renderers={graviolaRenderers} toolboxProps={{ draggableComponents: [...basicDraggableComponents, ...graviolaDraggableComponents] }} />
      </GraviolaProviderWithSchema>
    </WizardProvider>
  )
}

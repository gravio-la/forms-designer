'use client'

import React from 'react'
import { MainLayout } from './MainLayout'
import { WizardProvider } from './WizardProvider'
import { GraviolaProvider, graviolaToolSetting, graviolaDraggableComponents } from '@formswizard/graviola-renderers'
import { useJsonSchema } from '@formswizard/state'
import { basicDraggableComponents } from '@formswizard/toolbox'
import { renderers } from './renderers'
const GraviolaProviderWithSchema = ({ children }: { children: React.ReactNode }) => {
  const schema = useJsonSchema()
  return <GraviolaProvider schema={schema} renderers={renderers}>{children}</GraviolaProvider>
}

export function WizardApp() {
  return (
    <WizardProvider>
      <GraviolaProviderWithSchema>
        <MainLayout additionalToolSettings={[graviolaToolSetting]} toolboxProps={{ draggableComponents: [...basicDraggableComponents, ...graviolaDraggableComponents] }} />
      </GraviolaProviderWithSchema>
    </WizardProvider>
  )
}

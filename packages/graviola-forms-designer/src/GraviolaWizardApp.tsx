'use client'

import { MainLayout, WizardProvider } from '@formswizard/forms-designer'
import { GraviolaProvider, graviolaToolSettings, graviolaDraggableComponents } from '@formswizard/graviola-renderers'
import { useJsonSchema } from '@formswizard/state'
import { basicDraggableComponents } from '@formswizard/toolbox'
import { renderers } from './renderers'
import { QueryClient, QueryClientProvider, useAdbContext } from '@graviola/edb-state-hooks'
import { useUISchemata, usePrimaryFields } from './hooks'
import { useCallback } from 'react'
import { DraggableElement } from '@formswizard/types'
const GraviolaProviderWithSchema = ({ children }: { children: React.ReactNode }) => {
  const schema = useJsonSchema()
  const uischemata = useUISchemata()
  const primaryFields = usePrimaryFields()

  return (
    <GraviolaProvider
      schema={schema as any}
      renderers={renderers}
      apiBaseUrl="http://localhost:7887/query"
      baseIRI={"http://forms-designer.winzlieb.eu/example#"}
      entityBaseIRI={"http://data.winzlieb.eu/forms-designer/"}
      typeNameLabelMap={{}}
      typeNameUiSchemaOptionsMap={{}}
      primaryFields={primaryFields}
      uischemata={uischemata}
    >
      {children}
    </GraviolaProvider>
  )
}

const WizardAppWithMultipleDefinitions = () => {
  const { typeNameToTypeIRI } = useAdbContext()
  const createNewDefinition = useCallback((name: string) => {
    const internalName = name.replace(/\s/g, '_');
    const typeIRI = typeNameToTypeIRI(internalName)
    const definition = {
      type: 'object',
      properties: {
        '@id': { type: "string" },
        '@type': { const: typeIRI },
        name: { type: "string" }
      }
    }
    return { name: internalName, definition }
  }, [typeNameToTypeIRI])
  return (
    <MainLayout
      renderers={renderers}
      additionalToolSettings={graviolaToolSettings}
      createNewDefinition={createNewDefinition}
      multipleDefinitions={true}
      toolboxProps={{ draggableComponents: [...basicDraggableComponents, ...graviolaDraggableComponents] as DraggableElement[] }} />
  )
}

const queryClient = new QueryClient()

export function GraviolaWizardApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <WizardProvider>
        <GraviolaProviderWithSchema>
          <WizardAppWithMultipleDefinitions />
        </GraviolaProviderWithSchema>
      </WizardProvider>
    </QueryClientProvider>
  )
}

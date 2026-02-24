'use client'

import { MainLayout, WizardProvider } from '@formswizard/forms-designer'
import { ToolProvider } from '@formswizard/tool-context'
import { GraviolaProvider, graviolaToolsCollection } from '@formswizard/graviola-renderers'
import { basicToolsCollection } from '@formswizard/basic-tools'
import { advancedToolsCollection } from '@formswizard/advanced-tools'
import { useJsonSchema } from '@formswizard/state'
import { renderers } from './renderers'
import { QueryClient, QueryClientProvider, useAdbContext } from '@graviola/edb-state-hooks'
import { useUISchemata, usePrimaryFields } from './hooks'
import { useCallback } from 'react'
const GraviolaProviderWithSchema = ({ children }: { children: React.ReactNode }) => {
  const schema = useJsonSchema()
  const uischemata = useUISchemata()
  const primaryFields = usePrimaryFields()

  return (
    <GraviolaProvider
      schema={schema as any}
      renderers={renderers}
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
      createNewDefinition={createNewDefinition}
      multipleDefinitions={true}
    />
  )
}

const queryClient = new QueryClient()

export function GraviolaWizardApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToolProvider
        toolCollections={[
          basicToolsCollection,
          advancedToolsCollection,
          graviolaToolsCollection,
        ]}
      >
        <WizardProvider>
          <GraviolaProviderWithSchema>
            <WizardAppWithMultipleDefinitions />
          </GraviolaProviderWithSchema>
        </WizardProvider>
      </ToolProvider>
    </QueryClientProvider>
  )
}

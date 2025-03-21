import React from 'react'
import { AdbProvider, createSemanticConfig, QueryClient, QueryClientProvider } from '@graviola/edb-state-hooks'
import { SparqlEndpoint } from '@graviola/edb-core-types';
import NiceModal from '@ebay/nice-modal-react';
import { SparqlStoreProvider } from '@graviola/sparql-store-provider';
import { SimilarityFinder } from './SimilarityFinder';
import { GlobalSemanticConfig, ModRouter } from '@graviola/semantic-jsonform-types';
import type { JSONSchema7 } from 'json-schema';

const BASE_IRI = 'http://schema.org/';

/*const someNameToTypeIRI = (name: string) => `${BASE_IRI}${name}`;
const someIRIToTypeName = (iri: string) =>
  iri?.substring(BASE_IRI.length, iri.length);
export const createNewIRI = () => `${BASE_IRI}${Math.random().toString(36).substring(2, 15)}`;
*/

const queryClient = new QueryClient();

type GraviolaProviderProps = {
  children: React.ReactNode,
  schema: JSONSchema7
}
const endpoint: SparqlEndpoint = {
  endpoint: "http://localhost:7878/query",
  label: "Local",
  provider: "oxigraph",
  active: true,
}

const semanticConfig = createSemanticConfig({
  baseIRI: BASE_IRI
})

const realSemanticConfig: GlobalSemanticConfig = {
  ...semanticConfig,
  typeIRIToTypeName: (iri: string) => iri && semanticConfig.typeIRIToTypeName(iri),
  propertyNameToIRI: (name: string) => name && semanticConfig.propertyNameToIRI(name),
  typeNameToTypeIRI: (name: string) => name && semanticConfig.typeNameToTypeIRI(name),
  propertyIRIToPropertyName: (iri: string) => iri && semanticConfig.propertyIRIToPropertyName(iri),
  queryBuildOptions: {
    ...semanticConfig.queryBuildOptions,
    primaryFields: {
      "Person": {
        "label": "givenName",
      },
    }
  }
}

export const useRouterMock = () => {
  return {
    push: async (url) => {
      console.log("push", url);
    },
    replace: async (url) => {
      console.log("replace", url);
    },
    asPath: "",
    pathname: "",
    query: {},
    searchParams: {},
  } as ModRouter;
};

export const GraviolaProvider: React.FC<GraviolaProviderProps> = ({ children, schema }: GraviolaProviderProps) => {
  // @ts-ignore
  return <AdbProvider
    {...realSemanticConfig}
    env={{
      publicBasePath: '',
      baseIRI: BASE_IRI,
    }}
    lockedSPARQLEndpoint={endpoint}
    normDataMapping={{}}
    components={{
      EditEntityModal: () => null,
      EntityDetailModal: () => null,
      SemanticJsonForm: () => null,
      SimilarityFinder: SimilarityFinder,
    }}
    useRouterHook={useRouterMock}
    schema={schema}
  >
    <QueryClientProvider client={queryClient}>
      <NiceModal.Provider>
        <SparqlStoreProvider
          endpoint={endpoint}
          defaultLimit={10}
          children={children}
        />
      </NiceModal.Provider>
    </QueryClientProvider>
  </AdbProvider>
}

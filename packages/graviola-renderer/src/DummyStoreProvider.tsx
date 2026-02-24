"use client";

import type { AbstractDatastore } from "@graviola/edb-global-types";
import { CrudProviderContext } from "@graviola/edb-state-hooks";
import type { FunctionComponent, ReactNode } from "react";

const LOG_PREFIX = "[DummyStore]";

function noopLog(method: string, ...args: unknown[]): void {
  if (typeof console !== "undefined" && console.debug) {
    console.debug(LOG_PREFIX, method, ...args);
  }
}

/**
 * Noop AbstractDatastore implementation for forms-designer preview.
 * All operations are noops (optionally logged). No persistence or retrieval.
 */
export const dummyAbstractStore: AbstractDatastore = {
  typeNameToTypeIRI: (name: string) => name,
  typeIRItoTypeName: (iri: string) => iri,

  loadDocument: async (_typeName, entityIRI) => {
    noopLog("loadDocument", entityIRI);
    return null;
  },
  existsDocument: async (_typeName, entityIRI) => {
    noopLog("existsDocument", entityIRI);
    return false;
  },
  upsertDocument: async (_typeName, entityIRI, _document) => {
    noopLog("upsertDocument", entityIRI);
    return null;
  },
  removeDocument: async (_typeName, entityIRI) => {
    noopLog("removeDocument", entityIRI);
    return null;
  },
  importDocument: async (_typeName, entityIRI, _importStore) => {
    noopLog("importDocument", entityIRI);
    return null;
  },
  importDocuments: async (_typeName, _importStore, limit) => {
    noopLog("importDocuments", limit);
    return null;
  },
  listDocuments: async (_typeName, _limit?, _cb?) => {
    noopLog("listDocuments");
    return [];
  },
  findDocuments: async (_typeName, _query, _limit?, _cb?) => {
    noopLog("findDocuments");
    return [];
  },
};

export type DummyStoreProviderProps = {
  children: ReactNode;
};

/**
 * Provider that supplies dummyAbstractStore via CrudProviderContext.
 * Makes SparqlStoreProvider unnecessary for forms-designer preview (no SPARQL/oxigraph).
 */
export const DummyStoreProvider: FunctionComponent<DummyStoreProviderProps> = ({
  children,
}) => {
  return (
    <CrudProviderContext.Provider
      value={{
        crudOptions: null,
        dataStore: dummyAbstractStore,
        isReady: true,
      }}
    >
      {children}
    </CrudProviderContext.Provider>
  );
};

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { SparqlEndpoint } from '@graviola/edb-core-types'

interface EndpointContextType {
  currentEndpoint: SparqlEndpoint | null
  savedEndpoints: SparqlEndpoint[]
  setCurrentEndpoint: (endpoint: SparqlEndpoint) => void
  saveEndpoint: (endpoint: SparqlEndpoint) => void
  removeEndpoint: (endpoint: SparqlEndpoint) => void
  isConfigured: boolean
}

const EndpointContext = createContext<EndpointContextType | undefined>(undefined)

const ENDPOINT_STORAGE_KEY = 'graviola-sparql-endpoints'
const CURRENT_ENDPOINT_STORAGE_KEY = 'graviola-current-endpoint'

// Predefined endpoints
const PREDEFINED_ENDPOINTS: SparqlEndpoint[] = [
  {
    label: 'Local Oxigraph',
    endpoint: 'http://localhost:7887/query',
    provider: 'oxigraph',
    active: true,
  },
  {
    label: 'Local Blazegraph',
    endpoint: 'http://localhost:9999/blazegraph/sparql',
    provider: 'blazegraph', 
    active: true,
  },
  {
    label: 'Wikidata',
    endpoint: 'https://query.wikidata.org/sparql',
    provider: 'rest',
    active: true,
  },
]

function loadSavedEndpoints(): SparqlEndpoint[] {
  try {
    const saved = localStorage.getItem(ENDPOINT_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveSavedEndpoints(endpoints: SparqlEndpoint[]): void {
  try {
    localStorage.setItem(ENDPOINT_STORAGE_KEY, JSON.stringify(endpoints))
  } catch {
    // localStorage not available
  }
}

function loadCurrentEndpoint(): SparqlEndpoint | null {
  try {
    const current = localStorage.getItem(CURRENT_ENDPOINT_STORAGE_KEY)
    return current ? JSON.parse(current) : null
  } catch {
    return null
  }
}

function saveCurrentEndpoint(endpoint: SparqlEndpoint): void {
  try {
    localStorage.setItem(CURRENT_ENDPOINT_STORAGE_KEY, JSON.stringify(endpoint))
  } catch {
    // localStorage not available
  }
}

interface EndpointProviderProps {
  children: ReactNode
}

export function EndpointProvider({ children }: EndpointProviderProps) {
  const [savedEndpoints, setSavedEndpoints] = useState<SparqlEndpoint[]>(() => 
    loadSavedEndpoints()
  )
  const [currentEndpoint, setCurrentEndpointState] = useState<SparqlEndpoint | null>(() => 
    loadCurrentEndpoint()
  )

  const setCurrentEndpoint = useCallback((endpoint: SparqlEndpoint) => {
    setCurrentEndpointState(endpoint)
    saveCurrentEndpoint(endpoint)
  }, [])

  const saveEndpoint = useCallback((endpoint: SparqlEndpoint) => {
    setSavedEndpoints(prev => {
      // Check if endpoint already exists (by endpoint URL)
      const exists = prev.some(ep => ep.endpoint === endpoint.endpoint)
      if (exists) {
        // Update existing
        const updated = prev.map(ep => 
          ep.endpoint === endpoint.endpoint ? endpoint : ep
        )
        saveSavedEndpoints(updated)
        return updated
      } else {
        // Add new
        const updated = [...prev, endpoint]
        saveSavedEndpoints(updated)
        return updated
      }
    })
  }, [])

  const removeEndpoint = useCallback((endpoint: SparqlEndpoint) => {
    setSavedEndpoints(prev => {
      const updated = prev.filter(ep => ep.endpoint !== endpoint.endpoint)
      saveSavedEndpoints(updated)
      return updated
    })
    
    // If removing current endpoint, clear it
    if (currentEndpoint?.endpoint === endpoint.endpoint) {
      setCurrentEndpointState(null)
      try {
        localStorage.removeItem(CURRENT_ENDPOINT_STORAGE_KEY)
      } catch {
        // localStorage not available
      }
    }
  }, [currentEndpoint])

  const allAvailableEndpoints = [...PREDEFINED_ENDPOINTS, ...savedEndpoints]
  const isConfigured = currentEndpoint !== null

  const value = {
    currentEndpoint,
    savedEndpoints: allAvailableEndpoints,
    setCurrentEndpoint,
    saveEndpoint,
    removeEndpoint,
    isConfigured,
  }

  return (
    <EndpointContext.Provider value={value}>
      {children}
    </EndpointContext.Provider>
  )
}

export function useEndpoint() {
  const context = useContext(EndpointContext)
  if (context === undefined) {
    throw new Error('useEndpoint must be used within an EndpointProvider')
  }
  return context
}

import { useMemo } from 'react'
import { GraviolaProvider, GraviolaProviderProps } from '@formswizard/graviola-renderers'
import { SparqlEndpoint } from '@graviola/edb-core-types'
import { useEndpoint } from '../context'


export function GraviolaProviderWithEndpoint({
  children,
  ...otherProps
}: Omit<GraviolaProviderProps, 'endpoint'>) {
  const { currentEndpoint } = useEndpoint()
  const endpoint = useMemo<SparqlEndpoint>(() => {
    if (!currentEndpoint) {
      return {
        label: 'Local Oxigraph',
        endpoint: 'http://localhost:7887/query',
        provider: 'oxigraph',
        active: true,
      }
    }
    return currentEndpoint
  }, [currentEndpoint])
  return (
    <GraviolaProvider
      {...otherProps}
      endpoint={endpoint}
    >
      {children}
    </GraviolaProvider>
  )
}

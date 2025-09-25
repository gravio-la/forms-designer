import { useMemo } from 'react'
import { GraviolaProvider } from '@formswizard/graviola-renderers'
import { useEndpoint } from '../context'

// Re-export the original props type but make apiBaseUrl optional since we'll get it from context
type GraviolaProviderWithEndpointProps = Omit<Parameters<typeof GraviolaProvider>[0], 'apiBaseUrl'> & {
  apiBaseUrl?: string // Make optional, will use endpoint from context if not provided
}

export function GraviolaProviderWithEndpoint({ 
  children,
  apiBaseUrl,
  ...otherProps 
}: GraviolaProviderWithEndpointProps) {
  const { currentEndpoint } = useEndpoint()

  // Use endpoint from context if no apiBaseUrl is provided
  const effectiveApiBaseUrl = useMemo(() => {
    if (apiBaseUrl) {
      return apiBaseUrl
    }
    
    if (currentEndpoint?.endpoint) {
      return currentEndpoint.endpoint
    }
    
    // Fallback to localhost if no endpoint is configured
    return 'http://localhost:7887/query'
  }, [apiBaseUrl, currentEndpoint])

  return (
    <GraviolaProvider
      {...otherProps}
      apiBaseUrl={effectiveApiBaseUrl}
    >
      {children}
    </GraviolaProvider>
  )
}

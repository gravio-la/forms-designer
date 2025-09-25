import React, { useEffect, useState } from 'react'
import { useEndpoint } from '../context'
import { EndpointSelectionDialog } from './EndpointSelectionDialog'

interface InitialSetupDialogProps {
  children: React.ReactNode
}

export function InitialSetupDialog({ children }: InitialSetupDialogProps) {
  const { isConfigured } = useEndpoint()
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    // Show setup dialog if no endpoint is configured
    if (!isConfigured) {
      setShowSetup(true)
    }
  }, [isConfigured])

  const handleSetupComplete = () => {
    setShowSetup(false)
  }

  return (
    <>
      {children}
      <EndpointSelectionDialog
        open={showSetup}
        onClose={handleSetupComplete}
      />
    </>
  )
}

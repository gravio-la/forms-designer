'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type InterfaceMode = 'touch-drag' | 'mouse-drag' | 'click-based'

interface InterfaceModeContextType {
  interfaceMode: InterfaceMode
  setInterfaceMode: (mode: InterfaceMode, skipReload?: boolean) => void
  requestModeChange: (mode: InterfaceMode) => void
}

const InterfaceModeContext = createContext<InterfaceModeContextType | undefined>(undefined)

const INTERFACE_MODE_STORAGE_KEY = 'forms-designer-interface-mode'

function isTouchDevice(): boolean {
  try {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  } catch {
    return false
  }
}

function getStoredInterfaceMode(): InterfaceMode | null {
  try {
    const stored = localStorage.getItem(INTERFACE_MODE_STORAGE_KEY)
    if (stored && ['touch-drag', 'mouse-drag', 'click-based'].includes(stored)) {
      return stored as InterfaceMode
    }
  } catch {
    // localStorage not available
  }
  return null
}

function storeInterfaceMode(mode: InterfaceMode): void {
  try {
    localStorage.setItem(INTERFACE_MODE_STORAGE_KEY, mode)
  } catch {
    // localStorage not available
  }
}

function getDefaultInterfaceMode(fallbackMode?: InterfaceMode): InterfaceMode {
  // First try to get from localStorage
  const storedMode = getStoredInterfaceMode()
  if (storedMode) {
    console.log('Interface mode loaded from localStorage:', storedMode)
    return storedMode
  }
  
  // If no stored preference, detect touch device
  const touchDevice = isTouchDevice()
  console.log('Touch device detected:', touchDevice)
  
  if (touchDevice) {
    console.log('Auto-selecting touch-drag mode for touch device')
    return 'touch-drag'
  }
  
  // Fall back to provided default or mouse-drag
  const defaultMode = fallbackMode || 'mouse-drag'
  console.log('Using default interface mode:', defaultMode)
  return defaultMode
}

interface InterfaceModeProviderProps {
  children: ReactNode
  defaultMode?: InterfaceMode
}

export function InterfaceModeProvider({ 
  children, 
  defaultMode
}: InterfaceModeProviderProps) {
  const [interfaceMode, setInterfaceModeState] = useState<InterfaceMode>(() => 
    getDefaultInterfaceMode(defaultMode)
  )

  // Store mode changes in localStorage.
  // No page reload is required — dnd-kit handles mouse, touch, and pen/stylus simultaneously
  // via its sensor architecture, so switching modes takes effect instantly.
  const setInterfaceMode = (mode: InterfaceMode, _skipReload = false) => {
    storeInterfaceMode(mode)
    setInterfaceModeState(mode)
  }

  const requestModeChange = (mode: InterfaceMode) => {
    setInterfaceMode(mode)
  }

  const value = {
    interfaceMode,
    setInterfaceMode,
    requestModeChange,
  }

  return (
    <InterfaceModeContext.Provider value={value}>
      {children}
    </InterfaceModeContext.Provider>
  )
}

export function useInterfaceMode() {
  const context = useContext(InterfaceModeContext)
  if (context === undefined) {
    throw new Error('useInterfaceMode must be used within an InterfaceModeProvider')
  }
  return context
}

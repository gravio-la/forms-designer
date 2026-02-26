import { createRoot } from 'react-dom/client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { WizardProvider, MainLayout } from '@formswizard/forms-designer'
import { ToolProvider } from '@formswizard/tool-context'
import { I18nProvider } from '@formswizard/i18n'
import { basicToolsCollection } from '@formswizard/basic-tools'
import { advancedToolsCollection } from '@formswizard/advanced-tools'
import {
  useAppDispatch,
  useAppSelector,
  setAgentSchema,
  selectJsonSchema,
  selectUiSchema,
  selectUIElementFromSelection,
  isScopableUISchemaElement,
} from '@formswizard/state'
import { AgentChatProvider } from '@graviola/agent-chat-flow'
import type { SchemaState } from '@graviola/agent-chat-flow'
import { MarkdownChatProvider } from '@graviola/agent-chat-markdown'
import { debounce } from 'lodash'
import Fab from '@mui/material/Fab'
import CircularProgress from '@mui/material/CircularProgress'
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined'

const SERVER_URL = import.meta.env.VITE_AGENT_SERVER_URL ?? 'http://localhost:3001'

function AgentBridge({
  serverUrl,
  sessionId,
  defaultOpen = false,
}: {
  serverUrl: string
  sessionId: string
  defaultOpen?: boolean
}) {
  const dispatch = useAppDispatch()
  const jsonSchema = useAppSelector(selectJsonSchema)
  const uiSchema = useAppSelector(selectUiSchema)
  const selectedElement = useAppSelector(selectUIElementFromSelection)
  const mountedRef = useRef(false)
  // Set to true when a schema update arrives FROM the agent. The very next
  // debouncedPut effect run is suppressed so we don't echo the agent's write
  // back to the server and trigger an infinite version-bump cycle.
  const suppressNextPutRef = useRef(false)

  const agentSelectedElement = selectedElement
    ? {
        type: selectedElement.type,
        ...(isScopableUISchemaElement(selectedElement) ? { scope: (selectedElement as any).scope } : {}),
        ...('label' in selectedElement && selectedElement.label
          ? { label: selectedElement.label as string }
          : {}),
      }
    : undefined

  const debouncedPut = useMemo(
    () =>
      debounce(async (json: unknown, ui: unknown) => {
        await fetch(`${serverUrl}/api/schema/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonSchema: json, uiSchema: ui }),
        }).catch(() => {})
      }, 600),
    [serverUrl, sessionId]
  )

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (suppressNextPutRef.current) {
      suppressNextPutRef.current = false
      return
    }
    debouncedPut(jsonSchema, uiSchema)
    return () => debouncedPut.cancel()
  }, [jsonSchema, uiSchema, debouncedPut])

  const handleSchemaUpdate = (state: SchemaState) => {
    suppressNextPutRef.current = true
    dispatch(setAgentSchema({ jsonSchema: state.jsonSchema, uiSchema: state.uiSchema }))
  }

  return (
    <MarkdownChatProvider>
      <AgentChatProvider
        serverUrl={serverUrl}
        sessionId={sessionId}
        onSchemaUpdate={handleSchemaUpdate}
        {...(agentSelectedElement !== undefined ? { selectedElement: agentSelectedElement } : {})}
        {...(defaultOpen ? { defaultOpen: true } : {})}
      >
        <></>
      </AgentChatProvider>
    </MarkdownChatProvider>
  )
}

/**
 * Shows a plain FAB button until the user clicks it for the first time.
 * On first click: creates a session and uploads the current local schema state
 * to Redis so the agent starts with whatever the user has already built.
 * Then hands off to the full AgentBridge with the panel open immediately.
 */
function SessionGatedAgentBridge({ serverUrl }: { serverUrl: string }) {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [isCreating, setIsCreating] = useState(false)
  const jsonSchema = useAppSelector(selectJsonSchema)
  const uiSchema = useAppSelector(selectUiSchema)

  const handleFirstOpen = async () => {
    if (isCreating || sessionId) return
    setIsCreating(true)
    try {
      const data: { sessionId: string } = await fetch(`${serverUrl}/api/session`, {
        method: 'POST',
      }).then((r) => r.json())
      // Seed Redis with the current local form state (may come from localStorage)
      // so the agent sees the user's existing work, not an empty schema.
      await fetch(`${serverUrl}/api/schema/${data.sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonSchema, uiSchema }),
      }).catch(() => {})
      setSessionId(data.sessionId)
    } catch {
      setIsCreating(false)
    }
  }

  if (!sessionId) {
    return (
      <Fab
        color="primary"
        aria-label="Open AI assistant"
        onClick={handleFirstOpen}
        disabled={isCreating}
        sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1300 }}
      >
        {isCreating ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <ChatBubbleOutlineOutlined />
        )}
      </Fab>
    )
  }

  // Session ready — mount the real bridge. defaultOpen=true so the panel
  // opens immediately (the user just clicked the button).
  return <AgentBridge serverUrl={serverUrl} sessionId={sessionId} defaultOpen />
}

const container = document.getElementById('app') as HTMLElement

const App = () => (
  <I18nProvider>
    <ToolProvider toolCollections={[basicToolsCollection, advancedToolsCollection]}>
      <WizardProvider defaultInterfaceMode="touch-drag">
        <MainLayout multipleDefinitions={false} />
        <SessionGatedAgentBridge serverUrl={SERVER_URL} />
      </WizardProvider>
    </ToolProvider>
  </I18nProvider>
)

const root = createRoot(container)
root.render(<App />)

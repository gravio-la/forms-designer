import {
  useAppDispatch,
  useAppSelector,
  selectJsonSchema,
  selectUiSchema,
  selectUIElementFromSelection,
  isScopableUISchemaElement,
  loadImportedSchema,
} from '@formswizard/state'
import { AiAssistantProvider, useAiAssistantChat } from '@graviola/agent-chat-flow'
import type { SchemaState } from '@graviola/agent-chat-flow'
import Fab from '@mui/material/Fab'
import CircularProgress from '@mui/material/CircularProgress'
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined'

const SERVER_URL = import.meta.env.VITE_AGENT_SERVER_URL ?? 'http://localhost:3001'

function AssistantFABTrigger() {
  const { openChat, isCreating, hasSession } = useAiAssistantChat()
  if (hasSession) return null
  return (
    <Fab
      color="primary"
      aria-label="Open AI assistant"
      onClick={() => void openChat()}
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

/**
 * Renders inside WizardProvider so it has access to the Redux store.
 * Wires the agent schema updates back to the store via loadImportedSchema.
 */
export function AgentAssistant() {
  const dispatch = useAppDispatch()
  const jsonSchema = useAppSelector(selectJsonSchema)
  const uiSchema = useAppSelector(selectUiSchema)
  const selectedElement = useAppSelector(selectUIElementFromSelection)

  const agentSelectedElement = selectedElement
    ? {
        type: selectedElement.type,
        ...(isScopableUISchemaElement(selectedElement) ? { scope: (selectedElement as any).scope } : {}),
        ...('label' in selectedElement && selectedElement.label
          ? { label: selectedElement.label as string }
          : {}),
      }
    : undefined

  const handleSchemaUpdate = (state: SchemaState) => {
    dispatch(loadImportedSchema({ jsonSchema: state.jsonSchema as any, uiSchema: state.uiSchema as any }))
  }

  return (
    <AiAssistantProvider
      serverUrl={SERVER_URL}
      schema={{ jsonSchema, uiSchema }}
      onSchemaUpdate={handleSchemaUpdate}
      {...(agentSelectedElement !== undefined ? { selectedElement: agentSelectedElement } : {})}
    >
      <AssistantFABTrigger />
    </AiAssistantProvider>
  )
}

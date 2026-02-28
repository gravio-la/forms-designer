import { useCallback } from 'react'
import {
  useAppDispatch,
  useAppSelector,
  selectJsonSchema,
  selectUiSchema,
  selectUIElementFromSelection,
  isScopableUISchemaElement,
  aiAddField,
  aiAddLayout,
  aiRemoveElement,
  aiUpdateField,
  aiRenameField,
  aiMoveElement,
  aiUpdateLayout,
} from '@formswizard/state'
import { AiAssistantProvider, useAiAssistantChat } from '@graviola/agent-chat-flow'
import type { ToolResult } from '@graviola/agent-chat-flow'
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
 * Wires the agent's client-side tool calls directly to Redux dispatch.
 * The schema is passed with every message so the server always builds
 * the system prompt from the current live state.
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

  const handleExecuteTool = useCallback(
    (toolName: string, args: Record<string, unknown>): ToolResult => {
      try {
        switch (toolName) {
          case 'add_field':
            dispatch(aiAddField(args as any))
            break
          case 'add_layout':
            dispatch(aiAddLayout(args as any))
            break
          case 'remove_element':
            dispatch(aiRemoveElement(args as any))
            break
          case 'update_field':
            dispatch(aiUpdateField(args as any))
            break
          case 'rename_field':
            dispatch(aiRenameField(args as any))
            break
          case 'move_element':
            dispatch(aiMoveElement(args as any))
            break
          case 'update_layout':
            dispatch(aiUpdateLayout(args as any))
            break
          default:
            return { success: false, error: `Unknown tool: ${toolName}` }
        }
        return { success: true, message: `Applied ${toolName} successfully.` }
      } catch (err) {
        return { success: false, error: String(err) }
      }
    },
    [dispatch],
  )

  return (
    <AiAssistantProvider
      serverUrl={SERVER_URL}
      schema={{ jsonSchema, uiSchema }}
      onExecuteTool={handleExecuteTool}
      {...(agentSelectedElement !== undefined ? { selectedElement: agentSelectedElement } : {})}
    >
      <AssistantFABTrigger />
    </AiAssistantProvider>
  )
}

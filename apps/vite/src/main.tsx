import { createRoot } from 'react-dom/client'
import { WizardProvider, MainLayout } from '@formswizard/forms-designer'
import { ToolProvider } from '@formswizard/tool-context'
import { I18nProvider } from '@formswizard/i18n'
import { basicToolsCollection } from '@formswizard/basic-tools'
import { advancedToolsCollection } from '@formswizard/advanced-tools'
import { MarkdownChatProvider } from '@graviola/agent-chat-markdown'
import { AgentAssistant } from './AgentAssistant'

const App = () => (
  <I18nProvider>
    <ToolProvider toolCollections={[basicToolsCollection, advancedToolsCollection]}>
      <WizardProvider>
        <MarkdownChatProvider>
          <MainLayout multipleDefinitions={false} />
          <AgentAssistant />
        </MarkdownChatProvider>
      </WizardProvider>
    </ToolProvider>
  </I18nProvider>
)

const container = document.getElementById('app') as HTMLElement
const root = createRoot(container)
root.render(<App />)

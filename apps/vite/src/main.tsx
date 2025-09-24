import { createRoot } from 'react-dom/client'
import { GraviolaWizardApp as WizardApp } from '@formswizard/graviola-forms-designer'

const container = document.getElementById('app') as HTMLElement

const App = () => {
  return (
    <WizardApp />
  )
}

const root = createRoot(container)
root.render(<App />)

import { createRoot } from 'react-dom/client'
import { GraviolaWizardApp } from '@formswizard/graviola-forms-designer'

const container = document.getElementById('app') as HTMLElement

const App = () => {
  return (
    <GraviolaWizardApp />
  )
}

const root = createRoot(container)
root.render(<App />)

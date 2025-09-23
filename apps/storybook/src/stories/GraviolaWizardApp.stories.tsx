import type { Meta, StoryObj } from '@storybook/react'
import { GraviolaWizardApp } from '@formswizard/graviola-forms-designer'

const meta = {
  title: 'example/GraviolaWizardApp',
  component: GraviolaWizardApp,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GraviolaWizardApp>

export default meta

export const Story: StoryObj<typeof meta> = {}

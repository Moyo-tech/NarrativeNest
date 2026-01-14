'use client'

import { Card } from '@/components/ui'
import Breadcrumb from '@/components/layout/Breadcrumb'

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      {/* Header with breadcrumb */}
      <div className="px-4 lg:px-6 py-4 border-b border-primary-700/30">
        <Breadcrumb items={[{ label: 'Settings' }]} />
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-neutral-400">Configure your NarrativeNest preferences</p>
          </div>

          <Card variant="glass">
            <h2 className="text-xl font-semibold text-neutral-100 mb-4">Application Settings</h2>
            <p className="text-neutral-300">
              Settings page coming soon. This will include preferences for:
            </p>
            <ul className="mt-4 space-y-2 text-neutral-400">
              <li>• AI model selection</li>
              <li>• Editor preferences</li>
              <li>• Export formats</li>
              <li>• Keyboard shortcuts</li>
              <li>• Theme customization</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

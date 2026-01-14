'use client'

import { useState } from 'react'
import { Button, Input, Textarea, Select, Card, Modal } from '@/components/ui'
import { FiSave, FiTrash2, FiPlus, FiSettings } from 'react-icons/fi'

export default function ComponentsTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectValue, setSelectValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const selectOptions = [
    { value: 'drama', label: 'Drama' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'thriller', label: 'Thriller' },
    { value: 'romance', label: 'Romance' },
  ]

  const handleLoadingTest = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-primary-950 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white bg-gradient-premium bg-clip-text text-transparent">
            NarrativeNest UI Components
          </h1>
          <p className="text-neutral-400 text-lg">
            Premium Dark Theme Design System Test
          </p>
        </div>

        {/* Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-100 border-b border-primary-700 pb-2">
            Buttons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-neutral-200 mb-4">Primary Variant</h3>
              <div className="space-y-3">
                <Button variant="primary" className="w-full">
                  <FiSave className="mr-2" /> Save Changes
                </Button>
                <Button variant="primary" size="sm" className="w-full">
                  Small Button
                </Button>
                <Button variant="primary" size="lg" className="w-full">
                  Large Button
                </Button>
                <Button variant="primary" isLoading={isLoading} onClick={handleLoadingTest} className="w-full">
                  {isLoading ? 'Loading' : 'Test Loading State'}
                </Button>
              </div>
            </Card>

            <Card variant="glass">
              <h3 className="text-lg font-semibold text-neutral-200 mb-4">Secondary & Ghost</h3>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full">
                  <FiSettings className="mr-2" /> Settings
                </Button>
                <Button variant="ghost" className="w-full">
                  Cancel
                </Button>
                <Button variant="secondary" disabled className="w-full">
                  Disabled State
                </Button>
              </div>
            </Card>

            <Card variant="glass">
              <h3 className="text-lg font-semibold text-neutral-200 mb-4">Semantic Colors</h3>
              <div className="space-y-3">
                <Button variant="success" className="w-full">
                  <FiPlus className="mr-2" /> Create New
                </Button>
                <Button variant="danger" className="w-full">
                  <FiTrash2 className="mr-2" /> Delete
                </Button>
                <Button variant="primary" size="icon">
                  <FiSettings />
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-100 border-b border-primary-700 pb-2">
            Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="glass">
              <h3 className="text-xl font-bold text-neutral-100 mb-2">Glass Card</h3>
              <p className="text-neutral-300 mb-4">
                This is a glassmorphic card with backdrop blur and semi-transparent background.
                Perfect for creating depth and layers in your UI.
              </p>
              <div className="flex gap-2">
                <Button variant="primary" size="sm">Action</Button>
                <Button variant="ghost" size="sm">Cancel</Button>
              </div>
            </Card>

            <Card variant="solid">
              <h3 className="text-xl font-bold text-neutral-100 mb-2">Solid Card</h3>
              <p className="text-neutral-300 mb-4">
                This is a solid card with opaque background and subtle border.
                Great for content that needs more emphasis.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">Action</Button>
                <Button variant="ghost" size="sm">Cancel</Button>
              </div>
            </Card>

            <Card variant="glass" hover>
              <h3 className="text-xl font-bold text-neutral-100 mb-2">Hoverable Glass Card</h3>
              <p className="text-neutral-300">
                This card has hover effects - try hovering over it to see the scale and shadow animation.
              </p>
            </Card>

            <Card variant="solid" hover>
              <h3 className="text-xl font-bold text-neutral-100 mb-2">Hoverable Solid Card</h3>
              <p className="text-neutral-300">
                This solid card also responds to hover with smooth transitions.
              </p>
            </Card>
          </div>
        </section>

        {/* Form Inputs Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-100 border-b border-primary-700 pb-2">
            Form Inputs
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-neutral-200 mb-4">Text Inputs</h3>
              <div className="space-y-4">
                <Input
                  label="Story Title"
                  placeholder="Enter your story title..."
                  helperText="This will be the main title of your screenplay"
                />
                <Input
                  label="Character Name"
                  placeholder="e.g., Ada Okonkwo"
                  defaultValue="John Doe"
                />
                <Input
                  label="Email (Error State)"
                  placeholder="email@example.com"
                  error="This field is required"
                />
              </div>
            </Card>

            <Card variant="glass">
              <h3 className="text-lg font-semibold text-neutral-200 mb-4">Textarea & Select</h3>
              <div className="space-y-4">
                <Textarea
                  label="Logline"
                  placeholder="Write a brief summary of your story..."
                  rows={3}
                  helperText="Keep it under 50 words"
                />
                <Select
                  label="Genre"
                  options={selectOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                  placeholder="Choose a genre..."
                  helperText="Select the primary genre for your screenplay"
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Modal Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-100 border-b border-primary-700 pb-2">
            Modal Dialog
          </h2>
          <Card variant="glass">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-200 mb-2">Dialog Component</h3>
                <p className="text-neutral-400">
                  Click the button to see the glassmorphic modal dialog in action
                </p>
              </div>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
            </div>
          </Card>
        </section>

        {/* Typography Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-100 border-b border-primary-700 pb-2">
            Typography & Colors
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-neutral-200 mb-4">Text Styles</h3>
              <div className="space-y-3">
                <p className="text-neutral-100 font-bold">Bold Text - Neutral 100</p>
                <p className="text-neutral-200">Regular Text - Neutral 200</p>
                <p className="text-neutral-300">Lighter Text - Neutral 300</p>
                <p className="text-neutral-400">Muted Text - Neutral 400</p>
                <p className="text-neutral-500">Placeholder Text - Neutral 500</p>
              </div>
            </Card>

            <Card variant="glass">
              <h3 className="text-lg font-semibold text-neutral-200 mb-4">Accent Colors</h3>
              <div className="space-y-3">
                <p className="text-accent-400">Accent 400 - Bright Lavender</p>
                <p className="text-accent-600">Accent 600 - Base Purple</p>
                <p className="text-accent-700">Accent 700 - Deep Purple</p>
                <div className="h-12 bg-gradient-premium rounded-2xl flex items-center justify-center text-white font-medium">
                  Premium Gradient
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Semantic Colors */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-100 border-b border-primary-700 pb-2">
            Semantic Colors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="glass" className="border-l-4 border-success">
              <div className="text-success font-semibold mb-2">Success</div>
              <p className="text-neutral-300 text-sm">Operation completed successfully</p>
            </Card>
            <Card variant="glass" className="border-l-4 border-warning">
              <div className="text-warning font-semibold mb-2">Warning</div>
              <p className="text-neutral-300 text-sm">Please review this action</p>
            </Card>
            <Card variant="glass" className="border-l-4 border-error">
              <div className="text-error font-semibold mb-2">Error</div>
              <p className="text-neutral-300 text-sm">Something went wrong</p>
            </Card>
            <Card variant="glass" className="border-l-4 border-info">
              <div className="text-info font-semibold mb-2">Info</div>
              <p className="text-neutral-300 text-sm">Additional information</p>
            </Card>
          </div>
        </section>

        {/* Glassmorphism Examples */}
        <section className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold text-neutral-100 border-b border-primary-700 pb-2">
            Glassmorphism Effects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-neutral-100 mb-2">Glass Panel</h3>
              <p className="text-neutral-300 text-sm">Using .glass-panel utility class</p>
            </div>
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-neutral-100 mb-2">Glass Card</h3>
              <p className="text-neutral-300 text-sm">Using .glass-card utility class</p>
            </div>
            <div className="bg-primary-900/80 backdrop-blur-md border border-primary-700/30 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-neutral-100 mb-2">Custom Glass</h3>
              <p className="text-neutral-300 text-sm">Using Tailwind utility classes</p>
            </div>
          </div>
        </section>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal Dialog"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-300">
            This is a glassmorphic modal dialog built with Headless UI. It features:
          </p>
          <ul className="list-disc list-inside text-neutral-300 space-y-2">
            <li>Backdrop blur for depth</li>
            <li>Smooth enter/exit animations</li>
            <li>Accessible keyboard navigation (ESC to close)</li>
            <li>Click outside to dismiss</li>
            <li>Multiple size options</li>
          </ul>

          <div className="mt-6">
            <Input
              label="Test Input in Modal"
              placeholder="Type something..."
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

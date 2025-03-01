'use client'

import { useTodoStore } from '@/lib/store'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TaskUpdateResponse {
  success: boolean
  message?: string
  error?: string
}

export function MarkdownEditor() {
  const { markdownContent, setMarkdownContent, parseMarkdownContent, stages } = useTodoStore()
  const [localContent, setLocalContent] = useState(markdownContent)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Initialize with example content if empty
  useEffect(() => {
    if (!localContent) {
      const exampleContent = `# Getting Started
This is a description for the Getting Started stage.

## Setup Environment
Make sure you have all the necessary tools installed.

### Install Node.js
Download and install the latest version of Node.js.

### Install Dependencies
Run \`bun install\` to install all dependencies.

## Create Project Structure
Set up the basic project structure.

### Create Directories
Create src, public, and assets directories.

# Development
This is the development stage.

## Implement Features
Start implementing the core features.

### Create Components
Build reusable React components.

### Add Styling
Style your components with Tailwind CSS.

## Testing
Test your application thoroughly.

### Unit Tests
Write unit tests for your components.

### Integration Tests
Test how components work together.

# Deployment
Prepare your application for deployment.

## Build Application
Create a production build.

## Deploy to Server
Upload your application to the server.`

      setLocalContent(exampleContent)
      setMarkdownContent(exampleContent)
    }
  }, [localContent, setMarkdownContent])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveStatus('idle')
      
      // Update local state
      setMarkdownContent(localContent)
      
      // Parse markdown content
      parseMarkdownContent()
      
      // Get the latest stages after parsing
      const latestStages = useTodoStore.getState().stages
      
      // Save to Redis
      const response = await fetch('/api/tasks/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stages: latestStages,
        }),
      })
      
      const data = await response.json() as TaskUpdateResponse
      
      if (data.success) {
        setSaveStatus('success')
      } else {
        setSaveStatus('error')
        console.error('Failed to save task structure:', data.error)
      }
    } catch (error) {
      console.error('Error saving task structure:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Markdown Editor</h2>
      <div className="mb-4 text-gray-600">
        <p className="mb-2">Use Markdown to define your todo list structure:</p>
        <ul className="list-disc pl-5">
          <li>
            <code># Heading 1</code> - Stage
          </li>
          <li>
            <code>## Heading 2</code> - Task
          </li>
          <li>
            <code>### Heading 3</code> - Subtask
          </li>
          <li>Regular text - Description for the item above</li>
        </ul>
      </div>

      <textarea
        value={localContent}
        onChange={handleChange}
        className="h-96 w-full rounded-md border border-gray-300 p-4 font-mono text-sm"
        placeholder="Enter your markdown here..."
      />

      <div className="mt-4 flex justify-between items-center">
        <div>
          {saveStatus === 'success' && (
            <span className="text-green-600 text-sm">
              ✓ Tasks saved to server successfully
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600 text-sm">
              ✗ Failed to save tasks to server
            </span>
          )}
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save and Publish'}
        </button>
      </div>
    </div>
  )
}

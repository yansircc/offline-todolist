"use client"

import { useState, useEffect } from "react"
import { useTodoStore } from "@/lib/store"

export function MarkdownEditor() {
  const { markdownContent, setMarkdownContent, parseMarkdownContent } = useTodoStore()
  const [localContent, setLocalContent] = useState(markdownContent)
  
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
Upload your application to the server.`;
      
      setLocalContent(exampleContent);
      setMarkdownContent(exampleContent);
    }
  }, [localContent, setMarkdownContent]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  };
  
  const handleSave = () => {
    setMarkdownContent(localContent);
    parseMarkdownContent();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-xl font-bold mb-4">Markdown Editor</h2>
      <p className="text-gray-600 mb-4">
        Use Markdown to define your todo list structure:
        <ul className="list-disc pl-5 mt-2">
          <li><code># Heading 1</code> - Stage</li>
          <li><code>## Heading 2</code> - Task</li>
          <li><code>### Heading 3</code> - Subtask</li>
          <li>Regular text - Description for the item above</li>
        </ul>
      </p>
      
      <textarea
        value={localContent}
        onChange={handleChange}
        className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm"
        placeholder="Enter your markdown here..."
      />
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save and Parse
        </button>
      </div>
    </div>
  )
} 
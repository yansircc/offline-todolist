"use client"

import { useEffect } from "react"
import { useTodoStore } from "@/lib/store"
import { Stage } from "@/components/Stage"
import { MarkdownEditor } from "@/components/MarkdownEditor"
import { checkIsAdmin } from "@/lib/utils"

export function TodoList() {
  const { 
    stages, 
    isAdmin, 
    setIsAdmin,
    toggleTaskCompletion, 
    toggleSubTaskCompletion,
    parseMarkdownContent
  } = useTodoStore()
  
  // Check if user is admin on component mount
  useEffect(() => {
    const adminStatus = checkIsAdmin()
    setIsAdmin(adminStatus)
    
    // Parse markdown content if it exists
    parseMarkdownContent()
  }, [setIsAdmin, parseMarkdownContent])
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Todo List</h1>
        <p className="text-gray-600">
          Track your progress through stages, tasks, and subtasks
        </p>
        
        {isAdmin && (
          <div className="mt-2 inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            Admin Mode
          </div>
        )}
      </div>
      
      {isAdmin && (
        <div className="mb-8">
          <MarkdownEditor />
        </div>
      )}
      
      {stages.length > 0 ? (
        <div>
          {stages.map((stage) => (
            <Stage
              key={stage.id}
              stage={stage}
              onToggleTaskCompletion={toggleTaskCompletion}
              onToggleSubTaskCompletion={toggleSubTaskCompletion}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Stages Found</h3>
          {isAdmin ? (
            <p className="text-gray-600">
              Use the Markdown Editor above to create your todo list structure.
            </p>
          ) : (
            <p className="text-gray-600">
              Add <code className="bg-gray-100 px-1 py-0.5 rounded">?user=admin</code> to the URL to access admin mode and create a todo list.
            </p>
          )}
        </div>
      )}
    </div>
  )
} 
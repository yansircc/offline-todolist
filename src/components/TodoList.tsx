'use client'

import { useEffect } from 'react'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { Stage } from '@/components/Stage'
import { useTodoStore } from '@/lib/store'
import { checkIsAdmin } from '@/lib/utils'

export function TodoList() {
  const {
    stages,
    isAdmin,
    setIsAdmin,
    toggleTaskCompletion,
    toggleSubTaskCompletion,
    parseMarkdownContent,
  } = useTodoStore()

  // Check if user is admin on component mount
  useEffect(() => {
    const adminStatus = checkIsAdmin()
    setIsAdmin(adminStatus)

    // Parse markdown content if it exists
    parseMarkdownContent()
  }, [setIsAdmin, parseMarkdownContent])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Todo List</h1>
        <p className="text-gray-600">Track your progress through stages, tasks, and subtasks</p>

        {isAdmin && (
          <div className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
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
        <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
          <h3 className="mb-2 text-xl font-medium text-gray-700">No Stages Found</h3>
          {isAdmin ? (
            <p className="text-gray-600">
              Use the Markdown Editor above to create your todo list structure.
            </p>
          ) : (
            <p className="text-gray-600">
              Add <code className="rounded bg-gray-100 px-1 py-0.5">?user=admin</code> to the URL to
              access admin mode and create a todo list.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { GroupLeaderboardContainer } from '@/components/GroupLeaderboard'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { Stage } from '@/components/Stage'
import { SyncProgress } from '@/components/SyncProgress'
import { UserProfile } from '@/components/UserProfile'
import { UserRegistration } from '@/components/UserRegistration'
import { useTodoStore, type Stage as StageType } from '@/lib/store'
import { checkIsAdmin } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface TaskApiResponse {
  success: boolean
  stages: StageType[]
  lastUpdated: string | null
  error?: string
}

export function TodoList() {
  const { 
    stages, 
    isAdmin, 
    userInfo,
    setIsAdmin,
    toggleTaskCompletion, 
    toggleSubTaskCompletion,
    parseMarkdownContent
  } = useTodoStore()
  
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  const { isRegistered } = userInfo
  
  // Check if user is admin on component mount
  useEffect(() => {
    const adminStatus = checkIsAdmin()
    setIsAdmin(adminStatus)
    
    // Parse markdown content if it exists
    parseMarkdownContent()
  }, [setIsAdmin, parseMarkdownContent])
  
  // Fetch task structure from server for non-admin users
  useEffect(() => {
    // Skip for admin users or if stages already exist
    if (isAdmin || stages.length > 0) return
    
    const fetchTaskStructure = async () => {
      try {
        setIsLoadingTasks(true)
        setTaskError(null)
        
        const response = await fetch('/api/tasks')
        const data = await response.json() as TaskApiResponse
        
        if (data.success && data.stages.length > 0) {
          // Update the store with the fetched stages
          const { setStages } = useTodoStore.getState()
          setStages(data.stages)
        } else if (data.success && data.stages.length === 0) {
          // No tasks available yet
          setTaskError('No tasks available yet. Please check back later.')
        } else {
          setTaskError(data.error ?? 'Failed to load tasks')
        }
      } catch (error) {
        console.error('Error fetching task structure:', error)
        setTaskError('Failed to connect to server')
      } finally {
        setIsLoadingTasks(false)
      }
    }
    
    void fetchTaskStructure()
  }, [isAdmin, stages.length])
  
  return (
    <div className="max-w-7xl mx-auto">
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
      
      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Main content */}
        <div className="flex-1">
          {/* User Registration Form */}
          {!isRegistered && !isAdmin && (
            <div className="mb-8">
              <UserRegistration />
            </div>
          )}
          
          {/* User Profile */}
          {isRegistered && !isAdmin && (
            <UserProfile />
          )}
          
          {/* Sync Progress */}
          {isRegistered && !isAdmin && (
            <SyncProgress />
          )}
          
          {/* Admin Markdown Editor */}
          {isAdmin && (
            <div className="mb-8">
              <MarkdownEditor />
            </div>
          )}
          
          {/* Todo List */}
          {isLoadingTasks ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Loading Tasks...</h3>
              <p className="text-gray-600">
                Please wait while we load your tasks.
              </p>
            </div>
          ) : stages.length > 0 ? (
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
              {taskError && (
                <p className="text-red-600 mb-2">{taskError}</p>
              )}
              {isAdmin ? (
                <p className="text-gray-600">
                  Use the Markdown Editor above to create your todo list structure.
                </p>
              ) : !isRegistered ? (
                <p className="text-gray-600">
                  Please register to view the todo list.
                </p>
              ) : (
                <p className="text-gray-600">
                  No tasks available. Please check back later or contact your administrator.
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Right column - Sticky leaderboard */}
        {isRegistered && !isAdmin && (
          <div className="md:w-80 lg:w-96">
            <div className="md:sticky md:top-6">
              <GroupLeaderboardContainer />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

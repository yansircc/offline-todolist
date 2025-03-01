'use client'

import { GroupConfig } from '@/components/GroupConfig'
import { GroupLeaderboardContainer } from '@/components/GroupLeaderboard'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { Stage } from '@/components/Stage'
import { SyncProgress } from '@/components/SyncProgress'
import { UserProfile } from '@/components/UserProfile'
import { UserRegistration } from '@/components/UserRegistration'
import { useTodoStore, type Stage as StageType } from '@/lib/store'
import { checkIsAdmin } from '@/lib/utils'
import { useCallback, useEffect, useState } from 'react'

interface TaskApiResponse {
  success: boolean
  stages: StageType[]
  lastUpdated: string | null
  error?: string
}

interface SyncResponse {
  success: boolean
  message?: string
  error?: string
}

// Helper function to merge task completion states
function mergeTaskCompletionStates(
  serverStages: StageType[],
  localStages: StageType[]
): StageType[] {
  // If no local stages, just return server stages
  if (localStages.length === 0) return serverStages
  
  return serverStages.map(serverStage => {
    // Find matching stage in local stages
    const localStage = localStages.find(ls => ls.id === serverStage.id)
    if (!localStage) return serverStage
    
    // Merge tasks
    const mergedTasks = serverStage.tasks.map(serverTask => {
      // Find matching task in local stage
      const localTask = localStage.tasks.find(lt => lt.id === serverTask.id)
      if (!localTask) return serverTask
      
      // Merge subtasks
      const mergedSubTasks = serverTask.subTasks.map(serverSubTask => {
        // Find matching subtask in local task
        const localSubTask = localTask.subTasks.find(lst => lst.id === serverSubTask.id)
        if (!localSubTask) return serverSubTask
        
        // Keep local completion state
        return {
          ...serverSubTask,
          completed: localSubTask.completed
        }
      })
      
      // Keep local completion state and merged subtasks
      return {
        ...serverTask,
        completed: localTask.completed,
        subTasks: mergedSubTasks
      }
    })
    
    return {
      ...serverStage,
      tasks: mergedTasks
    }
  })
}

export function TodoList() {
  const { 
    stages, 
    isAdmin, 
    userInfo,
    setIsAdmin,
    toggleTaskCompletion, 
    toggleSubTaskCompletion,
    parseMarkdownContent,
    getSubtaskCompletionStats,
    setLastSyncTime
  } = useTodoStore()
  
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const { isRegistered, nickname, groupId } = userInfo
  
  // Function to sync progress with the server
  const syncProgressToServer = useCallback(async () => {
    if (!isRegistered || !nickname || !groupId) return
    
    try {
      setIsSyncing(true)
      
      const { completedTasks, totalTasks, completedSubtasks, totalSubtasks } = getSubtaskCompletionStats()
      
      const response = await fetch('/api/groups/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          nickname,
          completedTasks,
          totalTasks,
          completedSubtasks,
          totalSubtasks
        }),
      })
      
      const data = await response.json() as SyncResponse
      
      if (data.success) {
        setLastSyncTime(new Date().toISOString())
      }
    } catch (error) {
      console.error('Error syncing progress:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isRegistered, nickname, groupId, getSubtaskCompletionStats, setLastSyncTime])
  
  // Wrapper for toggleSubTaskCompletion that also syncs progress
  const handleToggleSubTaskCompletion = useCallback((stageId: string, taskId: string, subTaskId: string) => {
    toggleSubTaskCompletion(stageId, taskId, subTaskId)
    
    // Sync progress after a short delay to ensure state is updated
    if (isRegistered && !isAdmin) {
      setTimeout(() => {
        void syncProgressToServer()
      }, 300)
    }
  }, [toggleSubTaskCompletion, syncProgressToServer, isRegistered, isAdmin])
  
  // Wrapper for toggleTaskCompletion that also syncs progress
  const handleToggleTaskCompletion = useCallback((stageId: string, taskId: string) => {
    toggleTaskCompletion(stageId, taskId)
    
    // Sync progress after a short delay to ensure state is updated
    if (isRegistered && !isAdmin) {
      setTimeout(() => {
        void syncProgressToServer()
      }, 300)
    }
  }, [toggleTaskCompletion, syncProgressToServer, isRegistered, isAdmin])
  
  // Check if user is admin on component mount
  useEffect(() => {
    const adminStatus = checkIsAdmin()
    setIsAdmin(adminStatus)
    
    // Parse markdown content if it exists
    parseMarkdownContent()
  }, [setIsAdmin, parseMarkdownContent])
  
  // Fetch task structure from server for non-admin users
  useEffect(() => {
    // Skip for admin users
    if (isAdmin) return
    
    const fetchTaskStructure = async () => {
      try {
        setIsLoadingTasks(true)
        setTaskError(null)
        
        const response = await fetch('/api/tasks')
        const data = await response.json() as TaskApiResponse
        
        if (data.success && data.stages.length > 0) {
          // Get current stages from store
          const currentStages = useTodoStore.getState().stages
          
          // Merge server stages with local completion states
          const mergedStages = mergeTaskCompletionStates(data.stages, currentStages)
          
          // Update the store with the merged stages
          const { setStages } = useTodoStore.getState()
          setStages(mergedStages)
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
  }, [isAdmin])
  
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
          
          {/* Admin Group Configuration */}
          {isAdmin && (
            <GroupConfig />
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
                  onToggleTaskCompletion={handleToggleTaskCompletion}
                  onToggleSubTaskCompletion={handleToggleSubTaskCompletion}
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
        {(isRegistered || isAdmin) && (
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

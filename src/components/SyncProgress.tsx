'use client'

import { useTodoStore } from '@/lib/store'
import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface SyncResponse {
  success: boolean
  message?: string
  error?: string
}

export function SyncProgress() {
  const { userInfo, getSubtaskCompletionStats, lastSyncTime, setLastSyncTime } = useTodoStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncSuccess, setSyncSuccess] = useState(false)
  
  const { nickname, groupId, isRegistered } = userInfo
  
  // Format the last sync time
  const formattedLastSync = lastSyncTime 
    ? new Date(lastSyncTime).toLocaleString() 
    : 'Never'
  
  const syncProgress = useCallback(async () => {
    if (!isRegistered || !nickname || !groupId) {
      setSyncError('You must register before syncing progress')
      return
    }
    
    try {
      setIsSyncing(true)
      setSyncError(null)
      setSyncSuccess(false)
      
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
        setSyncSuccess(true)
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSyncSuccess(false)
        }, 3000)
      } else {
        setSyncError(data.error ?? 'Failed to sync progress')
      }
    } catch (error) {
      setSyncError('Failed to connect to server')
      console.error('Error syncing progress:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isRegistered, nickname, groupId, getSubtaskCompletionStats, setLastSyncTime])
  
  // Auto-sync progress every 5 minutes if user is registered
  useEffect(() => {
    if (!isRegistered) return
    
    const syncInterval = setInterval(() => {
      void syncProgress()
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(syncInterval)
  }, [isRegistered, syncProgress])
  
  if (!isRegistered) return null
  
  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Group Progress Sync</h3>
        <div className="text-sm text-gray-500">
          Last sync: {formattedLastSync}
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        Your progress is automatically synced with your group. You can also manually sync your progress.
      </div>
      
      <div className="flex items-center">
        <button
          onClick={() => void syncProgress()}
          disabled={isSyncing}
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
        
        {syncError && (
          <div className="ml-3 text-sm text-red-600">
            {syncError}
          </div>
        )}
        
        {syncSuccess && (
          <div className="ml-3 text-sm text-green-600">
            Progress synced successfully!
          </div>
        )}
      </div>
    </div>
  )
} 
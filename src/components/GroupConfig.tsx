'use client'

import { type GroupConfig } from '@/lib/redis'
import { AlertTriangle, RefreshCcw, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface GroupConfigResponse {
  success: boolean
  config: GroupConfig
  error?: string
}

interface UpdateConfigResponse {
  success: boolean
  message?: string
  error?: string
}

interface ResetResponse {
  success: boolean
  message?: string
  error?: string
}

export function GroupConfig() {
  const [config, setConfig] = useState<GroupConfig>({
    totalGroups: 10,
    groupSizes: {},
    lastUpdated: new Date().toISOString()
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  
  // Fetch current configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/groups/config')
        const data = await response.json() as GroupConfigResponse
        
        if (data.success) {
          setConfig(data.config)
        } else {
          setError(data.error ?? 'Failed to load group configuration')
        }
      } catch (error) {
        console.error('Error fetching group configuration:', error)
        setError('Failed to connect to server')
      } finally {
        setIsLoading(false)
      }
    }
    
    void fetchConfig()
  }, [])
  
  // Handle total groups change
  const handleTotalGroupsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (isNaN(value) || value < 1) return
    
    setConfig(prev => ({
      ...prev,
      totalGroups: value
    }))
  }
  
  // Handle group size change
  const handleGroupSizeChange = (groupId: number, size: number) => {
    if (isNaN(size) || size < 0) return
    
    setConfig(prev => ({
      ...prev,
      groupSizes: {
        ...prev.groupSizes,
        [groupId]: size
      }
    }))
  }
  
  // Save configuration
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSaveSuccess(false)
      
      const response = await fetch('/api/groups/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config
        }),
      })
      
      const data = await response.json() as UpdateConfigResponse
      
      if (data.success) {
        setSaveSuccess(true)
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      } else {
        setError(data.error ?? 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving group configuration:', error)
      setError('Failed to connect to server')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Reset all group data
  const handleReset = async () => {
    try {
      setIsResetting(true)
      setError(null)
      setResetSuccess(false)
      
      const response = await fetch('/api/groups/reset?user=admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json() as ResetResponse
      
      if (data.success) {
        setResetSuccess(true)
        setShowResetConfirm(false)
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setResetSuccess(false)
        }, 3000)
      } else {
        setError(data.error ?? 'Failed to reset group data')
      }
    } catch (error) {
      console.error('Error resetting group data:', error)
      setError('Failed to connect to server')
    } finally {
      setIsResetting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm mb-8">
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          <h2 className="text-xl font-bold">Group Configuration</h2>
        </div>
        <div className="py-8 text-center text-gray-500">
          Loading configuration...
        </div>
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm mb-8">
      <div className="flex items-center mb-4">
        <Users className="h-5 w-5 mr-2 text-blue-600" />
        <h2 className="text-xl font-bold">Group Configuration</h2>
      </div>
      
      <div className="mb-6">
        <label htmlFor="totalGroups" className="block text-sm font-medium text-gray-700 mb-1">
          Total Number of Groups
        </label>
        <input
          type="number"
          id="totalGroups"
          min="1"
          max="100"
          value={config.totalGroups}
          onChange={handleTotalGroupsChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Group Sizes</h3>
        <p className="text-sm text-gray-600 mb-4">
          Set the maximum number of members for each group. Leave at 0 for unlimited.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: config.totalGroups }, (_, i) => i + 1).map((groupId) => (
            <div key={groupId} className="flex items-center">
              <label htmlFor={`group-${groupId}`} className="block text-sm font-medium text-gray-700 mr-2 w-16">
                Group {groupId}:
              </label>
              <input
                type="number"
                id={`group-${groupId}`}
                min="0"
                value={config.groupSizes[groupId] ?? 0}
                onChange={(e) => handleGroupSizeChange(groupId, parseInt(e.target.value, 10))}
                className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Reset All Group Data Section */}
      <div className="mb-6 border-t border-gray-200 pt-6">
        <h3 className="text-md font-medium mb-2 flex items-center text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Reset All Group Data
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          This will remove all member progress data from all groups. This action cannot be undone.
        </p>
        
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reset All Group Data
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Are you sure?</h4>
                <p className="text-sm text-red-700 mt-1">
                  This will permanently delete all progress data for all groups and members. 
                  Users will need to re-sync their progress after this action.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => void handleReset()}
                disabled={isResetting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isResetting ? (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Confirm Reset
                  </>
                )}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {resetSuccess && (
          <div className="mt-3 p-2 bg-green-50 text-green-600 rounded-md text-sm">
            ✓ All group data has been reset successfully
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-end border-t border-gray-200 pt-4">
        {saveSuccess && (
          <span className="text-green-600 text-sm mr-4">
            ✓ Configuration saved successfully
          </span>
        )}
        
        <button
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  )
} 
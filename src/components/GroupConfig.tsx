'use client'

import { type GroupConfig } from '@/lib/redis'
import { Users } from 'lucide-react'
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

export function GroupConfig() {
  const [config, setConfig] = useState<GroupConfig>({
    totalGroups: 10,
    groupSizes: {},
    lastUpdated: new Date().toISOString()
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
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
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-end">
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
'use client'

import { type GroupData } from '@/lib/redis'
import { useTodoStore } from '@/lib/store'
import { Clock, Medal, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

interface GroupLeaderboardProps {
  groupData: GroupData[]
  isLoading: boolean
  lastUpdated: string | null
}

interface GroupApiResponse {
  success: boolean
  groups: GroupData[]
}

export function GroupLeaderboard({ groupData, isLoading, lastUpdated }: GroupLeaderboardProps) {
  // Sort groups by completion percentage in descending order
  const sortedGroups = [...groupData].sort((a, b) => b.completionPercentage - a.completionPercentage)
  
  // Format the last updated time
  const formattedLastUpdated = lastUpdated 
    ? new Date(lastUpdated).toLocaleString() 
    : 'Never'
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Group Leaderboard</h2>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          Last updated: {formattedLastUpdated}
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">
          Loading leaderboard data...
        </div>
      ) : (
        <div className="space-y-4">
          {sortedGroups.map((group, index) => (
            <div 
              key={group.groupId}
              className={`p-3 rounded-md border ${index === 0 ? 'bg-amber-50 border-amber-200' : 
                index === 1 ? 'bg-gray-50 border-gray-200' : 
                index === 2 ? 'bg-orange-50 border-orange-200' : 
                'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold mr-3">
                    {index === 0 ? (
                      <Trophy className="h-5 w-5 text-amber-500" />
                    ) : index === 1 ? (
                      <Medal className="h-5 w-5 text-gray-500" />
                    ) : index === 2 ? (
                      <Medal className="h-5 w-5 text-orange-500" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Group {group.groupId}</h3>
                    <p className="text-sm text-gray-500">
                      {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{group.completionPercentage}%</div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${group.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Client component that fetches group data
export function GroupLeaderboardContainer() {
  const [groupData, setGroupData] = useState<GroupData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { lastSyncTime, setLastSyncTime } = useTodoStore()
  
  const fetchGroupData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/groups')
      const data = await response.json() as GroupApiResponse
      
      if (data.success) {
        setGroupData(data.groups)
        setLastSyncTime(new Date().toISOString())
      }
    } catch (error) {
      console.error('Error fetching group data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch data on mount and every 2 minutes
  useEffect(() => {
    void fetchGroupData()
    
    const interval = setInterval(() => {
      void fetchGroupData()
    }, 2 * 60 * 1000) // 2 minutes
    
    return () => clearInterval(interval)
  }, [])
  
  return <GroupLeaderboard groupData={groupData} isLoading={isLoading} lastUpdated={lastSyncTime} />
} 
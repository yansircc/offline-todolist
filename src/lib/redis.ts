import { env } from '@/env'
import { type Stage } from '@/lib/store'
import { Redis } from '@upstash/redis'

// Create Redis client
export const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
})

// Group configuration interface
export interface GroupConfig {
  totalGroups: number
  groupSizes: Record<string, number> // Map of groupId to max size
  lastUpdated: string
}

// Default group configuration
const DEFAULT_GROUP_CONFIG: GroupConfig = {
  totalGroups: 10,
  groupSizes: {},
  lastUpdated: new Date().toISOString()
}

// Group data interface
export interface GroupData {
  groupId: number
  completionPercentage: number
  members: GroupMember[]
  maxSize: number
  lastUpdated: string
}

export interface GroupMember {
  nickname: string
  completedTasks: number
  totalTasks: number
  completedSubtasks: number
  totalSubtasks: number
}

// Keys for Redis
const GROUP_CONFIG_KEY = 'group:config'

// Get group configuration
export async function getGroupConfig(): Promise<GroupConfig> {
  try {
    const config = await redis.get<GroupConfig>(GROUP_CONFIG_KEY)
    return config ?? DEFAULT_GROUP_CONFIG
  } catch (error) {
    console.error('Error fetching group configuration:', error)
    return DEFAULT_GROUP_CONFIG
  }
}

// Update group configuration
export async function updateGroupConfig(config: GroupConfig): Promise<boolean> {
  try {
    config.lastUpdated = new Date().toISOString()
    await redis.set(GROUP_CONFIG_KEY, config)
    return true
  } catch (error) {
    console.error('Error updating group configuration:', error)
    return false
  }
}

// Get all group data
export async function getAllGroupData(): Promise<GroupData[]> {
  try {
    const groups: GroupData[] = []
    const config = await getGroupConfig()
    
    // Get data for all configured groups
    for (let i = 1; i <= config.totalGroups; i++) {
      const groupKey = `group:${i}`
      const groupData = await redis.get<GroupData>(groupKey)
      const maxSize = config.groupSizes[i.toString()] ?? 0
      
      if (groupData) {
        // Update maxSize from config
        groups.push({
          ...groupData,
          maxSize
        })
      } else {
        // Initialize empty group data if it doesn't exist
        groups.push({
          groupId: i,
          completionPercentage: 0,
          members: [],
          maxSize,
          lastUpdated: new Date().toISOString()
        })
      }
    }
    
    return groups
  } catch (error) {
    console.error('Error fetching group data:', error)
    return []
  }
}

// Update group data with a new member or update existing member
export async function updateGroupMember(
  groupId: number, 
  nickname: string, 
  completedTasks: number, 
  totalTasks: number,
  completedSubtasks: number,
  totalSubtasks: number
): Promise<boolean> {
  try {
    const groupKey = `group:${groupId}`
    let groupData = await redis.get<GroupData>(groupKey)
    const config = await getGroupConfig()
    const maxSize = config.groupSizes[groupId.toString()] ?? 0
    
    if (!groupData) {
      // Initialize group if it doesn't exist
      groupData = {
        groupId,
        completionPercentage: 0,
        members: [],
        maxSize,
        lastUpdated: new Date().toISOString()
      }
    }
    
    // Find existing member or add new one
    const existingMemberIndex = groupData.members.findIndex(
      member => member.nickname === nickname
    )
    
    if (existingMemberIndex >= 0) {
      // Update existing member
      groupData.members[existingMemberIndex] = {
        nickname,
        completedTasks,
        totalTasks,
        completedSubtasks,
        totalSubtasks
      }
    } else {
      // Add new member
      groupData.members.push({
        nickname,
        completedTasks,
        totalTasks,
        completedSubtasks,
        totalSubtasks
      })
    }
    
    // Calculate new completion percentage based on subtasks
    const totalCompletedSubtasks = groupData.members.reduce(
      (sum, member) => sum + member.completedSubtasks, 0
    )
    const totalAllSubtasks = groupData.members.reduce(
      (sum, member) => sum + member.totalSubtasks, 0
    )
    
    groupData.completionPercentage = totalAllSubtasks > 0 
      ? Math.round((totalCompletedSubtasks / totalAllSubtasks) * 100) 
      : 0
    
    groupData.lastUpdated = new Date().toISOString()
    
    // Save updated group data
    await redis.set(groupKey, groupData)
    return true
  } catch (error) {
    console.error(`Error updating group ${groupId} member ${nickname}:`, error)
    return false
  }
}

// Task structure keys
const TASK_STRUCTURE_KEY = 'task:structure'
const TASK_STRUCTURE_UPDATED_KEY = 'task:structure:updated'

// Store task structure in Redis
export async function storeTaskStructure(stages: Stage[]): Promise<boolean> {
  try {
    // Store the task structure
    await redis.set(TASK_STRUCTURE_KEY, stages)
    
    // Update the last updated timestamp
    await redis.set(TASK_STRUCTURE_UPDATED_KEY, new Date().toISOString())
    
    return true
  } catch (error) {
    console.error('Error storing task structure:', error)
    return false
  }
}

// Get task structure from Redis
export async function getTaskStructure(): Promise<{
  stages: Stage[] | null
  lastUpdated: string | null
}> {
  try {
    // Get the task structure
    const stages = await redis.get<Stage[]>(TASK_STRUCTURE_KEY)
    
    // Get the last updated timestamp
    const lastUpdated = await redis.get<string>(TASK_STRUCTURE_UPDATED_KEY)
    
    return {
      stages,
      lastUpdated
    }
  } catch (error) {
    console.error('Error fetching task structure:', error)
    return {
      stages: null,
      lastUpdated: null
    }
  }
} 
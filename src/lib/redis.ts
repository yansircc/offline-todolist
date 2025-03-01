import { env } from '@/env'
import { type Stage } from '@/lib/store'
import { Redis } from '@upstash/redis'

// Create Redis client
export const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
})

// Group data interface
export interface GroupData {
  groupId: number
  completionPercentage: number
  members: GroupMember[]
  lastUpdated: string
}

export interface GroupMember {
  nickname: string
  completedTasks: number
  totalTasks: number
}

// Get all group data
export async function getAllGroupData(): Promise<GroupData[]> {
  try {
    const groups: GroupData[] = []
    
    // Get data for groups 1-10
    for (let i = 1; i <= 10; i++) {
      const groupKey = `group:${i}`
      const groupData = await redis.get<GroupData>(groupKey)
      
      if (groupData) {
        groups.push(groupData)
      } else {
        // Initialize empty group data if it doesn't exist
        groups.push({
          groupId: i,
          completionPercentage: 0,
          members: [],
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
  totalTasks: number
): Promise<boolean> {
  try {
    const groupKey = `group:${groupId}`
    let groupData = await redis.get<GroupData>(groupKey)
    
    if (!groupData) {
      // Initialize group if it doesn't exist
      groupData = {
        groupId,
        completionPercentage: 0,
        members: [],
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
        totalTasks
      }
    } else {
      // Add new member
      groupData.members.push({
        nickname,
        completedTasks,
        totalTasks
      })
    }
    
    // Calculate new completion percentage
    const totalCompletedTasks = groupData.members.reduce(
      (sum, member) => sum + member.completedTasks, 0
    )
    const totalAllTasks = groupData.members.reduce(
      (sum, member) => sum + member.totalTasks, 0
    )
    
    groupData.completionPercentage = totalAllTasks > 0 
      ? Math.round((totalCompletedTasks / totalAllTasks) * 100) 
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
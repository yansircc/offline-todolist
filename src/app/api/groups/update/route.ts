import { updateGroupMember } from '@/lib/redis'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface UpdateGroupRequest {
  groupId: number
  nickname: string
  completedTasks: number
  totalTasks: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as UpdateGroupRequest
    const { groupId, nickname, completedTasks, totalTasks } = body
    
    // Validate input
    if (!groupId || !nickname || completedTasks === undefined || totalTasks === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      )
    }
    
    // Validate group ID
    if (groupId < 1 || groupId > 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Group ID must be between 1 and 10'
        },
        { status: 400 }
      )
    }
    
    // Update group data
    const success = await updateGroupMember(
      Number(groupId), 
      String(nickname), 
      Number(completedTasks), 
      Number(totalTasks)
    )
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Group data updated successfully'
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update group data'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating group data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update group data'
      },
      { status: 500 }
    )
  }
} 
import { storeTaskStructure } from '@/lib/redis'
import { type Stage } from '@/lib/store'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface UpdateTaskStructureRequest {
  stages: Stage[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as UpdateTaskStructureRequest
    const { stages } = body
    
    // Validate input
    if (!stages || !Array.isArray(stages)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid task structure format'
        },
        { status: 400 }
      )
    }
    
    // Store task structure
    const success = await storeTaskStructure(stages)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Task structure updated successfully'
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update task structure'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating task structure:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update task structure'
      },
      { status: 500 }
    )
  }
} 
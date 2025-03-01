import { getGroupConfig, updateGroupConfig, type GroupConfig } from '@/lib/redis'
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// GET endpoint to retrieve current group configuration
export async function GET() {
  try {
    const config = await getGroupConfig()
    
    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Error fetching group configuration:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch group configuration'
      },
      { status: 500 }
    )
  }
}

interface UpdateGroupConfigRequest {
  config: GroupConfig
}

// POST endpoint to update group configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as UpdateGroupConfigRequest
    const { config } = body
    
    // Validate input
    if (!config || typeof config.totalGroups !== 'number' || !config.groupSizes) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid group configuration format'
        },
        { status: 400 }
      )
    }
    
    // Ensure totalGroups is within reasonable limits
    if (config.totalGroups < 1 || config.totalGroups > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Total groups must be between 1 and 100'
        },
        { status: 400 }
      )
    }
    
    // Update group configuration
    const success = await updateGroupConfig(config)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Group configuration updated successfully'
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update group configuration'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating group configuration:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update group configuration'
      },
      { status: 500 }
    )
  }
} 
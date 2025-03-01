import { resetAllGroupData } from '@/lib/redis'
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin based on URL query parameter
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('user') === 'admin'
    
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Admin access required'
        },
        { status: 403 }
      )
    }
    
    // Reset all group data
    const success = await resetAllGroupData()
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'All group data has been reset successfully'
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to reset group data'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error resetting group data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset group data'
      },
      { status: 500 }
    )
  }
} 
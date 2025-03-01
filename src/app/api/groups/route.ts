import { getAllGroupData } from '@/lib/redis'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 120 // Revalidate every 2 minutes

export async function GET() {
  try {
    const groups = await getAllGroupData()
    
    return NextResponse.json({
      success: true,
      groups
    })
  } catch (error) {
    console.error('Error fetching group data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch group data'
      },
      { status: 500 }
    )
  }
} 
import { getTaskStructure } from '@/lib/redis'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 120 // Revalidate every 2 minutes

export async function GET() {
  try {
    const { stages, lastUpdated } = await getTaskStructure()
    
    return NextResponse.json({
      success: true,
      stages: stages ?? [],
      lastUpdated
    })
  } catch (error) {
    console.error('Error fetching task structure:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch task structure'
      },
      { status: 500 }
    )
  }
} 
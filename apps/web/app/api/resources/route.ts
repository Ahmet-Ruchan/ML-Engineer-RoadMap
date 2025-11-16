import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        topic: {
          select: {
            id: true,
            titleEn: true,
            titleTr: true,
            phase: {
              select: {
                id: true,
                titleEn: true,
                titleTr: true,
                track: {
                  select: {
                    id: true,
                    titleEn: true,
                    titleTr: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: resources
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch resources'
      },
      { status: 500 }
    )
  }
}

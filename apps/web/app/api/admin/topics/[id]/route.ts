import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const topic = await prisma.topic.findUnique({
      where: { id: params.id },
      include: {
        phase: {
          include: {
            track: true
          }
        },
        resources: {
          orderBy: { order: 'asc' }
        },
        quizzes: {
          include: {
            questions: {
              include: {
                choices: true
              }
            }
          }
        }
      }
    })

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: topic
    })
  } catch (error) {
    console.error('Error fetching topic:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch topic'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const {
      slug,
      titleEn,
      titleTr,
      descriptionEn,
      descriptionTr,
      contentEn,
      contentTr,
      order,
      estimatedHours,
      difficulty
    } = body

    const topic = await prisma.topic.update({
      where: { id: params.id },
      data: {
        slug,
        titleEn,
        titleTr,
        descriptionEn,
        descriptionTr,
        contentEn,
        contentTr,
        order,
        estimatedHours,
        difficulty
      }
    })

    return NextResponse.json({
      success: true,
      data: topic
    })
  } catch (error) {
    console.error('Error updating topic:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update topic'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    // Delete related data first
    await prisma.resource.deleteMany({
      where: { topicId: params.id }
    })

    await prisma.quiz.deleteMany({
      where: { topicId: params.id }
    })

    await prisma.progressItem.deleteMany({
      where: { topicId: params.id }
    })

    await prisma.topic.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting topic:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete topic'
      },
      { status: 500 }
    )
  }
}

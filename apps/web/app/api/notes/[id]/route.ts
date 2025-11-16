import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { content } = await request.json()

    // Check if note belongs to user
    const existing = await prisma.note.findUnique({
      where: { id: params.id }
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      )
    }

    const note = await prisma.note.update({
      where: { id: params.id },
      data: { content }
    })

    return NextResponse.json({
      success: true,
      data: note
    })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update note' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Check if note belongs to user
    const existing = await prisma.note.findUnique({
      where: { id: params.id }
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      )
    }

    await prisma.note.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}

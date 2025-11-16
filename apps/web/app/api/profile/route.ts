import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.profile?.bio,
        preferredLanguage: user.profile?.preferredLanguage || 'en',
        level: user.profile?.level || 1,
        experiencePoints: user.profile?.experiencePoints || 0
      }
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { name, bio, preferredLanguage, image } = body

    // Update user data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: updateData
      })
    }

    // Update or create profile data
    const profileData: any = {}
    if (bio !== undefined) profileData.bio = bio
    if (preferredLanguage !== undefined) profileData.preferredLanguage = preferredLanguage

    if (Object.keys(profileData).length > 0) {
      await prisma.profile.upsert({
        where: { userId: session.user.id },
        update: profileData,
        create: {
          userId: session.user.id,
          ...profileData
        }
      })
    }

    // Fetch updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        name: updatedUser?.name,
        email: updatedUser?.email,
        image: updatedUser?.image,
        bio: updatedUser?.profile?.bio,
        preferredLanguage: updatedUser?.profile?.preferredLanguage || 'en',
        level: updatedUser?.profile?.level || 1,
        experiencePoints: updatedUser?.profile?.experiencePoints || 0
      }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

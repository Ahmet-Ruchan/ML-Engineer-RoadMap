import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        profile: {
          create: {
            preferredLanguage: 'en',
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    // Return detailed error message in development
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to register user'

    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Failed to register user',
        ...(process.env.NODE_ENV === 'development' && { details: String(error) }),
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { registerSchema } from '@/lib/utils/validators'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { prisma } from '@/lib/db/prismaClient'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validated = registerSchema.parse(body)
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Sign up
    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
    })
    
    if (error) {
      throw new AppError(error.message, 400)
    }
    
    if (!data.user) {
      throw new AppError('Registration failed', 400)
    }
    
    // Create user and profile in database
    try {
      await prisma.users.create({
        data: {
          id: data.user.id,
          email: validated.email,
          profile: {
            create: {
              full_name: validated.fullName || null,
              role: 'student',
            },
          },
        },
      })
    } catch (dbError) {
      console.error('Error creating user in database:', dbError)
      // User created in Supabase but not in DB - this needs manual cleanup
    }
    
    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
    })
    
    // Set auth cookies
    if (data.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }
    
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0].message,
        },
        { status: 400 }
      )
    }
    
    const { error: errorMessage, status } = handleApiError(error)
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status }
    )
  }
}


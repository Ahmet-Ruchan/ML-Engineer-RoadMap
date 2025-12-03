import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided'
        },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only PDF files are allowed'
        },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'File size must be less than 10MB'
        },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'resources')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${sanitizedName}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return file URL
    const fileUrl = `/uploads/resources/${filename}`

    return NextResponse.json({
      success: true,
      data: {
        fileUrl,
        filename,
        size: file.size,
        type: file.type
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file'
      },
      { status: 500 }
    )
  }
}


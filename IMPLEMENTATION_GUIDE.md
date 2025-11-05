# 🚀 ML Engineer Roadmap - Implementation Guide

This guide will help you complete the MVP implementation step by step.

## ✅ Completed (Foundation)

- ✅ **Architecture Documentation** - Full system design in `ARCHITECTURE.md`
- ✅ **Database Schema** - Prisma schema with all MVP models
- ✅ **Monorepo Structure** - Turborepo configured with packages
- ✅ **Authentication** - Supabase Auth with RBAC, middleware, login/register pages
- ✅ **Service Layer** - Business logic for progress, quizzes, bookmarks, resources

## 🚧 Next Steps to Complete MVP

### 1. Set Up Environment Variables

Create `.env` file in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database  
DATABASE_URL=postgresql://postgres:password@localhost:5432/ml_roadmap

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Install Dependencies & Setup Database

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm install --workspaces

# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR run migrations (for production)
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 3. Complete API Endpoints

Create the following API routes in `apps/web/src/app/api/`:

#### Progress API (`progress/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/supabaseClient'
import { ProgressService } from '@/lib/services/progressService'
import { handleApiError, AppError } from '@/lib/utils/errors'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) throw new AppError('Unauthorized', 401)
    
    const { searchParams } = new URL(request.url)
    const phaseId = searchParams.get('phaseId') || undefined
    
    const progress = await ProgressService.getUserProgress(user.id, phaseId)
    
    return NextResponse.json({ success: true, data: progress })
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error)
    return NextResponse.json({ success: false, error: errorMessage }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) throw new AppError('Unauthorized', 401)
    
    const body = await request.json()
    const progress = await ProgressService.updateProgress(user.id, body)
    
    return NextResponse.json({ success: true, data: progress })
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error)
    return NextResponse.json({ success: false, error: errorMessage }, { status })
  }
}
```

#### Progress Stats API (`progress/stats/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/supabaseClient'
import { ProgressService } from '@/lib/services/progressService'
import { handleApiError, AppError } from '@/lib/utils/errors'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) throw new AppError('Unauthorized', 401)
    
    const stats = await ProgressService.getProgressStats(user.id)
    
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error)
    return NextResponse.json({ success: false, error: errorMessage }, { status })
  }
}
```

**Similarly, create:**
- `quiz/route.ts` - List quizzes
- `quiz/[id]/route.ts` - Get quiz details
- `quiz/[id]/submit/route.ts` - Submit quiz answers
- `bookmark/route.ts` - List/create bookmarks
- `bookmark/[id]/route.ts` - Delete bookmark
- `resources/route.ts` - List resources
- `resources/[id]/route.ts` - Get resource details

### 4. Create Student Pages

#### Dashboard (`apps/web/src/app/dashboard/page.tsx`)
```typescript
import { getUser } from '@/lib/auth/supabaseClient'
import { ProgressService } from '@/lib/services/progressService'
import { BookmarkService } from '@/lib/services/bookmarkService'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  
  const stats = await ProgressService.getProgressStats(user.id)
  const bookmarks = await BookmarkService.getUserBookmarks(user.id)
  
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Your Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Completed</h3>
          <p className="text-3xl font-bold">{stats.completed}</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">In Progress</h3>
          <p className="text-3xl font-bold">{stats.inProgress}</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Overall Progress</h3>
          <p className="text-3xl font-bold">{stats.percentage}%</p>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Bookmarks</h2>
        {bookmarks.length === 0 ? (
          <p className="text-muted-foreground">No bookmarks yet</p>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{bookmark.topic.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {bookmark.topic.phase.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

#### Roadmap List (`apps/web/src/app/roadmap/page.tsx`)
```typescript
import { prisma } from '@/lib/db/prismaClient'
import Link from 'next/link'

export default async function RoadmapPage() {
  const phases = await prisma.phase.findMany({
    where: { published: true },
    include: {
      topics: {
        where: { published: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })
  
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">ML Engineer Roadmap</h1>
      
      <div className="space-y-8">
        {phases.map((phase) => (
          <div key={phase.id} className="border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{phase.title}</h2>
                <p className="text-muted-foreground mt-2">{phase.description}</p>
              </div>
              <span className="text-sm px-3 py-1 rounded-full bg-secondary">
                {phase.difficulty}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {phase.topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/roadmap/${phase.slug}/${topic.slug}`}
                  className="border rounded p-4 hover:bg-accent transition"
                >
                  <h3 className="font-semibold">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {topic.estimated_time} min
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Create similar pages for:**
- `roadmap/[phase]/page.tsx` - Phase detail page
- `roadmap/[phase]/[topic]/page.tsx` - Topic detail with MDX content
- `quizzes/page.tsx` - Quiz list
- `quizzes/[id]/page.tsx` - Take quiz
- `resources/page.tsx` - Resource library

### 5. Create MDX Content

Create content structure:

```
apps/web/content/
├── en/
│   └── ml/
│       ├── phase-1-foundations.mdx
│       ├── python-basics.mdx
│       ├── linear-algebra.mdx
│       └── calculus.mdx
└── tr/
    └── ml/
        ├── phase-1-foundations.mdx
        ├── python-basics.mdx
        └── ...
```

Example MDX file (`python-basics.mdx`):

```mdx
---
title: "Python Basics"
description: "Learn Python fundamentals"
difficulty: "beginner"
duration: 240
---

# Python Basics

## Introduction

Python is a high-level, interpreted programming language...

## Variables and Data Types

```python
# Variables
x = 10
name = "John"
is_active = True
```

## Control Flow

### If Statements
...

## Practice Exercises

1. Create a program that...
2. Implement a function that...
```

### 6. Admin Panel (Basic CRUD)

Create admin routes in `apps/web/src/app/admin/`:

- `admin/page.tsx` - Dashboard with statistics
- `admin/phases/page.tsx` - List phases with create/edit/delete
- `admin/topics/page.tsx` - List topics with CRUD
- `admin/resources/page.tsx` - List resources with CRUD
- `admin/quizzes/page.tsx` - List quizzes with CRUD
- `admin/users/page.tsx` - List users with statistics

Each admin page should:
1. Check if user is admin (middleware already does this)
2. Fetch data from database
3. Provide forms for CRUD operations
4. Use API routes for mutations

### 7. Run the Application

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm run start
```

Visit:
- http://localhost:3000 - Home page
- http://localhost:3000/register - Register
- http://localhost:3000/login - Login
- http://localhost:3000/dashboard - Dashboard (after login)
- http://localhost:3000/roadmap - Roadmap
- http://localhost:3000/admin - Admin panel (admin only)

## 📦 Deployment

### Supabase Setup

1. Create new Supabase project
2. Copy database URL and keys
3. Run migrations: `npx prisma migrate deploy`
4. Seed database: `npm run db:seed`
5. Set up Storage bucket for PDFs (if needed)

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

```bash
# Or use Vercel CLI
vercel --prod
```

## 🎯 Testing Checklist

- [ ] User can register and login
- [ ] User can view roadmap phases and topics
- [ ] User can track progress (planned/in_progress/completed)
- [ ] User can bookmark topics
- [ ] User can take quizzes and see results
- [ ] User can view resources
- [ ] Admin can login and access admin panel
- [ ] Admin can CRUD phases, topics, resources, quizzes
- [ ] Database is seeded with sample data
- [ ] Site is responsive on mobile

## 🔧 Common Issues & Solutions

### Prisma Client not generated
```bash
npm run db:generate
```

### Database connection error
- Check DATABASE_URL in .env
- Ensure Supabase project is running
- Check firewall/network settings

### Auth not working
- Verify Supabase URL and keys
- Check middleware.ts is configured correctly
- Clear cookies and try again

### Build errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

## 📚 Next Features (Post-MVP)

1. **Multi-track support** - Add AI, CS, SE, DS tracks
2. **Gamification** - Points, badges, levels, leaderboards
3. **Personal notes** - Allow users to take notes on topics
4. **Interactive exercises** - Code playgrounds, practice problems
5. **AI coaching** - Personalized recommendations
6. **Video content** - Video lectures and tutorials
7. **Discussion forum** - Community Q&A
8. **Certificates** - Generate completion certificates
9. **Mobile app** - React Native or PWA
10. **Analytics dashboard** - Advanced user insights

## 🤝 Contributing

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system design and coding standards.

Key principles:
- Always use service layer (never bypass)
- Validate all inputs with Zod
- Handle errors properly with AppError
- Follow TypeScript strict mode
- Write readable, documented code

## 📝 License

MIT License - See LICENSE file

---

**Happy coding! 🚀**

Need help? Check ARCHITECTURE.md or create an issue on GitHub.


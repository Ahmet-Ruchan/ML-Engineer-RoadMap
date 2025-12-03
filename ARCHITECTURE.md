# 🧠 ML Engineer Roadmap — Full Project Architecture & Context Guide

> **Goal:** Interactive learning platform for ML/AI roadmap — bilingual (EN/TR), gamified progress tracking, full-stack (Next.js + Supabase).
>
> **Deploy:** Vercel (frontend & API) + Supabase (DB/Auth/Storage).
>
> **Stack:** TypeScript · Next.js 14 (App Router) · Prisma · Tailwind · shadcn/ui · next-intl · Supabase.

---

## 📋 Table of Contents

1. [Project Vision](#-project-vision)
2. [Top-Level Architecture](#-top-level-architecture)
3. [Hybrid Content Model](#-hybrid-content-model)
4. [Folder Structure](#-folder-structure)
5. [Database Schema](#-database-schema)
6. [Authentication & Authorization](#-authentication--authorization)
7. [Service Layer Pattern](#-service-layer-pattern)
8. [API Design](#-api-design)
9. [Admin Panel Architecture](#-admin-panel-architecture)
10. [Student Experience Flow](#-student-experience-flow)
11. [Development Workflow](#-development-workflow)
12. [Deployment Strategy](#-deployment-strategy)

---

## 🎯 Project Vision

### What We're Building

An **interactive, gamified learning platform** that serves as a comprehensive roadmap for aspiring:
- 🤖 Machine Learning Engineers
- 🧠 AI Engineers
- 💻 Computer Scientists
- 🔧 Software Engineers
- 📊 Data Scientists

### Core Philosophy

**"Compete with your yesterday self"** - Users track their progress, take notes, complete quizzes, and access resources (PDFs, links, videos) all in one place. The platform records every action to create a complete learning journal.

### MVP Scope (2-3 months)

**In Scope:**
- ✅ Single track (ML Engineer only)
- ✅ User authentication & profiles
- ✅ Roadmap (Phase → Topic → Resource)
- ✅ Progress tracking (planned/in_progress/completed)
- ✅ Quiz system with scoring
- ✅ Bookmark system
- ✅ PDF storage & download
- ✅ Admin panel (content & user management)
- ✅ Bilingual (EN/TR)

**Out of Scope (Future):**
- ❌ Multi-track (AI, CS, SE, DS tracks)
- ❌ Gamification (points, badges, levels)
- ❌ Personal notes system
- ❌ Interactive exercises
- ❌ AI coaching
- ❌ Video streaming
- ❌ Advanced analytics

---

## 🏗️ Top-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js 14 App (SSR + API)               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │   Public    │  │   Student   │  │    Admin     │  │  │
│  │  │   Pages     │  │   Routes    │  │    Panel     │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │            API Routes (RESTful)                  │  │  │
│  │  │   /api/progress  /api/quiz  /api/admin/...     │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │              Service Layer                       │  │  │
│  │  │  Business Logic + Validation + Authorization    │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │  Auth (JWT)  │  │   Storage    │     │
│  │  + Prisma    │  │    + RLS     │  │   (PDFs)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | SSR, routing, API routes |
| **Language** | TypeScript (strict) | Type safety |
| **Styling** | TailwindCSS + shadcn/ui | Design system |
| **ORM** | Prisma | Type-safe DB access |
| **Database** | Supabase PostgreSQL | Managed database |
| **Auth** | Supabase Auth (JWT) | Authentication |
| **Storage** | Supabase Storage | PDF/media files |
| **i18n** | next-intl | Internationalization |
| **Monorepo** | Turborepo | Build orchestration |

---

## 🔀 Hybrid Content Model

We use a **hybrid approach** combining database flexibility with MDX performance:

### What Lives in the Database (Prisma/PostgreSQL)

**Metadata & Structure:**
- Track, Phase, Topic hierarchy
- Short descriptions (1-2 paragraphs)
- Order, difficulty, duration
- Status (draft/published)
- Relationships (foreign keys)

**Dynamic Content:**
- Resources (links, PDFs, videos)
- Quizzes, questions, choices
- User progress, bookmarks
- Quiz attempts, scores

**Why Database?**
- Admin can edit via UI
- Dynamic queries (filtering, search)
- User-specific data (progress, bookmarks)
- Real-time updates

### What Lives in MDX Files

**Long-Form Content:**
- Detailed topic explanations
- Tutorials, guides
- Code examples
- Rich formatting (headings, lists, tables)

**File Structure:**
```
content/
├── en/
│   └── ml/
│       ├── phase-1-foundations.mdx
│       ├── python-basics.mdx
│       ├── linear-algebra.mdx
│       └── ...
└── tr/
    └── ml/
        ├── phase-1-foundations.mdx
        ├── python-basics.mdx
        └── ...
```

**Why MDX?**
- Performance (static compilation)
- Version control (Git)
- Developer-friendly syntax
- Component embedding

### How They Connect

```typescript
// Database model
model topic {
  id          String  @id @default(uuid())
  title       String
  description String  // Short description (DB)
  mdx_path    String? // Reference to MDX file: "ml/python-basics"
  phase_id    String
  phase       phase   @relation(...)
}

// Page rendering
const topic = await prisma.topic.findUnique({ where: { id } })
const mdxContent = await loadMDX(`${locale}/${topic.mdx_path}.mdx`)
```

---

## 📁 Folder Structure

### Monorepo Layout

```
ml-roadmap/
├── apps/
│   └── web/                    → Main Next.js application
├── packages/
│   ├── db/                     → Prisma schema + client
│   ├── ui/                     → Shared UI components
│   └── config/                 → Shared configs (ESLint, Tailwind, TS)
├── .cursor/
│   └── rules/
│       └── project-rules.mdc   → AI agent rules
├── turbo.json                  → Turborepo config
├── package.json                → Root dependencies
├── ARCHITECTURE.md             → This file
└── README.md                   → Project overview
```

### `apps/web/` - Main Application

```
apps/web/
├── app/                        → Next.js App Router
│   ├── layout.tsx              → Root layout (providers, theme)
│   ├── page.tsx                → Home page
│   │
│   ├── (auth)/                 → Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── roadmap/                → Public roadmap
│   │   ├── page.tsx            → Phase list
│   │   └── [phase]/
│   │       ├── page.tsx        → Phase detail
│   │       └── [topic]/
│   │           └── page.tsx    → Topic detail + MDX
│   │
│   ├── resources/              → Resource library
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── quizzes/                → Quiz system
│   │   ├── page.tsx            → Quiz list
│   │   └── [id]/
│   │       ├── page.tsx        → Take quiz
│   │       └── results/
│   │           └── page.tsx    → Quiz results
│   │
│   ├── dashboard/              → User dashboard (protected)
│   │   ├── layout.tsx
│   │   ├── page.tsx            → Dashboard home
│   │   └── progress/
│   │       └── page.tsx        → Detailed progress
│   │
│   ├── admin/                  → Admin panel (role protected)
│   │   ├── layout.tsx          → Admin navigation
│   │   ├── page.tsx            → Admin dashboard
│   │   ├── phases/
│   │   │   ├── page.tsx        → Phase list
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       └── edit/page.tsx
│   │   ├── topics/
│   │   │   └── ...
│   │   ├── resources/
│   │   │   └── ...
│   │   ├── quizzes/
│   │   │   └── ...
│   │   └── users/
│   │       └── page.tsx
│   │
│   ├── api/                    → API routes
│   │   ├── health/
│   │   │   └── route.ts
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── progress/
│   │   │   ├── route.ts        → GET/POST progress
│   │   │   └── stats/route.ts
│   │   ├── quiz/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── submit/route.ts
│   │   ├── bookmark/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── resources/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── download/route.ts
│   │   └── admin/
│   │       ├── phases/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── topics/
│   │       ├── resources/
│   │       ├── quizzes/
│   │       └── users/
│   │
│   └── globals.css
│
├── components/                 → React components
│   ├── ui/                     → shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/                 → Layout components
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   └── theme-toggle.tsx
│   ├── roadmap/                → Roadmap-specific
│   │   ├── phase-card.tsx
│   │   ├── topic-card.tsx
│   │   ├── progress-bar.tsx
│   │   └── bookmark-button.tsx
│   ├── quiz/                   → Quiz components
│   │   ├── quiz-card.tsx
│   │   ├── question-card.tsx
│   │   └── quiz-timer.tsx
│   ├── resource/               → Resource components
│   │   ├── resource-card.tsx
│   │   └── pdf-viewer.tsx
│   └── admin/                  → Admin components
│       ├── data-table.tsx
│       ├── form-builder.tsx
│       ├── file-uploader.tsx
│       └── confirm-dialog.tsx
│
├── hooks/                      → Custom React hooks
│   ├── use-auth.ts
│   ├── use-progress.ts
│   └── use-locale.ts
│
├── lib/                        → Core business logic
│   ├── auth/
│   │   └── supabaseClient.ts   → Supabase client + helpers
│   ├── db/
│   │   └── prismaClient.ts     → Prisma client singleton
│   ├── services/               → Service layer (business logic)
│   │   ├── authService.ts
│   │   ├── progressService.ts
│   │   ├── quizService.ts
│   │   ├── bookmarkService.ts
│   │   └── resourceService.ts
│   ├── utils/                  → Utility functions
│   │   ├── errors.ts           → AppError class
│   │   ├── validators.ts       → Zod schemas
│   │   └── formatters.ts
│   └── constants/              → Constants
│       ├── api-routes.ts
│       └── enums.ts
│
├── locales/                    → i18n translations
│   ├── en/
│   │   ├── common.json
│   │   ├── roadmap.json
│   │   ├── quiz.json
│   │   └── admin.json
│   └── tr/
│       └── ...
│
├── content/                    → MDX content files
│   ├── en/
│   │   └── ml/
│   │       ├── phase-1-foundations.mdx
│   │       ├── python-basics.mdx
│   │       └── ...
│   └── tr/
│       └── ml/
│           └── ...
│
├── middleware.ts               → Auth + i18n middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### `packages/db/` - Database Layer

```
packages/db/
├── prisma/
│   ├── schema.prisma           → Database schema
│   ├── migrations/             → Migration history
│   └── seed.ts                 → Seed script
├── src/
│   └── client.ts               → Prisma client export
├── package.json
└── tsconfig.json
```

### `packages/ui/` - Shared UI Components

```
packages/ui/
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   └── ...
├── index.ts                    → Export all components
├── package.json
└── tsconfig.json
```

### `packages/config/` - Shared Configs

```
packages/config/
├── eslint.config.js
├── tailwind.preset.js
├── tsconfig.base.json
└── package.json
```

---

## 🗄️ Database Schema

### Core Tables

#### User Management

```prisma
model users {
  id         String   @id @default(uuid())
  email      String   @unique
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  profile          profiles?
  progress_items   progress_item[]
  bookmarks        bookmark[]
  quiz_attempts    quiz_attempt[]
}

model profiles {
  id            String   @id @default(uuid())
  user_id       String   @unique
  full_name     String?
  avatar_url    String?
  role          String   @default("student") // student, admin
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  
  user users @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

#### Content Hierarchy

```prisma
model phase {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  description String?
  order       Int
  difficulty  String   // beginner, intermediate, advanced
  duration    Int?     // estimated days
  mdx_path    String?  // path to MDX file
  published   Boolean  @default(false)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  topics topic[]
}

model topic {
  id          String   @id @default(uuid())
  phase_id    String
  title       String
  slug        String
  description String?  // Short description (DB)
  mdx_path    String?  // Full content (MDX): "ml/python-basics"
  order       Int
  estimated_time Int?  // minutes
  published   Boolean  @default(false)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  phase           phase             @relation(fields: [phase_id], references: [id], onDelete: Cascade)
  resources       resource[]
  quizzes         quiz[]
  progress_items  progress_item[]
  bookmarks       bookmark[]
  
  @@unique([phase_id, slug])
}

model resource {
  id          String   @id @default(uuid())
  topic_id    String
  title       String
  description String?
  type        String   // pdf, link, video, book
  url         String?  // External link
  file_path   String?  // Supabase Storage path
  file_size   Int?     // bytes
  license     String?  // Copyright info
  order       Int      @default(0)
  published   Boolean  @default(false)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  topic topic @relation(fields: [topic_id], references: [id], onDelete: Cascade)
}
```

#### Quiz System

```prisma
model quiz {
  id          String   @id @default(uuid())
  topic_id    String
  title       String
  description String?
  pass_score  Int      @default(70) // percentage
  time_limit  Int?     // minutes
  published   Boolean  @default(false)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  topic      topic          @relation(fields: [topic_id], references: [id], onDelete: Cascade)
  questions  question[]
  attempts   quiz_attempt[]
}

model question {
  id          String   @id @default(uuid())
  quiz_id     String
  question_text String
  explanation String?  // Shown after answer
  order       Int
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  quiz    quiz     @relation(fields: [quiz_id], references: [id], onDelete: Cascade)
  choices choice[]
  answers quiz_answer[]
}

model choice {
  id          String   @id @default(uuid())
  question_id String
  choice_text String
  is_correct  Boolean  @default(false)
  order       Int
  created_at  DateTime @default(now())
  
  question question      @relation(fields: [question_id], references: [id], onDelete: Cascade)
  answers  quiz_answer[]
}

model quiz_attempt {
  id          String   @id @default(uuid())
  user_id     String
  quiz_id     String
  score       Int?     // percentage
  passed      Boolean  @default(false)
  started_at  DateTime @default(now())
  completed_at DateTime?
  
  user    users         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  quiz    quiz          @relation(fields: [quiz_id], references: [id], onDelete: Cascade)
  answers quiz_answer[]
}

model quiz_answer {
  id              String   @id @default(uuid())
  attempt_id      String
  question_id     String
  choice_id       String
  is_correct      Boolean
  answered_at     DateTime @default(now())
  
  attempt  quiz_attempt @relation(fields: [attempt_id], references: [id], onDelete: Cascade)
  question question     @relation(fields: [question_id], references: [id], onDelete: Cascade)
  choice   choice       @relation(fields: [choice_id], references: [id], onDelete: Cascade)
}
```

#### User Progress

```prisma
model progress_item {
  id          String   @id @default(uuid())
  user_id     String
  topic_id    String
  status      String   // planned, in_progress, completed
  started_at  DateTime?
  completed_at DateTime?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  user  users @relation(fields: [user_id], references: [id], onDelete: Cascade)
  topic topic @relation(fields: [topic_id], references: [id], onDelete: Cascade)
  
  @@unique([user_id, topic_id])
}

model bookmark {
  id         String   @id @default(uuid())
  user_id    String
  topic_id   String
  created_at DateTime @default(now())
  
  user  users @relation(fields: [user_id], references: [id], onDelete: Cascade)
  topic topic @relation(fields: [topic_id], references: [id], onDelete: Cascade)
  
  @@unique([user_id, topic_id])
}
```

### Entity Relationship Diagram (Simplified)

```
users ─────< progress_item >───── topic
  │                                  │
  │                                  ├─< resource
  └────< bookmark >──────────────────┤
  │                                  └─< quiz ─< question ─< choice
  │                                               │
  └────< quiz_attempt >──────────────────────────┘
            │
            └─< quiz_answer >─────────────────────┘
```

---

## 🔐 Authentication & Authorization

### Supabase Auth Integration

**Authentication Flow:**
1. User registers/logs in via Supabase Auth
2. JWT token issued
3. Token stored in httpOnly cookie
4. Middleware validates token on each request

### Role-Based Access Control (RBAC)

```typescript
// profiles.role values
enum UserRole {
  STUDENT = "student",  // Default role
  ADMIN = "admin"       // Full access
}
```

### Route Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Admin routes - require admin role
  if (pathname.startsWith('/admin')) {
    const user = await getUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.redirect('/login')
    }
  }
  
  // Protected routes - require authentication
  if (pathname.startsWith('/dashboard')) {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.redirect('/login')
    }
  }
  
  return NextResponse.next()
}
```

### Row Level Security (RLS)

Supabase RLS policies ensure:
- Users can only access their own progress, bookmarks, quiz attempts
- Admin can access all data
- Public content (published phases, topics) visible to all

---

## 🧠 Service Layer Pattern

All business logic lives in the service layer. Services handle:
- Validation (Zod schemas)
- Authorization (user permissions)
- Database operations (via Prisma)
- Error handling (AppError)

### Service Structure

```typescript
// lib/services/progressService.ts
import { prisma } from '@/lib/db/prismaClient'
import { AppError } from '@/lib/utils/errors'
import { z } from 'zod'

const updateProgressSchema = z.object({
  topicId: z.string().uuid(),
  status: z.enum(['planned', 'in_progress', 'completed'])
})

export const ProgressService = {
  async updateProgress(userId: string, data: unknown) {
    // 1. Validate input
    const validated = updateProgressSchema.parse(data)
    
    // 2. Check authorization (topic exists and is published)
    const topic = await prisma.topic.findUnique({
      where: { id: validated.topicId }
    })
    
    if (!topic || !topic.published) {
      throw new AppError('Topic not found', 404)
    }
    
    // 3. Update or create progress
    const progress = await prisma.progress_item.upsert({
      where: {
        user_id_topic_id: {
          user_id: userId,
          topic_id: validated.topicId
        }
      },
      update: {
        status: validated.status,
        ...(validated.status === 'in_progress' && !progress.started_at && {
          started_at: new Date()
        }),
        ...(validated.status === 'completed' && {
          completed_at: new Date()
        })
      },
      create: {
        user_id: userId,
        topic_id: validated.topicId,
        status: validated.status,
        ...(validated.status === 'in_progress' && {
          started_at: new Date()
        }),
        ...(validated.status === 'completed' && {
          completed_at: new Date()
        })
      }
    })
    
    return progress
  },
  
  async getUserProgress(userId: string, phaseId?: string) {
    return prisma.progress_item.findMany({
      where: {
        user_id: userId,
        ...(phaseId && {
          topic: {
            phase_id: phaseId
          }
        })
      },
      include: {
        topic: {
          include: {
            phase: true
          }
        }
      },
      orderBy: {
        updated_at: 'desc'
      }
    })
  },
  
  async getProgressStats(userId: string) {
    const total = await prisma.topic.count({ where: { published: true } })
    const completed = await prisma.progress_item.count({
      where: {
        user_id: userId,
        status: 'completed'
      }
    })
    const inProgress = await prisma.progress_item.count({
      where: {
        user_id: userId,
        status: 'in_progress'
      }
    })
    
    return {
      total,
      completed,
      inProgress,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }
}
```

### Error Handling

```typescript
// lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}
```

---

## 🌐 API Design

### Standard Response Format

All API routes return consistent JSON:

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": "Error message"
}
```

### API Route Example

```typescript
// app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/supabaseClient'
import { ProgressService } from '@/lib/services/progressService'
import { AppError } from '@/lib/utils/errors'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      throw new AppError('Unauthorized', 401)
    }
    
    const { searchParams } = new URL(request.url)
    const phaseId = searchParams.get('phaseId') || undefined
    
    const progress = await ProgressService.getUserProgress(user.id, phaseId)
    
    return NextResponse.json({
      success: true,
      data: progress
    })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      )
    }
    
    console.error('Progress API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      throw new AppError('Unauthorized', 401)
    }
    
    const body = await request.json()
    const progress = await ProgressService.updateProgress(user.id, body)
    
    return NextResponse.json({
      success: true,
      data: progress
    })
  } catch (error) {
    // Error handling...
  }
}
```

---

## 🛠️ Admin Panel Architecture

### Access Control

Admin panel routes (`/admin/*`) are protected by:
1. Authentication check (user logged in)
2. Role check (user.role === 'admin')

### Admin Features

#### Dashboard
- User statistics (total, active today, new this week)
- Content statistics (phases, topics, resources, quizzes)
- Recent activity feed

#### Content Management
- **Phases**: CRUD, reorder, publish/unpublish
- **Topics**: CRUD, link to MDX, assign to phase
- **Resources**: CRUD, upload PDFs, manage metadata
- **Quizzes**: CRUD, add questions/choices, set scoring

#### User Management
- List all users with search/filter
- View user details (progress, quiz scores)
- Export user data

---

## 🎓 Student Experience Flow

### 1. Registration & Onboarding
User registers → Profile created → Redirected to roadmap

### 2. Browse Roadmap
View phases → Select phase → View topics

### 3. Learn
Click topic → Read MDX content → View resources → Download PDFs

### 4. Track Progress
Mark as "in progress" → Mark as "completed" → Progress updates

### 5. Test Knowledge
Take quiz → Answer questions → View results → See explanations

### 6. Dashboard
View overall progress → Check bookmarks → Review quiz history

---

## 🔄 Development Workflow

### 1. New Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/add-notes-system

# 2. Update database schema (if needed)
# Edit packages/db/prisma/schema.prisma

# 3. Create migration
cd packages/db
npx prisma migrate dev --name add_notes_table

# 4. Create service
# apps/web/lib/services/noteService.ts

# 5. Create API routes
# apps/web/app/api/notes/route.ts

# 6. Create UI components
# apps/web/components/notes/note-editor.tsx

# 7. Create pages
# apps/web/app/dashboard/notes/page.tsx

# 8. Test locally
npm run dev

# 9. Commit and push
git add .
git commit -m "feat: Add notes system"
git push origin feature/add-notes-system

# 10. Create PR
```

### 2. Adding New Content (Admin)

```
1. Login to /admin
2. Navigate to Topics
3. Create new topic
4. Create corresponding MDX file: content/en/ml/topic-slug.mdx
5. Add resources (PDFs, links)
6. Create quiz (optional)
7. Publish topic
```

---

## 🚀 Deployment Strategy

### Environment Setup

**Required Environment Variables:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...

# Database
DATABASE_URL=postgresql://postgres:xxxxx@db.xxxxx.supabase.co:5432/postgres

# App
NEXT_PUBLIC_APP_URL=https://ml-roadmap.com
NODE_ENV=production
```

### Deployment Steps

1. **Database Setup (Supabase)**
   ```bash
   # Run migrations
   npx prisma migrate deploy
   
   # Seed database
   npm run seed
   ```

2. **Storage Setup (Supabase)**
   - Create bucket: `resources`
   - Set public access for published resources
   - Configure RLS policies

3. **Vercel Deployment**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

4. **Post-Deployment**
   - Verify all environment variables
   - Test authentication
   - Upload sample PDFs
   - Create admin user

---

## 📝 Notes for AI Agents & Developers

### When Adding New Features

1. **Database First**: Always start with schema design
2. **Service Layer**: Implement business logic
3. **API Routes**: Create RESTful endpoints
4. **UI Components**: Build reusable components
5. **Pages**: Compose components into pages

### Critical Rules

- ✅ **Never bypass service layer** - All DB access through services
- ✅ **Always validate input** - Use Zod schemas
- ✅ **Handle errors gracefully** - Use AppError class
- ✅ **Check authorization** - Verify user permissions
- ✅ **Type everything** - No `any` types
- ✅ **Document complex logic** - Add comments

### Common Patterns

**Fetching data in Server Component:**
```typescript
// app/roadmap/page.tsx
import { prisma } from '@/lib/db/prismaClient'

export default async function RoadmapPage() {
  const phases = await prisma.phase.findMany({
    where: { published: true },
    orderBy: { order: 'asc' }
  })
  
  return <PhaseList phases={phases} />
}
```

**Client-side data mutation:**
```typescript
// components/bookmark-button.tsx
'use client'

async function toggleBookmark(topicId: string) {
  const res = await fetch('/api/bookmark', {
    method: 'POST',
    body: JSON.stringify({ topicId })
  })
  
  const data = await res.json()
  if (data.success) {
    // Update UI
  }
}
```

---

## 🎯 Success Metrics

### MVP Launch Criteria

- [ ] 50+ topics with MDX content (EN + TR)
- [ ] 100+ resources (PDFs, links)
- [ ] 20+ quizzes with 100+ questions
- [ ] Full admin panel functionality
- [ ] Mobile responsive design
- [ ] < 3s page load time
- [ ] 0 TypeScript errors
- [ ] All API endpoints tested

---

## 📚 Additional Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Last Updated:** November 2025
**Version:** 1.0.0 (MVP)
**Maintainer:** @Ahmet-Ruchan


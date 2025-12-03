# 🛠️ Development Guide

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

**Option A: Supabase (Recommended)**

Follow the guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Option B: Local PostgreSQL**

```bash
# Start PostgreSQL with Docker
docker run -d \
  --name ml-roadmap-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ml_roadmap \
  -p 5432:5432 \
  postgres:15

# Update apps/web/.env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ml_roadmap
```

### 3. Run Migrations

```bash
cd packages/db
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Create database tables
pnpm db:seed      # Add initial data
```

### 4. Start Development Server

```bash
# From root directory
pnpm dev

# Or specific app
cd apps/web
pnpm dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
ml-roadmap/
├── apps/
│   └── web/                 # Next.js application
│       ├── app/
│       │   ├── [locale]/    # i18n routes (en/tr)
│       │   └── api/         # API endpoints
│       ├── components/      # React components
│       ├── lib/
│       │   ├── services/    # Business logic
│       │   ├── auth/        # Authentication
│       │   └── db/          # Database access
│       └── locales/         # Translations (en/tr)
│
├── packages/
│   ├── db/                  # Prisma schema & client
│   ├── ui/                  # Shared UI components
│   └── config/              # Shared configs
│
└── turbo.json               # Monorepo build config
```

---

## Available Scripts

### Root Level

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm lint         # Lint all packages
pnpm clean        # Clean all build outputs
```

### Apps/Web

```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Lint code
pnpm typecheck    # Type checking
```

### Packages/DB

```bash
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema without migration
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed database
```

---

## Database Management

### View Database (Prisma Studio)

```bash
cd packages/db
pnpm db:studio
```

Opens GUI at [http://localhost:5555](http://localhost:5555)

### Create New Migration

```bash
cd packages/db

# 1. Edit schema.prisma
# 2. Create migration
pnpm db:migrate --name your_migration_name
```

### Reset Database

```bash
cd packages/db
pnpm prisma migrate reset
pnpm db:seed
```

⚠️ **Warning:** This will delete all data!

---

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Progress Tracking
```bash
GET  /api/progress        # Get user progress
POST /api/progress        # Update progress
```

### Quiz Management
```bash
GET  /api/quiz?quizId=xxx # Get quiz by ID
POST /api/quiz            # Submit quiz answers
```

### Bookmarks
```bash
GET    /api/bookmark              # Get user bookmarks
POST   /api/bookmark              # Create bookmark
DELETE /api/bookmark?resourceId=x # Delete bookmark
```

### Tracks (Public)
```bash
GET /api/tracks           # Get all tracks
GET /api/tracks?slug=ml   # Get specific track
```

---

## Internationalization (i18n)

### Supported Languages

- English (en)
- Turkish (tr)

### Add New Language

1. Create locale folder:
   ```bash
   mkdir -p apps/web/locales/fr
   ```

2. Add translation files:
   ```
   apps/web/locales/fr/common.json
   apps/web/locales/fr/roadmap.json
   ```

3. Update `apps/web/i18n.ts`:
   ```typescript
   export const locales = ['en', 'tr', 'fr'] as const
   ```

4. Update middleware:
   ```typescript
   // apps/web/middleware.ts
   matcher: ['/', '/(tr|en|fr)/:path*']
   ```

### Access Translations

```typescript
import { useTranslations } from 'next-intl'

export default function Page() {
  const t = useTranslations()
  return <h1>{t('nav.home')}</h1>
}
```

---

## Adding New Features

### 1. Add Database Model

```prisma
// packages/db/prisma/schema.prisma
model NewModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())

  @@map("new_models")
}
```

```bash
cd packages/db
pnpm db:migrate --name add_new_model
```

### 2. Create Service

```typescript
// apps/web/lib/services/newModelService.ts
import { prisma } from '@/lib/db'

export const newModelService = {
  async getAll() {
    return prisma.newModel.findMany()
  },

  async create(data: any) {
    return prisma.newModel.create({ data })
  },
}
```

### 3. Create API Route

```typescript
// apps/web/app/api/new-model/route.ts
import { newModelService } from '@/lib/services/newModelService'
import { successResponse, errorResponse } from '@/lib/utils/response'

export async function GET() {
  try {
    const data = await newModelService.getAll()
    return successResponse(data)
  } catch (error) {
    return errorResponse('Failed to fetch')
  }
}
```

### 4. Create Page

```typescript
// apps/web/app/[locale]/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>
}
```

---

## Environment Variables

### Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional

```env
# Skip checks during build
SKIP_TYPE_CHECK=true
SKIP_LINT=true
```

---

## Testing

### API Testing with curl

```bash
# Health check
curl http://localhost:3000/api/health

# Get tracks
curl http://localhost:3000/api/tracks

# With authentication (when implemented)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/progress
```

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

Vercel will automatically:
- Install dependencies
- Run build
- Deploy to production

### Environment Variables in Vercel

Add these in **Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Not Found

```bash
cd packages/db
pnpm db:generate
```

### Type Errors

```bash
# Regenerate types
pnpm typecheck

# Skip during build
SKIP_TYPE_CHECK=true pnpm build
```

### Database Connection Failed

1. Check `.env.local` file exists
2. Verify DATABASE_URL is correct
3. Ensure database is running
4. Check network/firewall

---

## Best Practices

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write descriptive commit messages

### Database

- Always create migrations for schema changes
- Test migrations in development first
- Use transactions for multi-step operations
- Add indexes for frequently queried fields

### API Design

- Use standard HTTP methods (GET, POST, PUT, DELETE)
- Return consistent response format
- Include proper error messages
- Add request validation with Zod

### Security

- Never expose service role key to client
- Validate all user inputs
- Use Row Level Security (RLS) in Supabase
- Sanitize user-generated content

---

## Getting Help

- 📖 [Next.js Docs](https://nextjs.org/docs)
- 📖 [Prisma Docs](https://www.prisma.io/docs)
- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [Turborepo Docs](https://turbo.build/repo/docs)

---

✅ Happy coding! 🚀

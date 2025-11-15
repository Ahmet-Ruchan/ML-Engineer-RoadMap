# 🚀 ML Engineer Roadmap - Developer Quickstart

## Current Project Status

### ✅ Completed Foundation (Ready to Use)

```
✓ Architecture Documentation (ARCHITECTURE.md)
✓ Database Schema (Prisma + PostgreSQL)
✓ Monorepo Structure (Turborepo)
✓ Authentication System (Supabase Auth + RBAC)
✓ Service Layer (Business Logic)
✓ Middleware (Route Protection)
✓ Auth Pages (Login/Register)
✓ Error Handling
✓ Validators (Zod)
```

### 🚧 To Complete (Follow IMPLEMENTATION_GUIDE.md)

```
□ API Endpoints (Progress, Quiz, Bookmark, Resources)
□ Student Pages (Dashboard, Roadmap, Quiz, Resources)
□ Admin Panel (CRUD for all content)
□ MDX Content (Roadmap topics in EN/TR)
□ UI Components (Reusable cards, forms)
□ i18n Setup (next-intl configuration)
□ Deployment (Vercel + Supabase)
```

## 🏃 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create `.env` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ml_roadmap

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Create database (development)
npm run db:push

# OR run migrations (production-like)
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
ml-roadmap/
├── ARCHITECTURE.md           ← FULL SYSTEM DESIGN (READ THIS!)
├── IMPLEMENTATION_GUIDE.md   ← STEP-BY-STEP TO COMPLETE
├── README.md                 ← Public-facing documentation
├── README.dev.md             ← This file
│
├── apps/
│   └── web/                  ← Next.js app
│       ├── src/
│       │   ├── app/          ← Pages & API routes
│       │   ├── components/   ← UI components
│       │   ├── lib/
│       │   │   ├── auth/     ← Supabase auth helpers
│       │   │   ├── db/       ← Prisma client
│       │   │   ├── services/ ← Business logic ✅
│       │   │   └── utils/    ← Errors, validators ✅
│       │   └── middleware.ts ← Route protection ✅
│       └── package.json
│
├── packages/
│   ├── db/                   ← Prisma schema ✅
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts       ← Sample data
│   │   └── src/
│   │       └── index.ts      ← Prisma client export
│   ├── ui/                   ← Shared components
│   └── config/               ← Shared configs
│
├── package.json              ← Root dependencies
└── turbo.json                ← Monorepo config
```

## 🧪 Sample Data (from seed.ts)

After running `npm run db:seed`:

**Users:**
- `admin@ml-roadmap.com` (role: admin)
- `student@ml-roadmap.com` (role: student)

**Content:**
- 3 Phases (Python & Math, Data Manipulation, ML Foundations)
- 6 Topics (Python Basics, Linear Algebra, NumPy, Pandas, etc.)
- Sample resources and quizzes

**Note:** Passwords are NOT set in seed - you'll need to register via Supabase or set them manually.

## 🔐 Supabase Setup

1. Create project at https://supabase.com
2. Get your project URL and keys from Project Settings > API
3. Set up Auth (Email/Password enabled by default)
4. Copy `DATABASE_URL` from Project Settings > Database
5. Run migrations: `npx prisma migrate deploy`
6. Seed database: `npm run db:seed`

## 📚 Key Files to Understand

### 1. Database Schema
`packages/db/prisma/schema.prisma` - All models and relationships

### 2. Services (Business Logic)
- `apps/web/src/lib/services/progressService.ts`
- `apps/web/src/lib/services/quizService.ts`
- `apps/web/src/lib/services/bookmarkService.ts`
- `apps/web/src/lib/services/resourceService.ts`

### 3. Auth
- `apps/web/src/lib/auth/supabaseClient.ts` - Helper functions
- `apps/web/src/middleware.ts` - Route protection
- `apps/web/src/app/api/auth/*` - Login/Register/Logout endpoints

### 4. Validators
`apps/web/src/lib/utils/validators.ts` - Zod schemas for all inputs

## 🛠️ Development Commands

```bash
# Install all dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Database commands
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Run migrations
npm run db:push          # Push schema (dev)
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database

# Clean everything
npm run clean
```

## 🎯 What to Build Next

**Follow IMPLEMENTATION_GUIDE.md for complete instructions.**

Quick priorities:

1. **API Endpoints** - Create remaining API routes
2. **Dashboard** - User dashboard with progress stats
3. **Roadmap Pages** - Phase list, phase detail, topic detail
4. **Quiz System** - Quiz list, take quiz, results
5. **Admin Panel** - CRUD for phases/topics/resources/quizzes

## 🐛 Common Issues

**"Cannot find module '@ml-roadmap/db'"**
```bash
npm run db:generate
npm install --workspaces
```

**Auth not working**
- Check `.env` file has correct Supabase keys
- Ensure Supabase Auth is enabled for Email/Password
- Clear browser cookies

**Database connection error**
- Verify DATABASE_URL in `.env`
- Check Supabase project is running
- Ensure database is accessible (not paused)

**Build errors**
```bash
npm run clean
npm install
npm run build
```

## 📖 Documentation

- **ARCHITECTURE.md** - Complete system design and patterns
- **IMPLEMENTATION_GUIDE.md** - Step-by-step completion guide
- **README.md** - Public-facing project description

## 🤝 Need Help?

1. Read ARCHITECTURE.md for system design
2. Check IMPLEMENTATION_GUIDE.md for examples
3. Look at service files for patterns
4. Check Prisma schema for data models

## 🎓 Learning Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev)

---

**Ready to code? Start with IMPLEMENTATION_GUIDE.md! 🚀**


# 🔧 ML Engineer RoadMap - Installation & Setup Guide

Complete step-by-step guide to set up the ML Engineer RoadMap web application locally.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Detailed Installation](#-detailed-installation)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Creating Admin User](#-creating-admin-user)
- [Project Structure](#-project-structure)
- [Available Commands](#-available-commands)
- [Troubleshooting](#-troubleshooting)

---

## 📦 Prerequisites

Before starting, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (v18.17.0 or higher)
   - Download: https://nodejs.org/
   - Check version: `node --version`

2. **pnpm** (v8.0.0 or higher)
   - Install globally: `npm install -g pnpm`
   - Check version: `pnpm --version`

3. **Git**
   - Download: https://git-scm.com/
   - Check version: `git --version`

### Optional (for Production)

4. **PostgreSQL** (v14.0 or higher) - for production database
   - Download: https://www.postgresql.org/download/

---

## ⚡ Quick Start

For experienced developers who want to get started quickly:

```bash
# 1. Clone the repository
git clone https://github.com/Ahmet-Ruchan/ML-Engineer-RoadMap.git
cd ML-Engineer-RoadMap

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp apps/web/.env.example apps/web/.env.local

# 4. Generate Prisma client and run migrations
cd apps/web
pnpm prisma generate
pnpm prisma migrate dev

# 5. Start the development server
pnpm dev
```

Open http://localhost:3000 in your browser!

---

## 📝 Detailed Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Ahmet-Ruchan/ML-Engineer-RoadMap.git

# Navigate to the project directory
cd ML-Engineer-RoadMap

# Verify you're on the correct branch
git branch
```

### Step 2: Install Dependencies

This project uses **pnpm workspaces** for monorepo management.

```bash
# Install all dependencies for all packages
pnpm install
```

This will install dependencies for:
- `apps/web` - Main Next.js application
- `packages/db` - Prisma database package
- `packages/ui` - Shared UI components (if any)

**Expected output:**
```
Packages: +437
Progress: resolved 437, reused 437, downloaded 0, added 437, done
Done in 8.5s
```

### Step 3: Environment Setup

#### Copy Environment File

```bash
# Navigate to the web app
cd apps/web

# Copy the example environment file
cp .env.example .env.local
```

#### Edit `.env.local`

Open `apps/web/.env.local` and configure the following:

```env
# Database URL (SQLite for development)
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Optional: OAuth Providers (GitHub, Google, etc.)
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
```

**Important**: Generate a secure `NEXTAUTH_SECRET`:
```bash
# Generate a random secret
openssl rand -base64 32
```

---

## 🗄️ Database Setup

### Step 1: Generate Prisma Client

```bash
# Make sure you're in apps/web directory
cd apps/web

# Generate Prisma Client
pnpm prisma generate
```

### Step 2: Run Database Migrations

```bash
# Run migrations to create database schema
pnpm prisma migrate dev
```

You'll be prompted to name your migration. Example: `init`

**Expected output:**
```
✔ Enter a name for the new migration: … init
Applying migration `20250116_init`

Your database is now in sync with your schema.

✔ Generated Prisma Client
```

### Step 3: (Optional) Seed Database

To populate your database with sample data:

```bash
# Run the seed script
pnpm prisma db seed
```

This will create:
- Sample tracks (ML Engineer, Data Scientist, etc.)
- Sample phases and topics
- Sample resources and quizzes
- Sample badges

### Step 4: View Database (Optional)

```bash
# Open Prisma Studio to view your database
pnpm prisma studio
```

This opens a browser interface at http://localhost:5555

---

## 🚀 Running the Application

### Development Mode

From the **root directory** of the project:

```bash
# Start all apps in development mode
pnpm dev
```

**OR** from the `apps/web` directory:

```bash
cd apps/web
pnpm dev
```

**Expected output:**
```
> @ml-roadmap/web@0.1.0 dev
> next dev

   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 5.7s
```

### Access the Application

Open your browser and navigate to:

- **English**: http://localhost:3000/en
- **Turkish**: http://localhost:3000/tr
- **Auto-detect**: http://localhost:3000

### Stop the Server

Press `Ctrl + C` in the terminal

---

## 👤 Creating Admin User

### Method 1: Using Prisma Studio (Recommended)

1. Open Prisma Studio:
   ```bash
   cd apps/web
   pnpm prisma studio
   ```

2. Navigate to the `User` model

3. Click "Add record"

4. Fill in the details:
   - **email**: admin@example.com
   - **name**: Admin User
   - **password**: (You need to hash it - see Method 2)
   - **role**: admin
   - **emailVerified**: (leave null)

5. Click "Save 1 change"

### Method 2: Using Registration + Manual Role Update

1. Register a new account at http://localhost:3000/en/register

2. Open Prisma Studio:
   ```bash
   pnpm prisma studio
   ```

3. Find your user in the `User` table

4. Edit the user and change `role` from `"user"` to `"admin"`

5. Save changes

6. Refresh your browser and you'll have admin access!

### Method 3: Using Direct Database Query

```bash
# Open Prisma Studio
pnpm prisma studio

# Or use SQLite CLI
sqlite3 apps/web/dev.db

# Update user role
UPDATE users SET role = 'admin' WHERE email = 'youremail@example.com';
```

---

## 📁 Project Structure

```
ML-Engineer-RoadMap/
├── apps/
│   └── web/                          # Main Next.js application
│       ├── app/                      # Next.js 14 App Router
│       │   ├── [locale]/             # Internationalized routes
│       │   │   ├── (auth)/           # Auth pages (login, register)
│       │   │   ├── admin/            # Admin panel pages
│       │   │   ├── roadmap/          # Public roadmap pages
│       │   │   ├── dashboard/        # User dashboard
│       │   │   ├── profile/          # User profile
│       │   │   ├── badges/           # Badges page
│       │   │   ├── bookmarks/        # Bookmarks page
│       │   │   ├── search/           # Search page
│       │   │   └── page.tsx          # Home page
│       │   └── api/                  # API routes
│       │       ├── auth/             # NextAuth endpoints
│       │       ├── admin/            # Admin CRUD APIs
│       │       ├── progress/         # Progress tracking
│       │       ├── badges/           # Badge system
│       │       ├── bookmarks/        # Bookmarks API
│       │       ├── notes/            # Notes API
│       │       └── search/           # Search API
│       ├── components/               # React components
│       │   ├── ui/                   # shadcn/ui components
│       │   └── layout/               # Layout components (Navbar, etc.)
│       ├── lib/                      # Utility functions
│       │   ├── auth.ts               # NextAuth configuration
│       │   ├── db.ts                 # Prisma client
│       │   └── utils.ts              # Utility functions
│       ├── locales/                  # i18n translations
│       │   ├── en/                   # English translations
│       │   └── tr/                   # Turkish translations
│       ├── public/                   # Static assets
│       ├── .env.local                # Environment variables (create this)
│       ├── .env.example              # Example environment file
│       ├── next.config.js            # Next.js configuration
│       ├── i18n.ts                   # i18n configuration
│       └── package.json              # Dependencies
├── packages/
│   └── db/                           # Database package
│       ├── prisma/
│       │   ├── schema.prisma         # Database schema
│       │   └── migrations/           # Database migrations
│       └── package.json
├── pnpm-workspace.yaml               # pnpm workspace config
├── turbo.json                        # Turborepo config
├── package.json                      # Root package.json
├── README.md                         # Main README
└── INSTALLATION.md                   # This file
```

---

## 🛠️ Available Commands

### Root Level Commands

```bash
# Install dependencies
pnpm install

# Start all apps in development
pnpm dev

# Build all apps for production
pnpm build

# Run linter
pnpm lint

# Format code
pnpm format
```

### Web App Commands (run from `apps/web/`)

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Database
pnpm prisma generate        # Generate Prisma Client
pnpm prisma migrate dev     # Run migrations (development)
pnpm prisma migrate deploy  # Run migrations (production)
pnpm prisma studio          # Open Prisma Studio
pnpm prisma db seed         # Seed database
pnpm prisma db push         # Push schema changes (prototype)

# Testing (if configured)
pnpm test                   # Run tests
pnpm test:watch             # Run tests in watch mode
```

---

## 🐛 Troubleshooting

### Issue: "Module not found: @radix-ui/react-slot"

**Solution:**
```bash
# Clean install
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Issue: "Port 3000 is already in use"

**Solution 1:** Kill the process using port 3000
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Solution 2:** Use a different port
```bash
PORT=3001 pnpm dev
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
cd apps/web
pnpm prisma generate
```

### Issue: "Database connection error"

**Solution:** Check your DATABASE_URL in `.env.local`

For SQLite (development):
```env
DATABASE_URL="file:./dev.db"
```

For PostgreSQL (production):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Issue: "NextAuth session error"

**Solution:** Ensure NEXTAUTH_SECRET is set
```bash
# Generate a new secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="generated-secret-here"
```

### Issue: "Page not loading / Event handlers error"

**Solution:** Ensure all pages using hooks have `'use client'` directive

Example:
```tsx
'use client'

import { useTranslations } from 'next-intl'

export default function MyPage() {
  const t = useTranslations()
  // ...
}
```

### Issue: "pnpm command not found"

**Solution:** Install pnpm globally
```bash
npm install -g pnpm

# Or using corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

### Issue: Build errors after git pull

**Solution:**
```bash
# Clean and reinstall
pnpm install
cd apps/web
pnpm prisma generate
cd ../..
pnpm dev
```

---

## 🔒 Security Notes

### Before Deploying to Production:

1. **Change NEXTAUTH_SECRET** to a strong, random value
2. **Use PostgreSQL** instead of SQLite
3. **Enable HTTPS** (configure NEXTAUTH_URL with https://)
4. **Set secure cookies** in NextAuth configuration
5. **Review and restrict** API route permissions
6. **Add rate limiting** for auth endpoints
7. **Configure CORS** properly
8. **Use environment variables** for all secrets
9. **Never commit** `.env.local` to git

---

## 📚 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **NextAuth.js Documentation**: https://next-auth.js.org/
- **next-intl Documentation**: https://next-intl-docs.vercel.app/
- **shadcn/ui Documentation**: https://ui.shadcn.com/

---

## 🤝 Getting Help

If you encounter issues not covered in this guide:

1. **Check existing issues**: [GitHub Issues](https://github.com/Ahmet-Ruchan/ML-Engineer-RoadMap/issues)
2. **Create a new issue**: Provide detailed information about your problem
3. **Discord Community**: (Coming soon)
4. **Email**: aruchanavci01@gmail.com

---

## ✅ Next Steps After Installation

1. ✅ Application is running
2. 📝 Create an admin user
3. 🎨 Explore the admin panel
4. 📚 Add content (tracks, phases, topics, resources)
5. 🧪 Test all features
6. 🎯 Start learning!

---

**Happy Coding! 🚀**

*Last Updated: November 16, 2025*

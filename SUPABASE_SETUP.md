# 🚀 Supabase Setup Guide

## Option A: Production Supabase Setup (Recommended)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New project"**
3. Fill in project details:
   - **Name**: ml-roadmap (or any name)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

### Step 2: Get API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **service_role key:** (⚠️ Keep secret!)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Go to **Settings** → **Database** → **Connection string** → **URI**
   Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
   Replace `[YOUR-PASSWORD]` with the password from Step 1.

### Step 3: Update .env.local

Open `apps/web/.env.local` and replace:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
```

### Step 4: Run Migrations

```bash
cd packages/db
pnpm db:migrate
```

This will create all 15 tables in your Supabase database.

### Step 5: Seed Initial Data

```bash
pnpm db:seed
```

This will add:
- 2 tracks (ML, AI)
- 1 phase (Phase 1)
- 1 topic (Python Basics)
- 1 badge (Quiz Master)

### Step 6: Verify in Supabase

1. Go to **Table Editor** in Supabase dashboard
2. You should see all tables: `tracks`, `phases`, `topics`, `badges`, etc.

---

## Option B: Local Development (Quick Start)

If you don't want to create a Supabase project yet, you can use local PostgreSQL:

### Prerequisites

```bash
# Install Docker (if not installed)
# Then run PostgreSQL locally:
docker run -d \
  --name ml-roadmap-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ml_roadmap \
  -p 5432:5432 \
  postgres:15
```

### Update .env.local

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ml_roadmap
```

### Run Migrations & Seed

```bash
cd packages/db
pnpm db:migrate
pnpm db:seed
```

---

## Next Steps After Setup

1. **Start dev server:**
   ```bash
   pnpm dev
   ```

2. **Test API:**
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Open app:**
   ```
   http://localhost:3000
   ```

---

## Troubleshooting

### Error: "Can't reach database server"

- Check your DATABASE_URL is correct
- Verify Supabase project is running
- Check firewall/network settings

### Error: "prisma generate failed"

```bash
cd packages/db
pnpm db:generate
```

### Error: "Module not found"

```bash
pnpm install
```

---

✅ **Ready!** Your database is now connected and ready for development.

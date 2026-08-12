# Habitly

Habitly is a modern habit tracker built with Next.js App Router, TypeScript, Prisma, PostgreSQL, Tailwind CSS, shadcn-style components, Lucide icons, Recharts, Zod, and Server Actions.

## Requirements

- Node.js 22+
- PostgreSQL

## Setup

1. Install dependencies: `npm install`
2. Create `.env` from `.env.example`
3. Set `DATABASE_URL`
4. Generate Prisma: `npx prisma generate`
5. Create the database tables: `npx prisma migrate dev`
6. Seed demo data: `npx prisma db seed`
7. Start development: `npm run dev`

For local PostgreSQL with Docker:

1. Start Postgres: `docker compose up -d`
2. Run migrations: `npx prisma migrate dev`
3. Seed demo history: `npx prisma db seed`
4. Start Habitly: `npm run dev`

## Scripts

- `npm run dev` starts Next.js
- `npm run lint` runs ESLint
- `npm run build` generates Prisma and builds production assets
- `npm run test` runs Vitest utility tests
- `npm run prisma:studio` opens Prisma Studio

## Architecture

Routes live in `app/(dashboard)`. Server data access is centralized in `lib/queries`, mutations in `lib/actions`, validation in `lib/validations`, and testable schedule/streak/date logic in `lib/habits` and `lib/dates`.

The app uses a demo user returned by `getCurrentUser()` so every habit is still user-owned in the database. That boundary can be replaced by real authentication later without changing the core habit schema.

If PostgreSQL is not reachable, the app falls back to local demo data for testing the UI. Demo data is read-only for create/edit operations.

## PWA

Habitly includes `public/manifest.webmanifest`, `public/sw.js`, and a Settings notification toggle. Mobile notifications require browser support, notification permission, and for iOS usually the installed PWA experience.

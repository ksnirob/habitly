# Habitly

Habitly is a modern habit tracker built with Next.js App Router, TypeScript, Prisma, PostgreSQL, Tailwind CSS, shadcn-style components, Lucide icons, Recharts, Zod, and Server Actions.

## Requirements

- Node.js 22+
- PostgreSQL

## Setup

1. Install dependencies: `npm install`
2. Create `.env` from `.env.example`
3. Set `DATABASE_URL`
4. Generate Prisma: `npx.cmd prisma generate`
5. Create the database tables: `npx.cmd prisma migrate dev`
6. Seed starter data: `npx.cmd prisma db seed`
7. Start development: `npm.cmd run dev`

For local PostgreSQL with Docker:

1. Start Postgres: `docker compose up -d`
2. Run migrations: `npx.cmd prisma migrate dev`
3. Seed starter history: `npx.cmd prisma db seed`
4. Start Habitly: `npm.cmd run dev`

## Prisma Commands

After changing `prisma/schema.prisma`, use one of these flows.

For quick local development or a fresh test database:

```powershell
npx.cmd prisma db push
npx.cmd prisma generate
```

If you also changed seed data:

```powershell
npx.cmd prisma db seed
```

For normal development with migration files:

```powershell
npx.cmd prisma migrate dev --name your_change_name
npx.cmd prisma generate
```

For production or deployed databases:

```powershell
npx.cmd prisma migrate deploy
npx.cmd prisma generate
npm.cmd run build
```

Use `db push` only when you do not need migration history. Use `migrate dev` when you want Prisma to create a migration file that can be safely replayed later.

## Vercel Deployment

In Vercel, set these Environment Variables for Production and Preview:

- `DATABASE_URL`: your Prisma Postgres connection string
- `AUTH_SECRET`: any long random string used to sign login cookies

If the Prisma/Vercel integration created `POSTGRES_URL` or `PRISMA_DATABASE_URL` instead, either copy that same value into `DATABASE_URL` or leave the alias in place. The Prisma config checks all three names.

Set the Vercel Build Command to:

```bash
npm run vercel-build
```

That command runs:

```bash
prisma generate && prisma migrate deploy && next build
```

If the live login page says the database is not ready, check:

1. `DATABASE_URL` exists in the Vercel project settings.
   If not, check whether `POSTGRES_URL` or `PRISMA_DATABASE_URL` exists instead.
2. The variable is available for the environment you deployed, usually Production.
3. The site was redeployed after adding or changing env vars.
4. The deployment logs show `prisma migrate deploy` completed.

For the starter admin data, run locally against the same production database:

```powershell
npx.cmd prisma db seed
```

## Scripts

- `npm run dev` starts Next.js
- `npm run lint` runs ESLint
- `npm run build` generates Prisma and builds production assets
- `npm run test` runs Vitest utility tests
- `npm run prisma:studio` opens Prisma Studio

## Architecture

Routes live in `app/(dashboard)`. Server data access is centralized in `lib/queries`, mutations in `lib/actions`, validation in `lib/validations`, and testable schedule/streak/date logic in `lib/habits` and `lib/dates`.

The app uses cookie-based authentication and stores user-owned habits in PostgreSQL. PostgreSQL must be reachable because the local demo fallback has been removed.

## PWA

Habitly includes `public/manifest.webmanifest`, `public/sw.js`, and a Settings notification toggle. Mobile notifications require browser support, notification permission, and for iOS usually the installed PWA experience.

Closed-app habit reminders use Web Push. After pulling the code, create the push tables:

```powershell
npx.cmd prisma migrate dev
```

Generate VAPID keys:

```powershell
npx.cmd web-push generate-vapid-keys
```

Set these env vars locally and in Vercel:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`, for example `mailto:admin@ksnirob.com`

Vercel runs `/api/push/send-due` every 5 minutes from `vercel.json`. If you set `CRON_SECRET`, call that route from an external cron with:

```text
Authorization: Bearer your_secret
```

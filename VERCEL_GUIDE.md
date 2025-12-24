# 🚀 Vercel Deployment Guide for Kabadiwala

Your app is built with Next.js and Prisma. Since you are using a database, there is **one critical step** before deploying to Vercel: **Switching from SQLite to PostgreSQL**.

Vercel does not support SQLite files because the server resets frequently, and you will lose your data.

## Step 1: Get a Cloud Database (Free)
1.  Go to [Vercel Storage](https://vercel.com/dashboard/stores) or [Neon.tech](https://neon.tech).
2.  Create a new **PostgreSQL** database.
3.  Copy the `DATABASE_URL` (it looks like `postgres://user:pass@host/db`).

## Step 2: Update Code for Production
Modify `prisma/schema.prisma`:

```prisma
// CHANGE THIS:
datasource db {
  provider = "postgresql" // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

## Step 3: Vercel Environment Variables
When you import your project to Vercel, go to **Settings > Environment Variables** and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Postgres connection string |
| `NEXTAUTH_SECRET` | Generate one using `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel domain (e.g., `https://your-app.vercel.app`) |
| `ADMIN_RECOVERY_CODE` | Your secret code for admin recovery |

## Step 4: Deploy
1.  Push code to GitHub.
2.  Import in Vercel.
3.  Vercel will automatically run `npm install` and `npm run build`.
4.  **Important:** You might need to run `npx prisma db push` from your local machine (pointing to the production DB) or add a build command to migrate.

### Recommended Build Command
In Vercel Settings > Build & Development Settings:
- **Build Command:** `npx prisma generate && next build`

---
**Note:** For now, keep using SQLite locally. Only change these settings when you are ready to go live.

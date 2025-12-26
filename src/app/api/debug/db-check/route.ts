import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        console.log("Testing DB connection...")

        // Try a simple query
        let userCount = 0
        try {
            userCount = await db.user.count()
            console.log("DB connection successful. User count:", userCount)
        } catch (e) {
            console.error("Count query failed", e)
        }

        // Check columns in User table (Postgres specific)
        let columns: any[] = []
        try {
            columns = await db.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User';`
        } catch (e) {
            console.error("Failed to fetch columns", e)
        }

        // Apply Manual Fix if requested
        const url = new URL(req.url)
        const applyFix = url.searchParams.get("fix") === "true"
        let fixResult = null

        if (applyFix) {
            try {
                // Manually add missing columns for User table
                await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT false;`)
                await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;`)
                await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "points" INTEGER DEFAULT 0;`)
                // Also ensure Session table exists (simplest check is to try create it if not exists, but raw SQL for full table is complex. 
                // Let's focus on the reported error first.)
                fixResult = "Attempted to add missing columns to User table."
            } catch (e: any) {
                fixResult = "Fix failed: " + e.message
            }
        }

        return NextResponse.json({
            status: "success",
            message: "Database connection successful",
            userCount: userCount,
            tableStructure: columns,
            fixResult: fixResult,
            env: {
                // Do NOT return the full string for security, just check if it exists and starts correctly
                DATABASE_URL_SET: !!process.env.DATABASE_URL,
                DATABASE_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + "..." : "NOT_SET",
                AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
                NEXTAUTH_URL_SET: !!process.env.NEXTAUTH_URL,
                NODE_ENV: process.env.NODE_ENV,
                DB_PROVIDER: "postgresql"
            }
        })
    } catch (error: any) {
        console.error("DB Connection Failed:", error)
        return NextResponse.json({
            status: "error",
            message: "Database connection failed",
            error: error.message,
            code: error.code,
            meta: error.meta,
            env: {
                DATABASE_URL_SET: !!process.env.DATABASE_URL,
                DATABASE_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + "..." : "NOT_SET",
            }
        }, { status: 500 })
    }
}

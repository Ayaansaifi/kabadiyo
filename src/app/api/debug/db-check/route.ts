import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        console.log("Testing DB connection...")
        // Try a simple query
        const userCount = await db.user.count()
        console.log("DB connection successful. User count:", userCount)

        return NextResponse.json({
            status: "success",
            message: "Database connection successful",
            userCount: userCount,
            env: {
                // Do NOT return the full string for security, just check if it exists and starts correctly
                DATABASE_URL_SET: !!process.env.DATABASE_URL,
                DATABASE_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + "..." : "NOT_SET",
                AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
                NEXTAUTH_URL_SET: !!process.env.NEXTAUTH_URL,
                NODE_ENV: process.env.NODE_ENV,
                DB_PROVIDER: "sqlite" // Confirming provider
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

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET: My stories (for current user)
export async function GET() {
    // This can be called by cron job or manually to clean up expired stories
    try {
        const now = new Date()

        // Mark expired stories as inactive
        const result = await db.story.updateMany({
            where: {
                isActive: true,
                expiresAt: { lt: now }
            },
            data: {
                isActive: false
            }
        })

        return NextResponse.json({
            success: true,
            expiredCount: result.count,
            cleanedAt: now.toISOString()
        })
    } catch (error) {
        console.error("Story cleanup error:", error)
        return NextResponse.json({ error: "Failed to cleanup stories" }, { status: 500 })
    }
}

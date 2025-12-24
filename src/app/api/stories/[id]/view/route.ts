/**
 * Story View API
 * --------------
 * POST: Record a story view (creates StoryView record)
 * GET:  Get list of viewers (only for story owner) - WhatsApp-like feature
 * 
 * Uses legacy cookie auth for compatibility with current login system.
 */
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

// Get current user from cookies (legacy auth)
async function getCurrentUser() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) return null
    return db.user.findUnique({ where: { id: userId } })
}

// POST: Record a story view
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: storyId } = await params

        // Check if story exists and is active
        const story = await db.story.findUnique({
            where: { id: storyId },
            select: { userId: true, isActive: true, expiresAt: true }
        })

        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 })
        }

        if (!story.isActive || new Date() > story.expiresAt) {
            return NextResponse.json({ error: "Story has expired" }, { status: 410 })
        }

        // Don't record view for own story
        if (story.userId === user.id) {
            return NextResponse.json({ success: true, selfView: true })
        }

        // Upsert view (create if doesn't exist, ignore if exists)
        await db.storyView.upsert({
            where: {
                storyId_viewerId: {
                    storyId,
                    viewerId: user.id
                }
            },
            create: {
                storyId,
                viewerId: user.id
            },
            update: {} // No update needed, just ensure it exists
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Story view error:", error)
        return NextResponse.json({ error: "Failed to record view" }, { status: 500 })
    }
}

// GET: Get story viewers (only for story owner)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: storyId } = await params

        // Check if user owns the story
        const story = await db.story.findUnique({
            where: { id: storyId },
            select: { userId: true }
        })

        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 })
        }

        if (story.userId !== user.id) {
            return NextResponse.json({ error: "Not authorized to view this data" }, { status: 403 })
        }

        // Get all viewers
        const views = await db.storyView.findMany({
            where: { storyId },
            include: {
                story: false
            },
            orderBy: { viewedAt: "desc" }
        })

        // Get viewer details
        const viewerIds = views.map(v => v.viewerId)
        const viewers = await db.user.findMany({
            where: { id: { in: viewerIds } },
            select: {
                id: true,
                name: true,
                image: true
            }
        })

        const viewsWithUser = views.map(view => ({
            ...view,
            viewer: viewers.find(u => u.id === view.viewerId)
        }))

        return NextResponse.json({
            total: views.length,
            views: viewsWithUser
        })
    } catch (error) {
        console.error("Story viewers error:", error)
        return NextResponse.json({ error: "Failed to fetch viewers" }, { status: 500 })
    }
}

/**
 * Story Detail API
 * ----------------
 * GET:    Get a single story by ID
 * DELETE: Delete own story
 * PATCH:  Update story (caption only)
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

// GET: Single story
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const story = await db.story.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        })

        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 })
        }

        return NextResponse.json(story)
    } catch (error) {
        console.error("Story fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
    }
}

// DELETE: Delete own story
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Check ownership
        const story = await db.story.findUnique({
            where: { id },
            select: { userId: true }
        })

        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 })
        }

        if (story.userId !== user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 })
        }

        // Delete views first (cascade)
        await db.storyView.deleteMany({ where: { storyId: id } })

        // Delete story
        await db.story.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Story delete error:", error)
        return NextResponse.json({ error: "Failed to delete story" }, { status: 500 })
    }
}

// PATCH: Update story caption
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { caption } = body

        // Check ownership
        const story = await db.story.findUnique({
            where: { id },
            select: { userId: true }
        })

        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 })
        }

        if (story.userId !== user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 })
        }

        const updated = await db.story.update({
            where: { id },
            data: { caption }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error("Story update error:", error)
        return NextResponse.json({ error: "Failed to update story" }, { status: 500 })
    }
}

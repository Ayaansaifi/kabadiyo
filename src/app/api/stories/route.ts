/**
 * Stories API Route
 * -----------------
 * GET:  Fetch all active stories grouped by user
 * POST: Create a new story (text or image)
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

// GET: Fetch all active stories grouped by user
export async function GET() {
    try {
        const currentUser = await getCurrentUser()

        const stories = await db.story.findMany({
            where: {
                isActive: true,
                expiresAt: { gt: new Date() }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        kabadiwalaProfile: {
                            select: { businessName: true }
                        }
                    }
                },
                views: currentUser ? {
                    where: { viewerId: currentUser.id },
                    select: { id: true }
                } : false
            },
            orderBy: { createdAt: "desc" }
        })

        // Group stories by user
        const groupedMap = new Map<string, {
            user: typeof stories[0]["user"]
            stories: typeof stories
            hasUnviewed: boolean
        }>()

        for (const story of stories) {
            const userId = story.user.id
            if (!groupedMap.has(userId)) {
                groupedMap.set(userId, {
                    user: story.user,
                    stories: [],
                    hasUnviewed: false
                })
            }
            const group = groupedMap.get(userId)!
            const hasViewed = currentUser && Array.isArray(story.views) ? story.views.length > 0 : false
            group.stories.push({
                ...story,
                hasViewed
            } as any)
            if (!hasViewed) {
                group.hasUnviewed = true
            }
        }

        // Convert to array and sort (unviewed first, then by latest story)
        const groups = Array.from(groupedMap.values())
        groups.sort((a, b) => {
            if (a.hasUnviewed && !b.hasUnviewed) return -1
            if (!a.hasUnviewed && b.hasUnviewed) return 1
            return new Date(b.stories[0].createdAt).getTime() -
                new Date(a.stories[0].createdAt).getTime()
        })

        return NextResponse.json(groups)
    } catch (error) {
        console.error("Stories fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
    }
}

// POST: Create a new story
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { mediaType, mediaUrl, text, bgColor, caption } = body

        // Validate
        if (!mediaType || !["TEXT", "IMAGE", "VIDEO"].includes(mediaType)) {
            return NextResponse.json({ error: "Invalid media type" }, { status: 400 })
        }

        if (mediaType === "TEXT" && !text) {
            return NextResponse.json({ error: "Text is required for text stories" }, { status: 400 })
        }

        if ((mediaType === "IMAGE" || mediaType === "VIDEO") && !mediaUrl) {
            return NextResponse.json({ error: "Media URL is required" }, { status: 400 })
        }

        // Create story (expires in 24 hours)
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24)

        const story = await db.story.create({
            data: {
                userId: user.id,
                mediaType,
                mediaUrl: mediaUrl || null,
                text: text || null,
                bgColor: bgColor || null,
                caption: caption || null,
                expiresAt
            },
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

        return NextResponse.json(story, { status: 201 })
    } catch (error) {
        console.error("Story creation error:", error)
        return NextResponse.json({ error: "Failed to create story" }, { status: 500 })
    }
}

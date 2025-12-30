import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// GET: Get user's notifications
export async function GET() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const notifications = await db.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50
        })

        const unreadCount = await db.notification.count({
            where: { userId, isRead: false }
        })

        return NextResponse.json({
            notifications,
            unreadCount,
            total: notifications.length
        })
    } catch (error) {
        console.error("Get notifications error:", error)
        return NextResponse.json({ error: "Failed to get notifications" }, { status: 500 })
    }
}

// POST: Create a notification (internal use)
export async function POST(request: NextRequest) {
    try {
        const { userId, type, title, body, data } = await request.json()

        if (!userId || !type || !title || !body) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const notification = await db.notification.create({
            data: {
                userId,
                type,
                title,
                body,
                data: data ? JSON.stringify(data) : null
            }
        })

        return NextResponse.json({ success: true, notification })
    } catch (error) {
        console.error("Create notification error:", error)
        return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
    }
}

// PATCH: Mark notification as read
export async function PATCH(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { notificationId, markAllRead } = await request.json()

        if (markAllRead) {
            // Mark all as read
            await db.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true, readAt: new Date() }
            })
            return NextResponse.json({ success: true, message: "All notifications marked as read" })
        }

        if (notificationId) {
            await db.notification.update({
                where: { id: notificationId },
                data: { isRead: true, readAt: new Date() }
            })
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    } catch (error) {
        console.error("Mark read error:", error)
        return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
    }
}

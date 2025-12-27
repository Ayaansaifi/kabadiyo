import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// GET: Get unread messages count for current user
export async function GET() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ count: 0 })
        }

        // Count messages where user is the receiver and not read
        const unreadCount = await db.message.count({
            where: {
                chat: {
                    OR: [
                        { sellerId: userId },
                        { buyerId: userId }
                    ]
                },
                senderId: { not: userId },
                read: false
            }
        })

        return NextResponse.json({ count: unreadCount })
    } catch (error) {
        console.error("Unread count error:", error)
        return NextResponse.json({ count: 0 })
    }
}

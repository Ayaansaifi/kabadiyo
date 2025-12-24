import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// POST: Mark messages as read
export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: otherUserId } = await context.params

        // Find chat
        const chat = await db.chat.findFirst({
            where: {
                OR: [
                    { sellerId: userId, buyerId: otherUserId },
                    { sellerId: otherUserId, buyerId: userId }
                ]
            }
        })

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 })
        }

        // Mark all messages from other user as read
        await db.message.updateMany({
            where: {
                chatId: chat.id,
                senderId: otherUserId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Mark read error:", error)
        return NextResponse.json({ error: "Failed" }, { status: 500 })
    }
}

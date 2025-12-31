import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// DELETE: Clear all messages in a chat
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId: otherUserId } = await params
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Find the chat between these two users
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

        // Delete all messages in this chat
        await db.message.deleteMany({
            where: { chatId: chat.id }
        })

        return NextResponse.json({ success: true, message: "Chat cleared" })
    } catch (error) {
        console.error("Clear chat error:", error)
        return NextResponse.json({ error: "Failed to clear chat" }, { status: 500 })
    }
}

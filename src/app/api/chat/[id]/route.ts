import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// GET: Fetch chat messages
export async function GET(
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

        // Get other user info
        const otherUser = await db.user.findUnique({
            where: { id: otherUserId },
            select: {
                id: true,
                name: true,
                image: true,
                kabadiwalaProfile: {
                    select: { businessName: true, isVerified: true }
                }
            }
        })

        if (!otherUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Find chat
        const chat = await db.chat.findFirst({
            where: {
                OR: [
                    { sellerId: userId, buyerId: otherUserId },
                    { sellerId: otherUserId, buyerId: userId }
                ]
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        senderId: true,
                        content: true,
                        messageType: true,
                        imageUrl: true,
                        createdAt: true,
                        isRead: true,
                        readAt: true,
                        isReported: true
                    }
                }
            }
        })

        return NextResponse.json({
            userId,
            otherUser,
            messages: chat?.messages || []
        })
    } catch (error) {
        console.error("Chat fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
    }
}

// POST: Send message
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
        const body = await req.json()
        const { content, messageType = "TEXT", imageUrl } = body

        console.log("Sending message:", { userId, otherUserId, content })

        if (!content && !imageUrl) {
            return NextResponse.json({ error: "Message required" }, { status: 400 })
        }

        // Get current user role
        const currentUser = await db.user.findUnique({ where: { id: userId } })
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Find or create chat
        let chat = await db.chat.findFirst({
            where: {
                OR: [
                    { sellerId: userId, buyerId: otherUserId },
                    { sellerId: otherUserId, buyerId: userId }
                ]
            }
        })

        if (!chat) {
            // Determine seller/buyer based on roles
            const isCurrentUserSeller = currentUser.role === "USER"
            const sellerId = isCurrentUserSeller ? userId : otherUserId
            const buyerId = isCurrentUserSeller ? otherUserId : userId

            console.log("Creating new chat:", { sellerId, buyerId })

            chat = await db.chat.create({
                data: { sellerId, buyerId }
            })
        }

        // Create message
        const message = await db.message.create({
            data: {
                chatId: chat.id,
                senderId: userId,
                content: content || "",
                messageType,
                imageUrl
            }
        })

        console.log("Message created:", message.id)

        // Update chat last message time
        await db.chat.update({
            where: { id: chat.id },
            data: { lastMessageAt: new Date() }
        })

        return NextResponse.json({ success: true, message })
    } catch (error) {
        console.error("Message send error:", error)
        return NextResponse.json({ error: "Failed to send" }, { status: 500 })
    }
}

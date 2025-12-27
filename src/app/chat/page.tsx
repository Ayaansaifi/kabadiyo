import { db } from "@/lib/db"
import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChatListClient } from "./ChatListClient"

export default async function ChatListPage() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) redirect("/login")

    const chats = await db.chat.findMany({
        where: {
            OR: [
                { sellerId: userId },
                { buyerId: userId }
            ]
        },
        include: {
            seller: {
                include: { kabadiwalaProfile: true }
            },
            buyer: {
                include: { kabadiwalaProfile: true }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: { lastMessageAt: 'desc' }
    })

    // Transform data for client component
    const chatData = chats.map((chat) => {
        const otherUser = userId === chat.sellerId ? chat.buyer : chat.seller
        const lastMessage = chat.messages[0]

        return {
            id: chat.id,
            otherUserId: otherUser.id,
            otherUserName: otherUser.kabadiwalaProfile?.businessName || otherUser.name || "Unknown",
            otherUserInitial: (otherUser.kabadiwalaProfile?.businessName || otherUser.name || "U")[0],
            otherUserImage: otherUser.image,
            isVerified: otherUser.kabadiwalaProfile?.isVerified || false,
            lastMessage: lastMessage?.content || null,
            lastMessageTime: lastMessage?.createdAt?.toISOString() || null,
            isLastMessageMine: lastMessage?.senderId === userId,
        }
    })

    return <ChatListClient chats={chatData} />
}


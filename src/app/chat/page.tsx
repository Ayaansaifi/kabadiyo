import { db } from "@/lib/db"
import { cookies } from "next/headers"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { redirect } from "next/navigation"

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
            seller: true,
            buyer: true,
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: { lastMessageAt: 'desc' }
    })

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            <div className="flex flex-col gap-4">
                {chats.length === 0 ? (
                    <p>No active chats. Start a conversation from the Marketplace.</p>
                ) : (
                    chats.map((chat) => {
                        const otherUser = userId === chat.sellerId ? chat.buyer : chat.seller
                        const lastMessage = chat.messages[0]

                        return (
                            <Link key={chat.id} href={`/chat/${otherUser.id}`}>
                                <Card className="hover:bg-accent transition-colors">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback>{otherUser.name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-semibold">{otherUser.name || 'Unknown User'}</h3>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {lastMessage ? lastMessage.content : 'No messages yet'}
                                            </p>
                                        </div>
                                        {lastMessage && (
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(lastMessage.createdAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}

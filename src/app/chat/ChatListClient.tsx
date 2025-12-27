"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, CheckCheck, Check, Verified } from "lucide-react"
import { useOnlineStatus, OnlineStatusDot } from "@/hooks/useOnlineStatus"

interface ChatItem {
    id: string
    otherUserId: string
    otherUserName: string
    otherUserInitial: string
    otherUserImage: string | null
    isVerified: boolean
    lastMessage: string | null
    lastMessageTime: string | null
    isLastMessageMine: boolean
}

interface ChatListClientProps {
    chats: ChatItem[]
}

// Relative time formatting
function getRelativeTime(dateStr: string | null): string {
    if (!dateStr) return ""

    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Individual Chat Item with Online Status
function ChatItemCard({ chat, index }: { chat: ChatItem; index: number }) {
    const { isOnline } = useOnlineStatus(chat.otherUserId)

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
        >
            <Link href={`/chat/${chat.otherUserId}`}>
                <Card className="hover:bg-accent/50 active:scale-[0.98] transition-all duration-200 border-0 shadow-sm mb-2">
                    <CardContent className="p-4 flex items-center gap-4">
                        {/* Avatar with Online Status */}
                        <div className="relative">
                            <Avatar className="h-14 w-14 ring-2 ring-background">
                                {chat.otherUserImage ? (
                                    <AvatarImage src={chat.otherUserImage} />
                                ) : null}
                                <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-500 text-white text-lg font-bold">
                                    {chat.otherUserInitial}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 ring-2 ring-background rounded-full">
                                <OnlineStatusDot isOnline={isOnline} size="md" />
                            </span>
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-base truncate">{chat.otherUserName}</h3>
                                {chat.isVerified && (
                                    <Badge variant="secondary" className="px-1 py-0 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                        <Verified className="h-3 w-3" />
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                                {chat.isLastMessageMine && (
                                    <CheckCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                )}
                                {chat.lastMessage || "Start a conversation..."}
                            </p>
                        </div>

                        {/* Time & Unread */}
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground">
                                {getRelativeTime(chat.lastMessageTime)}
                            </span>
                            {/* Unread badge placeholder - would need real unread count */}
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    )
}

export function ChatListClient({ chats }: ChatListClientProps) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto py-6 px-4 max-w-2xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-6"
                >
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Messages</h1>
                        <p className="text-sm text-muted-foreground">{chats.length} conversations</p>
                    </div>
                </motion.div>

                {/* Chat List */}
                {chats.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">No conversations yet</p>
                        <Link href="/market" className="text-primary hover:underline text-sm mt-2 inline-block">
                            Find a Kabadiwala to start chatting
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-1">
                        {chats.map((chat, index) => (
                            <ChatItemCard key={chat.id} chat={chat} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

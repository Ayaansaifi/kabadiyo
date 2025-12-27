"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, CheckCheck, Verified } from "lucide-react"
import { useOnlineStatus, OnlineStatusDot } from "@/hooks/useOnlineStatus"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"

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

// APP-ONLY: Advanced Chat Item with Online Status
function AppChatItemCard({ chat, index }: { chat: ChatItem; index: number }) {
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
                        <div className="relative">
                            <Avatar className="h-14 w-14 ring-2 ring-background">
                                {chat.otherUserImage && <AvatarImage src={chat.otherUserImage} />}
                                <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-500 text-white text-lg font-bold">
                                    {chat.otherUserInitial}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 ring-2 ring-background rounded-full">
                                <OnlineStatusDot isOnline={isOnline} size="md" />
                            </span>
                        </div>
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
                                {chat.isLastMessageMine && <CheckCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                                {chat.lastMessage || "Start a conversation..."}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground">{getRelativeTime(chat.lastMessageTime)}</span>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    )
}

// WEBSITE: Simple Chat Item (no animations, no online status)
function WebChatItemCard({ chat }: { chat: ChatItem }) {
    return (
        <Link href={`/chat/${chat.otherUserId}`}>
            <Card className="hover:bg-accent transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                    <Avatar>
                        {chat.otherUserImage && <AvatarImage src={chat.otherUserImage} />}
                        <AvatarFallback>{chat.otherUserInitial}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <h3 className="font-semibold">{chat.otherUserName}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage || "No messages yet"}
                        </p>
                    </div>
                    {chat.lastMessageTime && (
                        <span className="text-xs text-muted-foreground">
                            {new Date(chat.lastMessageTime).toLocaleDateString()}
                        </span>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}

export function ChatListClient({ chats }: ChatListClientProps) {
    const { isNative, isLoading } = useIsNativePlatform()

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="h-8 w-32 bg-muted/30 rounded animate-pulse mb-6" />
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-muted/20 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    // APP VERSION: Advanced UI
    if (isNative) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
                <div className="container mx-auto py-6 px-4 max-w-2xl">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <MessageCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Messages</h1>
                            <p className="text-sm text-muted-foreground">{chats.length} conversations</p>
                        </div>
                    </motion.div>

                    {chats.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">No conversations yet</p>
                            <Link href="/market" className="text-primary hover:underline text-sm mt-2 inline-block">
                                Find a Kabadiwala to start chatting
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="space-y-1">
                            {chats.map((chat, index) => (
                                <AppChatItemCard key={chat.id} chat={chat} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // WEBSITE VERSION: Simple UI
    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            <div className="flex flex-col gap-4">
                {chats.length === 0 ? (
                    <p>No active chats. Start a conversation from the Marketplace.</p>
                ) : (
                    chats.map(chat => <WebChatItemCard key={chat.id} chat={chat} />)
                )}
            </div>
        </div>
    )
}

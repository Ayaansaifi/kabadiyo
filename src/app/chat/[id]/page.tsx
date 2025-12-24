"use client"

import { useState, useEffect, useRef, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Send, ArrowLeft, MoreVertical, CheckCheck, Check,
    Flag, Loader2, Trash2, Edit2, X, Zap
} from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface Message {
    id: string
    senderId: string
    content: string
    messageType: string
    imageUrl: string | null
    createdAt: string
    isRead: boolean
    readAt: string | null
    isReported: boolean
    isDeleted: boolean
    deletedAt: string | null
    editedAt: string | null
}

interface OtherUser {
    id: string
    name: string
    image: string | null
    kabadiwalaProfile?: {
        businessName: string
        isVerified: boolean
    }
}

const quickReplies = [
    "Yes, I'm interested",
    "What are your rates?",
    "When can you come?",
    "Can you come today?",
    "Thank you!"
]

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const resolvedParams = use(params)
    const otherUserId = resolvedParams.id
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [userId, setUserId] = useState<string | null>(null)

    const [messages, setMessages] = useState<Message[]>([])
    const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [isTyping] = useState(false)
    const [showQuickReplies, setShowQuickReplies] = useState(false)
    const [loading, setLoading] = useState(true)

    // Edit state
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState("")

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/chat/${otherUserId}`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data.messages || [])
                setOtherUser(data.otherUser)
                setUserId(data.userId)
            } else if (res.status === 401) {
                router.push("/login")
            }
        } catch {
            console.error("Failed to fetch messages")
        } finally {
            setLoading(false)
        }
    }, [otherUserId, router])

    useEffect(() => {
        fetchMessages()
        // Poll for new messages every 2 seconds
        const interval = setInterval(fetchMessages, 2000)
        return () => clearInterval(interval)
    }, [fetchMessages])

    // Auto scroll to bottom
    useEffect(() => {
        if (!editingMessageId) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, editingMessageId])

    // Mark messages as read
    useEffect(() => {
        async function markRead() {
            const unreadMessages = messages.filter(m => m.senderId !== userId && !m.isRead)
            if (unreadMessages.length > 0) {
                await fetch(`/api/chat/${otherUserId}/read`, { method: "POST" })
            }
        }
        if (userId) markRead()
    }, [messages, userId, otherUserId])

    async function handleSend(content?: string) {
        const msg = content || newMessage
        if (!msg.trim()) return

        // Handle Edit submission
        if (editingMessageId) {
            await handleEditSubmit()
            return
        }

        setSending(true)
        const messageToSend = msg
        setNewMessage("")
        setShowQuickReplies(false)

        // Optimistic update
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            senderId: userId || "",
            content: messageToSend,
            messageType: "TEXT",
            imageUrl: null,
            createdAt: new Date().toISOString(),
            isRead: false,
            readAt: null,
            isReported: false,
            isDeleted: false,
            deletedAt: null,
            editedAt: null
        }
        setMessages(prev => [...prev, optimisticMessage])

        try {
            const res = await fetch(`/api/chat/${otherUserId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: messageToSend })
            })

            if (res.ok) {
                await fetchMessages()
            } else {
                setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
                toast.error("Failed to send message")
            }
        } catch {
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
            toast.error("Failed to send message")
        } finally {
            setSending(false)
            inputRef.current?.focus()
        }
    }

    async function handleReport(messageId: string) {
        try {
            await fetch(`/api/chat/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId, reason: "inappropriate" })
            })
            await fetchMessages()
            toast.success("Reported message")
        } catch {
            toast.error("Failed to report")
        }
    }

    async function handleDelete(messageId: string) {
        try {
            const res = await fetch(`/api/chat/message/${messageId}`, {
                method: "DELETE"
            })
            if (res.ok) {
                await fetchMessages()
                toast.success("Message deleted")
            } else {
                toast.error("Failed to delete")
            }
        } catch {
            toast.error("Failed to delete")
        }
    }

    function startEdit(message: Message) {
        setEditingMessageId(message.id)
        setEditContent(message.content)
        setNewMessage(message.content)
        inputRef.current?.focus()
    }

    function cancelEdit() {
        setEditingMessageId(null)
        setEditContent("")
        setNewMessage("")
    }

    async function handleEditSubmit() {
        if (!editingMessageId || !newMessage.trim()) return

        setSending(true)
        try {
            const res = await fetch(`/api/chat/message/${editingMessageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newMessage })
            })

            if (res.ok) {
                setEditingMessageId(null)
                setEditContent("")
                setNewMessage("")
                await fetchMessages()
                toast.success("Message edited")
            } else {
                toast.error("Failed to edit")
            }
        } catch {
            toast.error("Failed to edit")
        } finally {
            setSending(false)
        }
    }

    function formatTime(dateStr: string) {
        const date = new Date(dateStr)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    function formatDate(dateStr: string) {
        const date = new Date(dateStr)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) return "Today"
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
        return date.toLocaleDateString()
    }

    function groupMessagesByDate(msgs: Message[]) {
        const groups: { date: string; messages: Message[] }[] = []
        msgs.forEach(msg => {
            const date = formatDate(msg.createdAt)
            const existing = groups.find(g => g.date === date)
            if (existing) {
                existing.messages.push(msg)
            } else {
                groups.push({ date, messages: [msg] })
            }
        })
        return groups
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const messageGroups = groupMessagesByDate(messages)

    return (
        <div className="flex flex-col h-[calc(100vh-57px)]">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b bg-background">
                <Link href="/chat">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <Avatar>
                    <AvatarFallback>
                        {otherUser?.kabadiwalaProfile?.businessName?.[0] || otherUser?.name?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold flex items-center gap-2">
                        {otherUser?.kabadiwalaProfile?.businessName || otherUser?.name}
                        {otherUser?.kabadiwalaProfile?.isVerified && (
                            <Badge className="text-xs bg-blue-500">Verified</Badge>
                        )}
                    </p>
                    {isTyping && (
                        <p className="text-xs text-muted-foreground animate-pulse">typing...</p>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/book/${otherUserId}`}>Book Pickup</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                {messageGroups.length === 0 ? (
                    <div className="text-center text-muted-foreground py-20">
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                    </div>
                ) : (
                    messageGroups.map((group) => (
                        <div key={group.date}>
                            <div className="flex justify-center my-4">
                                <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
                                    {group.date}
                                </span>
                            </div>

                            <AnimatePresence>
                                {group.messages.map((msg) => {
                                    const isMe = msg.senderId === userId
                                    const isTemp = msg.id.startsWith("temp-")
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: isTemp ? 0.7 : 1, y: 0 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2 group`}
                                        >
                                            <div className={`max-w-[75%] relative ${isMe ? 'order-1' : 'order-2'}`}>
                                                <div
                                                    className={`p-3 rounded-2xl ${msg.isDeleted
                                                        ? 'bg-muted border border-muted-foreground/20 italic text-muted-foreground'
                                                        : isMe
                                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                                            : 'bg-background border rounded-bl-md'
                                                        } ${msg.isReported ? 'opacity-50' : ''}`}
                                                >
                                                    {msg.isDeleted ? (
                                                        <p className="text-sm flex items-center gap-2">
                                                            <X className="h-3 w-3" />
                                                            This message was deleted
                                                        </p>
                                                    ) : (
                                                        <>
                                                            {msg.imageUrl && (
                                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                                <img
                                                                    src={msg.imageUrl}
                                                                    alt="Shared"
                                                                    className="rounded-lg mb-2 max-w-full"
                                                                />
                                                            )}
                                                            <p className="break-words">
                                                                {msg.content}
                                                                {msg.editedAt && <span className="text-[10px] opacity-70 ml-2">(edited)</span>}
                                                            </p>
                                                        </>
                                                    )}

                                                    <div className={`flex items-center gap-1 justify-end mt-1 ${msg.isDeleted
                                                        ? 'hidden'
                                                        : isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                                        }`}>
                                                        <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                                                        {isMe && (
                                                            isTemp
                                                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                                                : msg.isRead
                                                                    ? <CheckCheck className="h-3 w-3 text-blue-400" />
                                                                    : <Check className="h-3 w-3" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {!msg.isDeleted && !isTemp && (
                                                    <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? '-left-8' : '-right-8'
                                                        }`}>
                                                        {isMe ? (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="p-1 hover:bg-muted rounded-full">
                                                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align={isMe ? "end" : "start"}>
                                                                    <DropdownMenuItem onClick={() => startEdit(msg)}>
                                                                        <Edit2 className="h-4 w-4 mr-2" /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleDelete(msg.id)} className="text-destructive">
                                                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        ) : (
                                                            !msg.isReported && (
                                                                <button
                                                                    onClick={() => handleReport(msg.id)}
                                                                >
                                                                    <Flag className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                                {msg.isReported && !msg.isDeleted && (
                                                    <span className="text-[10px] text-destructive ml-2">Reported</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {showQuickReplies && !editingMessageId && (
                <div className="px-4 py-2 border-t bg-background overflow-x-auto flex gap-2 animate-in slide-in-from-bottom-2">
                    {quickReplies.map((reply) => (
                        <Button
                            key={reply}
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => handleSend(reply)}
                        >
                            {reply}
                        </Button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-background">
                {editingMessageId && (
                    <div className="flex items-center justify-between bg-muted/50 p-2 rounded-t-md text-sm">
                        <span className="font-semibold flex items-center gap-2">
                            <Edit2 className="h-3 w-3" /> Editing message
                        </span>
                        <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowQuickReplies(!showQuickReplies)}
                        className={showQuickReplies ? "text-yellow-500 bg-yellow-50" : "text-muted-foreground"}
                    >
                        <Zap className="h-5 w-5 fill-current" />
                    </Button>
                    <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className={`flex-1 ${editingMessageId ? 'rounded-t-none' : ''}`}
                        disabled={sending}
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    )
}

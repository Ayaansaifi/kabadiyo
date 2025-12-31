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
    Flag, Loader2, Trash2, Edit2, X, Zap,
    Paperclip, Image as ImageIcon, FileText, Download,
    File, Plus
} from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useOnlineStatus, OnlineStatusDot } from "@/hooks/useOnlineStatus"

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
    const [showAttachments, setShowAttachments] = useState(false)
    const [loading, setLoading] = useState(true)

    // File state
    const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Online status
    const { isOnline, lastSeenText } = useOnlineStatus(otherUserId)

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

    // Real-time integration
    useEffect(() => {
        fetchMessages()
    }, [fetchMessages])

    // Subscribe to SSE events
    useEffect(() => {
        if (!userId) return

        const eventSource = new EventSource(`/api/realtime?userId=${userId}`)

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                if (data.type === 'message' && data.data.chatId === resolvedParams.id) {
                    // Append new message if it belongs to current chat
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.find(m => m.id === data.data.message.id)) return prev
                        return [...prev, data.data.message]
                    })

                    // Mark as read immediately if window is focused (simplified)
                    fetch(`/api/chat/${otherUserId}/read`, { method: "POST" })
                }
            } catch (error) {
                console.error('SSE Error:', error)
            }
        }

        return () => {
            eventSource.close()
        }
    }, [userId, resolvedParams.id, otherUserId])

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

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB")
            return
        }

        setSelectedFile(file)
        if (file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = (e) => setFilePreview(e.target?.result as string)
            reader.readAsDataURL(file)
        } else {
            setFilePreview(null)
        }
        setShowAttachments(false)
    }

    async function handleSend(content?: string) {
        const msg = content || newMessage
        if (!msg.trim() && !selectedFile) return

        // Handle Edit submission
        if (editingMessageId) {
            await handleEditSubmit()
            return
        }

        setSending(true)
        const messageToSend = msg
        setNewMessage("")
        setShowQuickReplies(false)

        try {
            let imageUrl = null
            let messageType = "TEXT"

            if (selectedFile) {
                setIsUploading(true)
                const formData = new FormData()
                formData.append("file", selectedFile)

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData
                })

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json()
                    imageUrl = uploadData.url
                    messageType = selectedFile.type.startsWith("image/") ? "IMAGE" : "FILE"
                } else {
                    toast.error("File upload failed")
                    setIsUploading(false)
                    setSending(false)
                    return
                }
                setIsUploading(false)
            }

            // Optimistic update
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                senderId: userId || "",
                content: messageToSend || (messageType === "IMAGE" ? "📷 Image" : "📄 File"),
                messageType: messageType,
                imageUrl: imageUrl,
                createdAt: new Date().toISOString(),
                isRead: false,
                readAt: null,
                isReported: false,
                isDeleted: false,
                deletedAt: null,
                editedAt: null
            }
            setMessages(prev => [...prev, optimisticMessage])

            const res = await fetch(`/api/chat/${otherUserId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: messageToSend || (messageType === "IMAGE" ? "📷 Image" : "📄 File"),
                    imageUrl,
                    messageType
                })
            })

            if (res.ok) {
                setSelectedFile(null)
                setFilePreview(null)
                await fetchMessages()
            } else {
                setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
                toast.error("Failed to send message")
            }
        } catch {
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
        // Optimistic update
        const previousMessages = [...messages]
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, isDeleted: true, content: "This message was deleted" } : m
        ))

        try {
            const res = await fetch(`/api/chat/message/${messageId}`, {
                method: "DELETE"
            })
            if (!res.ok) {
                // Revert on failure
                setMessages(previousMessages)
                toast.error("Failed to delete")
            }
        } catch {
            setMessages(previousMessages)
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
                // Optimistic update for edit
                setMessages(prev => prev.map(m =>
                    m.id === editingMessageId ? { ...m, content: newMessage, editedAt: new Date().toISOString() } : m
                ))
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

    async function handleBlock() {
        if (!confirm("Are you sure you want to block this user?")) return
        try {
            await fetch(`/api/user/block`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: otherUserId })
            })
            toast.success("User blocked")
            router.push("/chat")
        } catch {
            toast.error("Failed to block user")
        }
    }

    async function handleClearChat() {
        if (!confirm("Delete all messages? This cannot be undone.")) return

        // Optimistic update
        const previousMessages = [...messages]
        setMessages([])

        try {
            const res = await fetch(`/api/chat/clear/${resolvedParams.id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Chat cleared")
            } else {
                setMessages(previousMessages)
                toast.error("Failed to clear chat")
            }
        } catch {
            setMessages(previousMessages)
            toast.error("Failed to clear chat")
        }
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
                <div className="relative">
                    <Avatar>
                        <AvatarFallback>
                            {otherUser?.kabadiwalaProfile?.businessName?.[0] || otherUser?.name?.[0] || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0">
                        <OnlineStatusDot isOnline={isOnline} size="sm" />
                    </span>
                </div>
                <div className="flex-1">
                    <p className="font-semibold flex items-center gap-2">
                        {otherUser?.kabadiwalaProfile?.businessName || otherUser?.name}
                        {otherUser?.kabadiwalaProfile?.isVerified && (
                            <Badge className="text-xs bg-blue-500">Verified</Badge>
                        )}
                    </p>
                    {isTyping ? (
                        <p className="text-xs text-green-500 animate-pulse">typing...</p>
                    ) : (
                        <p className={`text-xs ${isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {lastSeenText}
                        </p>
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
                        <DropdownMenuItem onClick={handleClearChat}>
                            <Trash2 className="mr-2 h-4 w-4" /> Clear Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReport(messages[messages.length - 1]?.id || "general")}>
                            <Flag className="mr-2 h-4 w-4" /> Report User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleBlock} className="text-red-500 focus:text-red-500">
                            <X className="mr-2 h-4 w-4" /> Block User
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
                                    const isFile = msg.messageType === "FILE"
                                    const isImage = msg.messageType === "IMAGE"

                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2 group`}
                                        >
                                            <div className={`max-w-[80%] relative ${isMe ? 'order-1' : 'order-2'}`}>
                                                <div
                                                    className={`p-1.5 rounded-2xl shadow-sm ${msg.isDeleted
                                                        ? 'bg-muted border border-muted-foreground/10 italic text-muted-foreground'
                                                        : isMe
                                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                                            : 'bg-background border rounded-bl-md'
                                                        }`}
                                                >
                                                    {!msg.isDeleted && (
                                                        <div className="px-1.5 py-1">
                                                            {isImage && msg.imageUrl && (
                                                                <div className="relative rounded-xl overflow-hidden mb-2 cursor-pointer border border-black/5" onClick={() => window.open(msg.imageUrl!, '_blank')}>
                                                                    <img src={msg.imageUrl} alt="Shared" className="w-full h-auto max-h-72 object-cover" />
                                                                </div>
                                                            )}
                                                            {isFile && msg.imageUrl && (
                                                                <div className="flex items-center gap-3 p-3 bg-white/10 dark:bg-black/20 rounded-xl mb-2 border border-white/20">
                                                                    <div className="p-2 bg-white/20 rounded-lg">
                                                                        <FileText className="h-6 w-6" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-bold truncate">Document</p>
                                                                        <p className="text-[10px] opacity-70">Shared File</p>
                                                                    </div>
                                                                    <a href={msg.imageUrl} target="_blank" className="p-2 hover:bg-white/20 rounded-full">
                                                                        <Download className="h-4 w-4" />
                                                                    </a>
                                                                </div>
                                                            )}
                                                            <p className="break-words text-[15px] leading-snug">
                                                                {msg.content}
                                                                {msg.editedAt && <span className="text-[10px] opacity-60 ml-1.5 italic">(edited)</span>}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {msg.isDeleted && (
                                                        <p className="text-sm px-2 py-1 flex items-center gap-2">
                                                            <X className="h-3 w-3" /> This message was deleted
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-1.5 justify-end px-2 pb-0.5 opacity-60">
                                                        <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                                                        {isMe && !msg.isDeleted && (msg.isRead ? <CheckCheck className="h-3 w-3 text-blue-400" /> : <Check className="h-3 w-3" />)}
                                                    </div>
                                                </div>

                                                {/* Edit/Delete Actions */}
                                                {!msg.isDeleted && isMe && (
                                                    <div className="absolute top-1/2 -translate-y-1/2 -left-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="p-1.5 hover:bg-muted rounded-full bg-background border shadow-sm">
                                                                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => startEdit(msg)}>
                                                                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(msg.id)} className="text-destructive">
                                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
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

            {/* Multi-Tool Input */}
            <div className="p-4 border-t bg-background space-y-3">
                {/* File Preview */}
                {selectedFile && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative flex items-center gap-3 p-3 bg-muted rounded-xl border-2 border-primary/20">
                        {filePreview ? (
                            <img src={filePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold truncate">{selectedFile.name}</p>
                            <p className="text-[10px] text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button onClick={() => { setSelectedFile(null); setFilePreview(null); }} className="p-1 hover:bg-red-100 rounded-full text-red-500">
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                )}

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

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowAttachments(!showAttachments)}
                            className="text-muted-foreground hover:text-primary rounded-full hover:bg-primary/5"
                        >
                            <Plus className={`h-6 w-6 transition-transform duration-300 ${showAttachments ? 'rotate-45' : ''}`} />
                        </Button>

                        <AnimatePresence>
                            {showAttachments && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                    animate={{ opacity: 1, scale: 1, y: -130 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                    className="absolute bottom-12 left-0 bg-background border shadow-xl rounded-2xl p-2 flex flex-col gap-2 z-50 min-w-44"
                                >
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-muted rounded-xl text-sm font-medium">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><ImageIcon className="h-5 w-5 text-blue-500" /></div> Photos
                                    </button>
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-muted rounded-xl text-sm font-medium">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><FileText className="h-5 w-5 text-purple-500" /></div> Documents
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={onFileSelect} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 rounded-full bg-muted/50 border-none px-6 focus-visible:ring-primary/20 h-12"
                        disabled={sending}
                        autoComplete="off"
                    />

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        disabled={sending || (!newMessage.trim() && !selectedFile)}
                        onClick={() => handleSend()}
                        className={`p-3 rounded-full transition-all duration-300 ${(newMessage.trim() || selectedFile) ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground pointer-events-none'}`}
                    >
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 translate-x-0.5" />}
                    </motion.button>
                </div>
            </div>
        </div>
    )
}

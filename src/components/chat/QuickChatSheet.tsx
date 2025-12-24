"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Send, Loader2, MessageCircle, X, Check, CheckCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface QuickChatSheetProps {
    otherUserId: string
    businessName: string
    userName: string
    userImage?: string | null
    isVerified: boolean
    trigger?: React.ReactNode
}

interface Message {
    id: string
    senderId: string
    content: string
    createdAt: string
    isRead: boolean
}

export function QuickChatSheet({
    otherUserId,
    businessName,
    userName,
    userImage,
    isVerified,
    trigger
}: QuickChatSheetProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Poll for messages when open
    useEffect(() => {
        if (!isOpen) return

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/chat/${otherUserId}`)
                if (res.ok) {
                    const data = await res.json()
                    setMessages(data.messages || [])
                    setCurrentUserId(data.userId)
                } else if (res.status === 401) {
                    toast.error("Please login to chat")
                    router.push("/login")
                }
            } catch (error) {
                console.error("Failed to fetch messages", error)
            } finally {
                setLoading(false)
            }
        }

        fetchMessages()
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [isOpen, otherUserId, router])

    // Scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, isOpen])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!newMessage.trim()) return

        const tempMsg = {
            id: `temp-${Date.now()}`,
            senderId: currentUserId || "me",
            content: newMessage,
            createdAt: new Date().toISOString(),
            isRead: false
        }

        setMessages(prev => [...prev, tempMsg])
        setNewMessage("")
        setSending(true)

        try {
            const res = await fetch(`/api/chat/${otherUserId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: tempMsg.content })
            })

            if (!res.ok) throw new Error("Failed to send")

            // Refresh messages immediately
            const fetchRes = await fetch(`/api/chat/${otherUserId}`)
            if (fetchRes.ok) {
                const data = await fetchRes.json()
                setMessages(data.messages || [])
            }
        } catch {
            toast.error("Failed to send message")
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
        } finally {
            setSending(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="w-full">
                        <MessageCircle className="mr-2 h-4 w-4" /> Chat
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="right" className="w-[100%] sm:w-[400px] p-0 flex flex-col h-full">
                <SheetHeader className="p-4 border-b bg-muted/20">
                    <SheetTitle className="sr-only">Chat with {businessName}</SheetTitle>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={userImage || undefined} />
                            <AvatarFallback>{businessName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold flex items-center gap-1">
                                {businessName}
                                {isVerified && <CheckCheck className="h-3 w-3 text-blue-500" />}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Online Now
                            </p>
                        </div>
                    </div>
                </SheetHeader>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>Start a conversation with {businessName}</p>
                            <p className="text-xs">Ask about rates or pickup times</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === currentUserId
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe
                                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                                : 'bg-white dark:bg-slate-800 border rounded-bl-none'
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-background">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                            disabled={sending}
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    )
}

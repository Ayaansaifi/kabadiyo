import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    Check, CheckCheck, Clock, MoreVertical,
    VolumeX, Ban, Flag, Trash2, Edit2, Copy
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface MessageBubbleProps {
    id?: string
    content: string
    timestamp: Date
    isSender: boolean
    status?: 'sending' | 'sent' | 'delivered' | 'read'
    senderName?: string
    senderImage?: string
    onEdit?: (id: string, content: string) => void
    onDelete?: (id: string) => void
}

/**
 * Enhanced Message Bubble Component
 */
export function MessageBubble({
    id,
    content,
    timestamp,
    isSender,
    status = 'sent',
    senderName,
    onEdit,
    onDelete
}: MessageBubbleProps) {
    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const statusIcons = {
        sending: <Clock className="h-3 w-3 text-gray-400" />,
        sent: <Check className="h-3 w-3 text-gray-400" />,
        delivered: <CheckCheck className="h-3 w-3 text-gray-400" />,
        read: <CheckCheck className="h-3 w-3 text-blue-500" />
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "group flex w-full",
                isSender ? "justify-end" : "justify-start"
            )}
        >
            <div className={cn(
                "flex items-center gap-2 max-w-[75%]",
                isSender ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Message menu (visible on hover/long-press) */}
                {isSender && id && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isSender ? "end" : "start"}>
                            <DropdownMenuItem onClick={() => onEdit?.(id, content)}>
                                <Edit2 className="h-3 w-3 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-500 hover:text-red-600"
                                onClick={() => onDelete?.(id)}
                            >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <div
                    className={cn(
                        "rounded-2xl px-4 py-2 shadow-sm relative",
                        isSender
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-800 text-foreground rounded-bl-md border"
                    )}
                >
                    {/* Sender name for group chats */}
                    {!isSender && senderName && (
                        <p className="text-xs font-medium text-primary mb-1">
                            {senderName}
                        </p>
                    )}

                    {/* Message content */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {content}
                    </p>

                    {/* Timestamp and status */}
                    <div className={cn(
                        "flex items-center gap-1 mt-1",
                        isSender ? "justify-end" : "justify-start"
                    )}>
                        <span className={cn(
                            "text-[10px]",
                            isSender ? "text-white/70" : "text-muted-foreground"
                        )}>
                            {formatTime(timestamp)}
                        </span>
                        {isSender && statusIcons[status]}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

/**
 * Chat Header Component
 */
interface ChatHeaderProps {
    name: string
    image?: string
    isOnline?: boolean
    lastSeen?: Date
    onBack?: () => void
    onAction?: (action: string) => void
}

export function ChatHeader({ name, image, isOnline, lastSeen, onBack, onAction }: ChatHeaderProps) {
    const formatLastSeen = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'अभी ऑनलाइन'
        if (minutes < 60) return `${minutes} मिनट पहले`
        if (hours < 24) return `${hours} घंटे पहले`
        return `${days} दिन पहले`
    }

    return (
        <div className="flex items-center gap-3 p-4 border-b bg-white dark:bg-gray-900 sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
            {onBack && (
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}

            {/* Avatar */}
            <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                    {image ? (
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        name[0]?.toUpperCase()
                    )}
                </div>
                {/* Online indicator */}
                <div className={cn(
                    "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900",
                    isOnline ? "bg-green-500" : "bg-gray-400"
                )} />
            </div>

            {/* Name and status */}
            <div className="flex-1">
                <h3 className="font-semibold">{name}</h3>
                <p className="text-xs text-muted-foreground">
                    {isOnline ? (
                        <span className="text-green-500">ऑनलाइन</span>
                    ) : lastSeen ? (
                        formatLastSeen(lastSeen)
                    ) : (
                        'ऑफलाइन'
                    )}
                </p>
            </div>

            {/* Settings Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onAction?.('mute')}>
                        <VolumeX className="mr-2 h-4 w-4" />
                        <span>Mute Notifications</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction?.('clear')}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Clear Chat</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction?.('report')}>
                        <Flag className="mr-2 h-4 w-4" />
                        <span>Report</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => onAction?.('block')}
                    >
                        <Ban className="mr-2 h-4 w-4" />
                        <span>Block</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

/**
 * Message Input Component
 */
interface MessageInputProps {
    value: string
    onChange: (value: string) => void
    onSend: () => void
    onTyping?: () => void
    disabled?: boolean
    placeholder?: string
}

export function MessageInput({
    value,
    onChange,
    onSend,
    onTyping,
    disabled,
    placeholder = "संदेश लिखें..."
}: MessageInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (value.trim()) {
                onSend()
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value)
        onTyping?.()
    }

    return (
        <div className="flex items-end gap-2 p-4 border-t bg-white dark:bg-gray-900">
            <div className="flex-1 relative">
                <textarea
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={placeholder}
                    rows={1}
                    className={cn(
                        "w-full resize-none rounded-2xl border bg-gray-50 dark:bg-gray-800 px-4 py-3",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                        "placeholder:text-muted-foreground text-sm",
                        "max-h-32"
                    )}
                    style={{ minHeight: '48px' }}
                />
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => value.trim() && onSend()}
                disabled={disabled || !value.trim()}
                className={cn(
                    "p-3 rounded-full transition-colors",
                    value.trim()
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                )}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
            </motion.button>
        </div>
    )
}

/**
 * Empty Chat State
 */
export function EmptyChatState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">बातचीत शुरू करें</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
                नीचे संदेश बॉक्स में अपना संदेश टाइप करके चैट शुरू करें
            </p>
        </div>
    )
}

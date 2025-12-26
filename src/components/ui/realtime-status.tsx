"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    Wifi, WifiOff,
    CheckCircle, AlertCircle, Info, X,
    Bell
} from 'lucide-react'

/**
 * Real-time connection status indicator
 */
interface ConnectionStatusProps {
    isOnline?: boolean
    className?: string
}

export function ConnectionStatus({ isOnline: propIsOnline, className }: ConnectionStatusProps) {
    const [isOnline, setIsOnline] = useState(propIsOnline ?? true)
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const handleOnline = () => {
            setIsOnline(true)
            setShowBanner(true)
            setTimeout(() => setShowBanner(false), 3000)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setShowBanner(true)
        }

        setIsOnline(navigator.onLine)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (propIsOnline !== undefined) {
        // Use prop value if provided
        return (
            <div className={cn("flex items-center gap-1", className)}>
                {propIsOnline ? (
                    <>
                        <Wifi className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-500">Online</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-500">Offline</span>
                    </>
                )}
            </div>
        )
    }

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className={cn(
                        "fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium",
                        isOnline
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                    )}
                >
                    {isOnline ? (
                        <span className="flex items-center justify-center gap-2">
                            <Wifi className="h-4 w-4" />
                            इंटरनेट कनेक्शन बहाल / Connection Restored
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <WifiOff className="h-4 w-4" />
                            इंटरनेट कनेक्शन नहीं / No Internet Connection
                        </span>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

/**
 * Toast notification types
 */
type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
    id: string
    type: ToastType
    message: string
    messageHi?: string
    duration?: number
}

// Toast store (simple implementation)
let toastListeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

function notifyListeners() {
    toastListeners.forEach(listener => listener([...toasts]))
}

export const toast = {
    show: (type: ToastType, message: string, messageHi?: string, duration = 5000) => {
        const id = Math.random().toString(36).slice(2)
        toasts.push({ id, type, message, messageHi, duration })
        notifyListeners()

        if (duration > 0) {
            setTimeout(() => {
                toasts = toasts.filter(t => t.id !== id)
                notifyListeners()
            }, duration)
        }

        return id
    },
    success: (message: string, messageHi?: string) => toast.show('success', message, messageHi),
    error: (message: string, messageHi?: string) => toast.show('error', message, messageHi),
    info: (message: string, messageHi?: string) => toast.show('info', message, messageHi),
    warning: (message: string, messageHi?: string) => toast.show('warning', message, messageHi),
    dismiss: (id: string) => {
        toasts = toasts.filter(t => t.id !== id)
        notifyListeners()
    },
    dismissAll: () => {
        toasts = []
        notifyListeners()
    }
}

/**
 * Toast Container Component
 */
export function ToastContainer() {
    const [toastList, setToastList] = useState<Toast[]>([])

    useEffect(() => {
        const listener = (newToasts: Toast[]) => setToastList(newToasts)
        toastListeners.push(listener)
        return () => {
            toastListeners = toastListeners.filter(l => l !== listener)
        }
    }, [])

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        warning: <AlertCircle className="h-5 w-5 text-yellow-500" />
    }

    const bgColors = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            <AnimatePresence>
                {toastList.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className={cn(
                            "flex items-start gap-3 p-4 rounded-lg border shadow-lg",
                            bgColors[t.type]
                        )}
                    >
                        {icons[t.type]}
                        <div className="flex-1 min-w-0">
                            {t.messageHi && (
                                <p className="text-sm font-medium">{t.messageHi}</p>
                            )}
                            <p className={cn(
                                "text-sm",
                                t.messageHi ? "text-muted-foreground" : "font-medium"
                            )}>
                                {t.message}
                            </p>
                        </div>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

/**
 * Typing Indicator for chat
 */
export function TypingIndicator({ userName }: { userName?: string }) {
    return (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.1
                        }}
                    />
                ))}
            </div>
            {userName ? `${userName} टाइप कर रहा है...` : 'टाइप कर रहा है...'}
        </div>
    )
}

/**
 * Online Status Dot
 */
interface OnlineStatusDotProps {
    isOnline: boolean
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
}

export function OnlineStatusDot({ isOnline, size = 'md', showText = false }: OnlineStatusDotProps) {
    const sizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    }

    return (
        <div className="flex items-center gap-1.5">
            <div className="relative">
                <div
                    className={cn(
                        "rounded-full",
                        sizes[size],
                        isOnline ? "bg-green-500" : "bg-gray-400"
                    )}
                />
                {isOnline && (
                    <div
                        className={cn(
                            "absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75",
                            sizes[size]
                        )}
                    />
                )}
            </div>
            {showText && (
                <span className={cn(
                    "text-xs",
                    isOnline ? "text-green-600" : "text-muted-foreground"
                )}>
                    {isOnline ? 'ऑनलाइन' : 'ऑफलाइन'}
                </span>
            )}
        </div>
    )
}

/**
 * Notification Badge
 */
export function NotificationBadge({ count, max = 99 }: { count: number; max?: number }) {
    if (count === 0) return null

    const displayCount = count > max ? `${max}+` : count

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 
                       bg-red-500 text-white text-xs font-bold rounded-full
                       flex items-center justify-center"
        >
            {displayCount}
        </motion.div>
    )
}

/**
 * Read Receipt Icons
 */
export function ReadReceipt({ status }: { status: 'sent' | 'delivered' | 'read' }) {
    if (status === 'sent') {
        return <CheckCircle className="h-4 w-4 text-gray-400" />
    }

    if (status === 'delivered') {
        return (
            <div className="flex -space-x-1">
                <CheckCircle className="h-4 w-4 text-gray-400" />
                <CheckCircle className="h-4 w-4 text-gray-400" />
            </div>
        )
    }

    return (
        <div className="flex -space-x-1">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <CheckCircle className="h-4 w-4 text-blue-500" />
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Notification {
    id: string
    title: string
    body: string
    isRead: boolean
    createdAt: string
    type: string
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications")
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    const markRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                body: JSON.stringify({ notificationId: id })
            })
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] p-0 rounded-full"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    <Link
                        href="/notifications"
                        className="text-xs text-primary hover:underline"
                        onClick={() => setIsOpen(false)}
                    >
                        View All
                    </Link>
                </div>
                <div className="h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                        <div className="divide-y text-left">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "p-4 cursor-pointer align-top flex-col items-start block focus:bg-muted/50",
                                        !notification.isRead && "bg-muted/20"
                                    )}
                                    onClick={() => markRead(notification.id)}
                                >
                                    <div className="flex justify-between items-start gap-2 w-full">
                                        <h5 className={cn("text-sm font-medium", !notification.isRead && "text-primary")}>
                                            {notification.title}
                                        </h5>
                                        {!notification.isRead && (
                                            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {notification.body}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground mt-2 block">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No notifications yet
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

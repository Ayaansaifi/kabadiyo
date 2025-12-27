"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, LayoutDashboard, ShoppingCart, MessageCircle, User } from "lucide-react"

export function MobileNav() {
    const pathname = usePathname()
    const [unreadCount, setUnreadCount] = useState(0)
    const [ripple, setRipple] = useState<string | null>(null)

    // Fetch unread messages count
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await fetch("/api/chat/unread")
                if (res.ok) {
                    const data = await res.json()
                    setUnreadCount(data.count || 0)
                }
            } catch { /* Silent fail */ }
        }
        fetchUnread()
        const interval = setInterval(fetchUnread, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true
        if (path !== "/" && pathname.startsWith(path)) return true
        return false
    }

    const handleTap = (name: string) => {
        setRipple(name)
        // Haptic feedback (if supported)
        if (navigator.vibrate) navigator.vibrate(10)
        setTimeout(() => setRipple(null), 300)
    }

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Book", href: "/market", icon: ShoppingCart },
        { name: "Chat", href: "/chat", icon: MessageCircle, badge: unreadCount },
        { name: "Profile", href: "/profile", icon: User }
    ]

    return (
        <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
            <div className="bg-black/80 dark:bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl shadow-black/40 h-16 px-2 flex justify-between items-center">
                {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => handleTap(item.name)}
                            className="relative flex flex-col items-center justify-center w-full h-full"
                        >
                            {/* Active Bubble Background */}
                            {active && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 m-2 bg-gradient-to-br from-green-400 to-green-600 rounded-full z-0"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}

                            {/* Icon Container */}
                            <div className="relative z-10 p-2">
                                <item.icon
                                    className={`h-6 w-6 transition-all duration-200 ${active
                                        ? "text-white"
                                        : "text-gray-400 dark:text-gray-400 group-hover:text-white"
                                        }`}
                                />

                                {/* Notification Badge */}
                                {item.badge && item.badge > 0 && (
                                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-black" />
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}


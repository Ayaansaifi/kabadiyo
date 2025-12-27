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
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe-area-bottom">
            <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/10 shadow-[0_-4px_30px_-10px_rgba(0,0,0,0.15)]">
                <div className="flex justify-around items-center h-16 px-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => handleTap(item.name)}
                                className="relative flex flex-col items-center justify-center w-full h-full"
                            >
                                {/* Ripple Effect */}
                                <AnimatePresence>
                                    {ripple === item.name && (
                                        <motion.span
                                            initial={{ scale: 0, opacity: 0.5 }}
                                            animate={{ scale: 2, opacity: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="absolute inset-0 bg-primary/20 rounded-full"
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Active Indicator Line */}
                                {active && (
                                    <motion.span
                                        layoutId="activeTab"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}

                                {/* Icon Container */}
                                <motion.div
                                    animate={{
                                        y: active ? -4 : 0,
                                        scale: active ? 1.1 : 1
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className="relative p-1.5"
                                >
                                    <item.icon
                                        className={`h-6 w-6 transition-colors duration-200 ${active
                                                ? "text-primary fill-primary/20 stroke-[2.5px]"
                                                : "text-gray-400 dark:text-gray-500"
                                            }`}
                                    />

                                    {/* Notification Badge */}
                                    {item.badge && item.badge > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg"
                                        >
                                            {item.badge > 99 ? "99+" : item.badge}
                                        </motion.span>
                                    )}
                                </motion.div>

                                {/* Label */}
                                <motion.span
                                    animate={{
                                        opacity: active ? 1 : 0.6,
                                        fontWeight: active ? 600 : 400
                                    }}
                                    className={`text-[10px] mt-0.5 transition-colors duration-200 ${active ? "text-primary" : "text-gray-500 dark:text-gray-400"
                                        }`}
                                >
                                    {item.name}
                                </motion.span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}


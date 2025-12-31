"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, LayoutDashboard, Utensils, MessageCircle, User, Plus } from "lucide-react"
import { triggerHaptic } from "@/lib/native-utils"

export function MobileNav() {
    const pathname = usePathname()
    const [unreadCount, setUnreadCount] = useState(0)

    // Fetch unread messages count
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await fetch("/api/chat/unread")
                if (res.ok) {
                    const data = await res.json()
                    const newCount = data.count || 0
                    if (newCount > unreadCount) {
                        triggerHaptic() // Pulse on new message
                    }
                    setUnreadCount(newCount)
                }
            } catch { /* Silent fail */ }
        }
        fetchUnread()
        const interval = setInterval(fetchUnread, 15000) // Faster polling for real-time feel
        return () => clearInterval(interval)
    }, [])

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true
        if (path !== "/" && pathname.startsWith(path)) return true
        return false
    }

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Center", href: "/market", icon: Plus, isSpecial: true }, // The FAB
        { name: "Chat", href: "/chat", icon: MessageCircle, badge: unreadCount },
        { name: "Profile", href: "/profile", icon: User }
    ]

    const haptic = () => {
        triggerHaptic()
    }

    const isChatDetail = pathname.startsWith("/chat/") && pathname.split("/").length > 2
    if (isChatDetail) return null

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6 md:hidden">
            <div className="relative group">
                {/* Background Glass Container */}
                <div className="bg-black/80 dark:bg-white/10 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl shadow-black/40 h-18 px-3 flex justify-around items-center ring-1 ring-white/5">

                    {navItems.map((item, index) => {
                        const active = isActive(item.href)

                        // Special Centered FAB
                        if (item.isSpecial) {
                            return (
                                <div key="fab" className="relative flex-1 flex flex-col items-center justify-center -translate-y-6">
                                    <Link href={item.href} onClick={haptic}>
                                        <motion.div
                                            whileTap={{ scale: 0.9, rotate: 90 }}
                                            className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/40 border-4 border-white dark:border-background"
                                        >
                                            <item.icon className="h-8 w-8 text-white fill-current" />
                                        </motion.div>
                                    </Link>
                                    <span className="mt-8 text-[10px] font-bold text-green-500 uppercase tracking-tighter">
                                        Book
                                    </span>
                                </div>
                            )
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={haptic}
                                className="relative flex-1 flex flex-col items-center justify-center h-full group"
                            >
                                {/* Active Dot Indicator */}
                                <AnimatePresence>
                                    {active && (
                                        <motion.div
                                            layoutId="navIndicator"
                                            className="absolute -top-1 w-6 h-1 bg-green-500 rounded-full"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    whileTap={{ scale: 0.85 }}
                                    className="relative flex flex-col items-center"
                                >
                                    <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-green-500/10' : ''}`}>
                                        <item.icon
                                            className={`h-6 w-6 transition-colors duration-300 ${active
                                                ? "text-green-500"
                                                : "text-gray-400 group-hover:text-white"
                                                }`}
                                        />
                                    </div>

                                    {/* Notification Badge */}
                                    {item.badge && item.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-[8px] text-white flex items-center justify-center rounded-full border-2 border-black font-black">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}

                                    <span className={`text-[10px] mt-1 font-bold transition-all duration-300 tracking-tight ${active ? 'text-green-500' : 'text-gray-500'}`}>
                                        {item.name}
                                    </span>
                                </motion.div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

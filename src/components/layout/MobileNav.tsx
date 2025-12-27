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

    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [isManualHidden, setIsManualHidden] = useState(false)

    // Hide functionality logic
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Scrolling down -> Hide
                setIsVisible(false)
            } else {
                // Scrolling up -> Show
                setIsVisible(true)
            }
            setLastScrollY(currentScrollY)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [lastScrollY])

    // Specific Page Exclusions (e.g., Inside a Chat)
    const isChatDetail = pathname.startsWith("/chat/") && pathname.split("/").length > 2
    // If on Chat Detail, force hidden unless minimal overrides? 
    // Usually Chat Detail needs full screen input. User said "hide on chat page".
    // We will hide it on chat detail.

    // Derived state for rendering
    const shouldShow = !isManualHidden && (isVisible || pathname === "/") && !isChatDetail

    // Manual Toggle function
    const toggleVisibility = () => {
        setIsManualHidden(!isManualHidden) // Just toggles manual override state
        // If hidden manually, stay hidden. If shown manually, respect scroll? 
        // Let's make the button simply toggle the "Show" state forcefully? 
        // User asked "button to show/hide".
    }

    if (isChatDetail) return null // Completely remove on chat detail to avoid layout shift issues with keyboard

    return (
        <>
            {/* Toggle Button (Visible when Nav is Hidden or User wants to Toggle) - "Side me button" */}
            <div className={`fixed bottom-24 left-4 z-50 transition-all duration-300 ${shouldShow ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100 translate-y-0'}`}>
                <button
                    onClick={() => setIsManualHidden(false)} // Click to Show
                    className="p-3 rounded-full bg-primary/90 text-white shadow-lg backdrop-blur-md border border-white/20"
                >
                    <LayoutDashboard className="h-5 w-5" />
                </button>
            </div>

            {/* Main Nav Bar */}
            <div className={`fixed bottom-6 left-6 right-6 z-50 md:hidden transition-all duration-500 ease-in-out ${shouldShow ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'}`}>
                <div className="relative">
                    {/* Close/Hide Button (Small handle) */}
                    <button
                        onClick={() => setIsManualHidden(true)}
                        className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        {/* Maybe too hidden? */}
                    </button>

                    <div className="bg-black/80 dark:bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl shadow-black/40 h-16 px-2 flex justify-between items-center relative">

                        {/* Collapse Button - "Side me button" interpretation implies separate, but one nicely integrated 
                            I'll add a small 'Hide' button at the far end or strictly rely on scroll/toggle? 
                            Let's keep the FAB logic. If bar is shown, user can scroll to hide OR use a gesture?
                            User asked for button. I'll add a small "Hide" chevron at the end of the list? No space.
                            I will rely on the "Side Button" appearing when hidden. 
                            To HIDE manually, maybe a long press? Or a small button floating above?
                            Let's add a small "Floating Close" X above the nav?
                        */}
                        <button
                            onClick={() => setIsManualHidden(true)}
                            className="absolute -right-2 -top-2 bg-red-500/80 text-white rounded-full p-1 shadow-md w-6 h-6 flex items-center justify-center z-50"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        {navItems.map((item) => {
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => handleTap(item.name)}
                                    className="relative flex-1 flex flex-col items-center justify-center h-full"
                                >
                                    {/* Active Bubble Background */}
                                    {active && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute top-1 inset-x-0 mx-auto w-12 h-12 bg-white/10 rounded-2xl z-0"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}

                                    {/* Icon Container */}
                                    <div className="relative z-10 flex flex-col items-center justify-center pt-1">
                                        <div className={`relative p-1.5 rounded-full transition-all duration-300 ${active ? '-translate-y-1' : ''}`}>
                                            <item.icon
                                                className={`h-6 w-6 transition-all duration-200 ${active
                                                    ? "text-white fill-white/20"
                                                    : "text-gray-400 dark:text-gray-400 group-hover:text-white"
                                                    }`}
                                            />
                                            {/* Notification Badge */}
                                            {item.badge && item.badge > 0 && (
                                                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 text-[9px] text-white flex items-center justify-center rounded-full border-2 border-black font-bold">
                                                    {item.badge > 9 ? '9+' : item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-medium transition-all duration-200 ${active ? 'text-green-400 translate-y-0 opacity-100' : 'text-gray-500 opacity-80 translate-y-1'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}


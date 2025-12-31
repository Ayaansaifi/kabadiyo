"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"
import { Search, MessageCircle, Gift, HelpCircle } from "lucide-react"

const featuredLinks = [
    {
        name: "Find Dealer",
        href: "/market",
        icon: <Search className="h-7 w-7 text-blue-100" />,
        bgClass: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/40"
    },
    {
        name: "Chat Now",
        href: "/chat",
        icon: <MessageCircle className="h-7 w-7 text-purple-100" />,
        bgClass: "bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/40"
    },
    {
        name: "Rewards",
        href: "/rewards",
        icon: <Gift className="h-7 w-7 text-amber-100" />,
        bgClass: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/40"
    },
    {
        name: "Help Center",
        href: "/help",
        icon: <HelpCircle className="h-7 w-7 text-emerald-100" />,
        bgClass: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-teal-500/40"
    },
]
export function FeaturedIcons() {
    const { isNative, isLoading } = useIsNativePlatform()

    if (isLoading) return <div className="grid grid-cols-4 gap-3 mb-12 px-2 h-20 animate-pulse bg-muted rounded-xl" />

    return (
        <div className="grid grid-cols-4 gap-3 mb-12 px-2">
            {featuredLinks.map((link, index) => (
                <Link key={link.name} href={link.href} className="group flex flex-col items-center gap-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-16 h-16 rounded-[22px] flex items-center justify-center ${link.bgClass} shadow-xl ring-2 ring-white/20 backdrop-blur-sm relative overflow-hidden`}
                    >
                        {/* Glossy overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                        <div className="relative z-10 drop-shadow-md">
                            {link.icon}
                        </div>
                    </motion.div>
                    <span className="text-[11px] font-semibold text-foreground/80 tracking-wide text-center leading-tight">
                        {link.name}
                    </span>
                </Link>
            ))}
        </div>
    )
}

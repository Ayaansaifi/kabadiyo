"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"
import { Search, LayoutDashboard, Gift, HelpCircle } from "lucide-react"

const featuredLinks = [
    { name: "Find", href: "/market", icon: <Search className="h-6 w-6" />, color: "text-white", bgColor: "from-blue-500 to-blue-600 shadow-blue-500/30" },
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-6 w-6" />, color: "text-white", bgColor: "from-purple-500 to-purple-600 shadow-purple-500/30" },
    { name: "Rewards", href: "/rewards", icon: <Gift className="h-6 w-6" />, color: "text-white", bgColor: "from-yellow-400 to-orange-500 shadow-yellow-500/30" },
    { name: "Help", href: "/help", icon: <HelpCircle className="h-6 w-6" />, color: "text-white", bgColor: "from-green-500 to-emerald-600 shadow-green-500/30" },
]

export function FeaturedIcons() {
    const { isNative, isLoading } = useIsNativePlatform()

    if (isLoading || !isNative) return null

    return (
        <div className="grid grid-cols-4 gap-4 mb-12">
            {featuredLinks.map((link, index) => (
                <Link key={link.name} href={link.href} className="group flex flex-col items-center gap-2">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, type: "spring" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-14 h-14 rounded-[18px] flex items-center justify-center bg-gradient-to-br ${link.bgColor} ${link.color} shadow-lg ring-1 ring-white/20 backdrop-blur-md`}
                    >
                        {link.icon}
                    </motion.div>
                    <span className="text-xs font-medium text-muted-foreground">{link.name}</span>
                </Link>
            ))}
        </div>
    )
}

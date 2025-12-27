"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
    Search, LayoutDashboard, Gift, HelpCircle,
    Utensils, Phone, User, Settings, FileText, Shield
} from "lucide-react"

interface QuickLinkItem {
    name: string
    href: string
    icon: React.ReactNode
    color: string
    bgColor: string
}

const quickLinks: QuickLinkItem[] = [
    { name: "Find", href: "/market", icon: <Search className="h-6 w-6" />, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-6 w-6" />, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30" },
    { name: "Rewards", href: "/rewards", icon: <Gift className="h-6 w-6" />, color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-950/30" },
    { name: "Help", href: "/help", icon: <HelpCircle className="h-6 w-6" />, color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/30" },
    { name: "Food Rescue", href: "/food-rescue", icon: <Utensils className="h-6 w-6" />, color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
    { name: "Call Us", href: "tel:8586040076", icon: <Phone className="h-6 w-6" />, color: "text-teal-600", bgColor: "bg-teal-50 dark:bg-teal-950/30" },
    { name: "Profile", href: "/profile", icon: <User className="h-6 w-6" />, color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-950/30" },
    { name: "Settings", href: "/settings", icon: <Settings className="h-6 w-6" />, color: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-800/50" },
]

const legalLinks: QuickLinkItem[] = [
    { name: "Privacy", href: "/privacy-policy", icon: <Shield className="h-5 w-5" />, color: "text-slate-500", bgColor: "bg-slate-50 dark:bg-slate-800/50" },
    { name: "Terms", href: "/terms-of-service", icon: <FileText className="h-5 w-5" />, color: "text-slate-500", bgColor: "bg-slate-50 dark:bg-slate-800/50" },
]

// Mathematical stagger calculation using Golden Ratio
const goldenRatio = 1.618
const calculateDelay = (index: number) => (index * 0.05) / goldenRatio

export function QuickLinksGrid() {
    return (
        <div className="space-y-6">
            {/* Main Quick Links - 4x2 Grid */}
            <div className="grid grid-cols-4 gap-3">
                {quickLinks.map((link, index) => (
                    <motion.div
                        key={link.name}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            delay: calculateDelay(index),
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                        }}
                        viewport={{ once: true }}
                    >
                        <Link
                            href={link.href}
                            className="group flex flex-col items-center gap-2 p-3"
                        >
                            {/* Icon Container with Glassmorphism */}
                            <motion.div
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center
                                    ${link.bgColor} ${link.color}
                                    shadow-sm border border-white/20
                                    backdrop-blur-sm
                                    group-hover:shadow-lg group-hover:shadow-current/10
                                    transition-shadow duration-300
                                `}
                            >
                                {link.icon}
                            </motion.div>

                            {/* Label */}
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                                {link.name}
                            </span>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Legal Links - Smaller, Inline */}
            <div className="flex justify-center gap-4 pt-2">
                {legalLinks.map((link, index) => (
                    <motion.div
                        key={link.name}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <Link
                            href={link.href}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

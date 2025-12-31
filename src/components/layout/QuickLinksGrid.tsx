"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useIsNativePlatform } from "@/hooks/useNativePlatform"
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
    { name: "Rescue", href: "/food-rescue", icon: <Utensils className="h-6 w-6" />, color: "text-white", bgColor: "from-orange-500 to-red-500 shadow-orange-500/30" },
    { name: "Call Us", href: "tel:8586040076", icon: <Phone className="h-6 w-6" />, color: "text-white", bgColor: "from-teal-400 to-cyan-600 shadow-teal-500/30" },
    { name: "Profile", href: "/profile", icon: <User className="h-6 w-6" />, color: "text-white", bgColor: "from-indigo-500 to-violet-600 shadow-indigo-500/30" },
    { name: "Settings", href: "/settings", icon: <Settings className="h-6 w-6" />, color: "text-white", bgColor: "from-slate-500 to-slate-600 shadow-slate-500/30" },
]

const legalLinks: QuickLinkItem[] = [
    { name: "Privacy", href: "/privacy-policy", icon: <Shield className="h-5 w-5" />, color: "text-slate-500", bgColor: "bg-slate-50 dark:bg-slate-800/50" },
    { name: "Terms", href: "/terms-of-service", icon: <FileText className="h-5 w-5" />, color: "text-slate-500", bgColor: "bg-slate-50 dark:bg-slate-800/50" },
]

// Golden Ratio stagger
const goldenRatio = 1.618
const calculateDelay = (index: number) => (index * 0.05) / goldenRatio

// APP-ONLY Icon Grid
function AppIconGrid() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-y-7 gap-x-4 px-2">
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
                        <Link href={link.href} className="group flex flex-col items-center gap-2">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                className={`w-14 h-14 rounded-[18px] flex items-center justify-center bg-gradient-to-br ${link.bgColor} ${link.color} shadow-lg shadow-black/5 ring-1 ring-white/20 backdrop-blur-md transition-all duration-300`}
                                style={{
                                    boxShadow: `0 8px 20px -6px ${link.bgColor.replace('bg-', 'var(--')}` // Fallback or custom shadow logic if needed, but Tailwind is easier
                                }}
                            >
                                {link.icon}
                            </motion.div>
                            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                                {link.name}
                            </span>
                        </Link>
                    </motion.div>
                ))}
            </div>
            <div className="flex justify-center gap-4 pt-2">
                {legalLinks.map((link, index) => (
                    <motion.div key={link.name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 + index * 0.1 }} viewport={{ once: true }}>
                        <Link href={link.href} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            {link.icon}
                            <span>{link.name}</span>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// WEBSITE Original Text Links
function WebsiteTextLinks() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
                <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                    <li><Link href="/market" className="hover:text-primary transition-colors">Find Kabadiwala</Link></li>
                    <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                    <li><Link href="/rewards" className="hover:text-primary transition-colors">Rewards</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-foreground mb-3">Support</h4>
                <ul className="space-y-2 text-sm">
                    <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                    <li><Link href="/food-rescue" className="hover:text-primary transition-colors">Food Rescue</Link></li>
                    <li><a href="tel:8586040076" className="hover:text-primary transition-colors">Call: 8586040076</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-foreground mb-3">Account</h4>
                <ul className="space-y-2 text-sm">
                    <li><Link href="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
                    <li><Link href="/settings" className="hover:text-primary transition-colors">Settings</Link></li>
                    <li><Link href="/login" className="hover:text-primary transition-colors">Login</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-foreground mb-3">Legal</h4>
                <ul className="space-y-2 text-sm">
                    <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                    <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                </ul>
            </div>
        </div>
    )
}

// Main Component - Shows the premium Icon Grid on all platforms for the "Beautiful App" feel
export function QuickLinksGrid() {
    const { isNative, isLoading } = useIsNativePlatform()

    if (isLoading) {
        // Show skeleton while detecting platform
        return <div className="h-32 animate-pulse bg-muted/20 rounded-xl" />
    }

    // Always show the premium AppIconGrid to fulfill the user's "Beautiful App" vision
    return (
        <div className="space-y-12">
            <AppIconGrid />
            {/* Still show traditional links for SEO/Accessibility on web */}
            {!isNative && (
                <div className="pt-8 border-t border-muted/20">
                    <WebsiteTextLinks />
                </div>
            )}
        </div>
    )
}

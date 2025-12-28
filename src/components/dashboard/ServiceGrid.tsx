"use client"

import { useIsNativePlatform } from "@/hooks/useNativePlatform"
import { motion } from "framer-motion"
import {
    Armchair, Hammer, Sparkles, HelpingHand, Zap,
    DoorOpen, Cog, Wrench, Laptop, Factory, PackageOpen
} from "lucide-react"
import Link from "next/link"

const services = [
    { id: 1, name: "Furniture", icon: Armchair, color: "from-amber-400 to-orange-600", href: "/services/furniture" },
    { id: 2, name: "Welding", icon: Sparkles, color: "from-blue-400 to-blue-700", href: "/services/welding" },
    { id: 3, name: "Cleaning", icon: Sparkles, color: "from-cyan-400 to-teal-600", href: "/services/cleaning" },
    { id: 4, name: "Helper", icon: HelpingHand, color: "from-green-400 to-emerald-600", href: "/services/helper" },
    { id: 5, name: "Electrician", icon: Zap, color: "from-yellow-300 to-yellow-600", href: "/services/electrician" },
    { id: 6, name: "Steel Gate", icon: DoorOpen, color: "from-slate-400 to-slate-700", href: "/services/fabrication" },
    { id: 7, name: "Hydraulic", icon: Cog, color: "from-red-400 to-red-700", href: "/services/hydraulic" },
    { id: 8, name: "Plumber", icon: Wrench, color: "from-sky-400 to-indigo-600", href: "/services/plumber" },
]

const buyers = [
    { id: 1, name: "Bulk Laptop", icon: Laptop, color: "from-purple-500 to-indigo-600", href: "/sell/laptops" },
    { id: 2, name: "Office Scrap", icon: Factory, color: "from-stone-500 to-stone-800", href: "/sell/office-scrap" },
    { id: 3, name: "Sell Anything", icon: PackageOpen, color: "from-pink-500 to-rose-600", href: "/categories" },
]

export function ServiceGrid() {
    const { isNative, isLoading } = useIsNativePlatform()

    if (isLoading || !isNative) return null

    return (
        <div className="w-full mb-8 space-y-6">
            {/* Local Services Section */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-bold text-lg text-foreground">Local Services</h3>
                    <span className="text-xs text-muted-foreground">Verified Experts</span>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 scrollbar-hide snap-x">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex flex-col items-center min-w-[72px] snap-center"
                        >
                            <Link href={service.href} className="flex flex-col items-center gap-2 group">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} p-0.5 shadow-lg group-active:scale-95 transition-transform`}>
                                    <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-[14px] flex items-center justify-center border border-white/20">
                                        <service.icon className="h-7 w-7 text-white drop-shadow-md" />
                                    </div>
                                </div>
                                <span className="text-[11px] font-medium text-center leading-tight truncate w-full">
                                    {service.name}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Special Buyers & Sell Anything */}
            <div className="bg-gradient-to-r from-muted/50 to-muted/10 p-4 rounded-xl border border-muted/50">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-foreground">Special Buyers</h3>
                    <span className="text-xs text-primary font-medium">Best Rates</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {buyers.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                        >
                            <Link href={item.href}>
                                <div className="bg-background rounded-xl p-3 flex flex-col items-center gap-2 shadow-sm border hover:shadow-md transition-all active:scale-95">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}>
                                        <item.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xs font-semibold text-center leading-tight">
                                        {item.name}
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

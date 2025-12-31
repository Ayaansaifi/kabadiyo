"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, Info, HelpCircle, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const ECO_TIPS = [
    {
        id: 1,
        fact: "Recycling one aluminum can saves enough energy to run a TV for three hours.",
        type: "Energy",
        icon: Lightbulb,
        color: "text-amber-500",
        bg: "from-amber-500/10 to-transparent"
    },
    {
        id: 2,
        fact: "Recycling 1 ton of paper saves 17 trees and 7,000 gallons of water.",
        type: "Impact",
        icon: Info,
        color: "text-blue-500",
        bg: "from-blue-500/10 to-transparent"
    },
    {
        id: 3,
        fact: "Plastic takes up to 1,000 years to decompose in a landfill.",
        type: "Warning",
        icon: HelpCircle,
        color: "text-red-500",
        bg: "from-red-500/10 to-transparent"
    },
    {
        id: 4,
        fact: "Glass is 100% recyclable and can be recycled endlessly without loss in quality.",
        type: "Pro Tip",
        icon: CheckCircle,
        color: "text-green-500",
        bg: "from-green-500/10 to-transparent"
    },
]

export function EcoDailyTips() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % ECO_TIPS.length)
        }, 8000)
        return () => clearInterval(timer)
    }, [])

    const tip = ECO_TIPS[index]

    return (
        <div className="w-full mb-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className={`border-none bg-gradient-to-r ${tip.bg} relative overflow-hidden group`}>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`p-3 rounded-full bg-white dark:bg-card shadow-sm ${tip.color}`}>
                                <tip.icon className="h-6 w-6 animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${tip.color}`}>
                                    {tip.type}
                                </span>
                                <p className="text-sm font-medium leading-snug line-clamp-2">
                                    {tip.fact}
                                </p>
                            </div>
                            {/* Visual Eye Candy */}
                            <div className="absolute right-0 top-0 w-24 h-24 bg-current/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-1 mt-2">
                {ECO_TIPS.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-green-500' : 'w-1 bg-muted'}`}
                    />
                ))}
            </div>
        </div>
    )
}

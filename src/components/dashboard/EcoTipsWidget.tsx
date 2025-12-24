"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Lightbulb, Recycle, Zap } from "lucide-react"
import { useState, useEffect } from "react"

const TIPS = [
    { text: "Recycling one aluminum can saves enough energy to run a TV for 3 hours!", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    { text: "Glass can be recycled endlessly without losing quality.", icon: Recycle, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
    { text: "Paper can be recycled 5 to 7 times before the fibers become too short.", icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { text: "E-waste contains precious metals like gold and silver. Don't throw it in the trash!", icon: Lightbulb, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { text: "Rinsing your recyclables prevents contamination and helps the process.", icon: Leaf, color: "text-teal-500", bg: "bg-teal-100 dark:bg-teal-900/30" },
]

export function EcoTipsWidget() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % TIPS.length)
        }, 8000)
        return () => clearInterval(interval)
    }, [])

    const tip = TIPS[index]
    const Icon = tip.icon

    return (
        <Card className="border-none shadow-md overflow-hidden dark:bg-card">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Eco Fact of the Day
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`p-4 rounded-xl ${tip.bg} transition-colors duration-500`}>
                    <div className="flex gap-4">
                        <div className={`p-2 rounded-full bg-white/50 h-fit ${tip.color}`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium leading-relaxed dark:text-gray-100">
                            {tip.text}
                        </p>
                    </div>
                </div>
                <div className="flex justify-center gap-1.5 mt-4">
                    {TIPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-green-500" : "w-1.5 bg-gray-200 dark:bg-gray-700"}`}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

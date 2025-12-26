"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Package, Leaf, TrendingUp } from "lucide-react"

interface StatItemProps {
    icon: React.ReactNode
    value: number
    suffix: string
    label: string
    color: string
    delay: number
}

function StatItem({ icon, value, suffix, label, color, delay }: StatItemProps) {
    const [count, setCount] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, delay)
        return () => clearTimeout(timer)
    }, [delay])

    useEffect(() => {
        if (!isVisible) return

        const duration = 2000
        const steps = 50
        const increment = value / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setCount(value)
                clearInterval(timer)
            } else {
                setCount(Math.floor(current))
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [value, isVisible])

    return (
        <div
            className={`text-center p-6 transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
        >
            <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${color}`}>
                {icon}
            </div>
            <p className="text-3xl md:text-4xl font-black mb-1">
                {count.toLocaleString()}{suffix}
            </p>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
    )
}

export function ImpactStats() {
    return (
        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg">
            <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Our Environmental Impact
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatItem
                        icon={<Users className="h-6 w-6 text-blue-600" />}
                        value={500}
                        suffix="+"
                        label="Happy Users"
                        color="bg-blue-100 dark:bg-blue-900/30"
                        delay={0}
                    />
                    <StatItem
                        icon={<Package className="h-6 w-6 text-orange-600" />}
                        value={1200}
                        suffix="+"
                        label="Pickups Completed"
                        color="bg-orange-100 dark:bg-orange-900/30"
                        delay={200}
                    />
                    <StatItem
                        icon={<Leaf className="h-6 w-6 text-green-600" />}
                        value={85}
                        suffix=" tons"
                        label="CO₂ Saved"
                        color="bg-green-100 dark:bg-green-900/30"
                        delay={400}
                    />
                    <StatItem
                        icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
                        value={3}
                        suffix="L+"
                        label="Earnings Paid"
                        color="bg-purple-100 dark:bg-purple-900/30"
                        delay={600}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

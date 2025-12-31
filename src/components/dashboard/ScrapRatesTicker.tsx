"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, TrendingUp, IndianRupee, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface Rate {
    name: string
    rate: number
    trend: string
}

export function ScrapRatesTicker() {
    const [rates, setRates] = useState<Rate[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch("/api/rates")
                if (res.ok) {
                    const data = await res.json()
                    setRates(data.rates.map((r: any) => ({
                        name: r.name,
                        rate: r.rate,
                        trend: r.trend || 'neutral'
                    })))
                }
            } catch (error) {
                console.error("Failed to fetch rates:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchRates()

        // Refresh every 5 minutes
        const interval = setInterval(fetchRates, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    if (loading && rates.length === 0) {
        return (
            <Card className="border-none shadow-md bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
                <CardContent className="p-0 flex items-center h-14 justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-slate-400">Loading Live Rates...</span>
                </CardContent>
            </Card>
        )
    }

    const tickerRates = [...rates, ...rates] // Double for seamless loop

    return (
        <Card className="border-none shadow-md bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
            <CardContent className="p-0 relative flex items-center h-14">
                <div className="bg-primary/20 h-full px-4 flex items-center z-10 backdrop-blur-sm border-r border-white/10">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    <span className="font-bold text-sm whitespace-nowrap">Live Rates</span>
                </div>

                <div className="flex-1 overflow-hidden relative flex items-center">
                    <motion.div
                        className="flex gap-8 px-4 whitespace-nowrap"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: rates.length * 3 // Adjust speed based on item count
                        }}
                    >
                        {tickerRates.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-300">{item.name}</span>
                                <span className="text-sm font-bold flex items-center">
                                    <IndianRupee className="h-3 w-3" />{item.rate}
                                </span>
                                <span className={`text-xs flex items-center ${item.trend === 'up' ? 'text-green-400' :
                                        item.trend === 'down' ? 'text-red-400' : 'text-slate-500'
                                    }`}>
                                    {item.trend === 'up' && <ArrowUp className="h-3 w-3 mr-0.5" />}
                                    {item.trend === 'down' && <ArrowDown className="h-3 w-3 mr-0.5" />}
                                    {item.trend !== 'neutral' && "2.5%"}
                                    {item.trend === 'neutral' && "Stable"}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    )
}

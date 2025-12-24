"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, TrendingUp, IndianRupee } from "lucide-react"
import { motion } from "framer-motion"

// Real-time market rates - Delhi, December 2025
// Sources: delhikabadiwala.com, scrapuncle.com, kabadiwalaonline.com
const RATES = [
    { name: "Iron", price: 31, change: 2.1, trend: "up" },
    { name: "Copper", price: 580, change: 3.5, trend: "up" },
    { name: "Brass", price: 350, change: 1.8, trend: "up" },
    { name: "Aluminium", price: 105, change: -1.2, trend: "down" },
    { name: "Newspaper", price: 14, change: -2.5, trend: "down" },
    { name: "Plastic", price: 12, change: 0, trend: "neutral" },
    { name: "Cardboard", price: 9, change: 0.5, trend: "up" },
    { name: "E-Waste", price: 45, change: 1.0, trend: "up" },
    { name: "Steel", price: 28, change: 0.8, trend: "up" },
    { name: "Books", price: 12, change: 0, trend: "neutral" },
    { name: "Bottles (Glass)", price: 2, change: 0, trend: "neutral" },
    { name: "PET Bottles", price: 8, change: 0.5, trend: "up" },
]

export function ScrapRatesTicker() {
    return (
        <Card className="border-none shadow-md bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
            <CardContent className="p-0 relative flex items-center h-14">
                <div className="bg-primary/20 h-full px-4 flex items-center z-10 backdrop-blur-sm border-r border-white/10">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    <span className="font-bold text-sm whitespace-nowrap">Daily Rates</span>
                </div>

                <div className="flex-1 overflow-hidden relative flex items-center">
                    <motion.div
                        className="flex gap-8 px-4 whitespace-nowrap"
                        animate={{ x: ["0%", "-100%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 20
                        }}
                    >
                        {[...RATES, ...RATES].map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-300">{item.name}</span>
                                <span className="text-sm font-bold flex items-center">
                                    <IndianRupee className="h-3 w-3" />{item.price}
                                </span>
                                <span className={`text-xs flex items-center ${item.trend === 'up' ? 'text-green-400' :
                                    item.trend === 'down' ? 'text-red-400' : 'text-slate-500'
                                    }`}>
                                    {item.trend === 'up' && <ArrowUp className="h-3 w-3 mr-0.5" />}
                                    {item.trend === 'down' && <ArrowDown className="h-3 w-3 mr-0.5" />}
                                    {Math.abs(item.change)}%
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    )
}

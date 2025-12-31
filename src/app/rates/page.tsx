"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Search, ArrowLeft, TrendingUp, TrendingDown,
    Minus, Loader2, Info, ChevronRight
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

interface ScrapRate {
    id: string
    name: string
    category: string
    rate: number
    unit: string
    trend: 'up' | 'down' | 'stable'
}

export default function RatesPage() {
    const [rates, setRates] = useState<ScrapRate[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState("All")

    useEffect(() => {
        fetchRates()
    }, [])

    async function fetchRates() {
        try {
            const res = await fetch("/api/rates")
            const data = await res.json()
            setRates(data.rates || [])
        } catch (error) {
            console.error("Failed to fetch rates:", error)
        } finally {
            setLoading(false)
        }
    }

    const categories = ["All", ...Array.from(new Set(rates.map(r => r.category)))]

    const filteredRates = rates.filter(rate => {
        const matchesSearch = rate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rate.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = activeCategory === "All" || rate.category === activeCategory
        return matchesSearch && matchesCategory
    })

    function getTrendIcon(trend: string) {
        switch (trend) {
            case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
            case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
            default: return <Minus className="h-4 w-4 text-muted-foreground" />
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header */}
            <div className="bg-background border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 max-w-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold">Scrap Rates</h1>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search materials (e.g. Iron, Paper)..."
                            className="pl-10 bg-muted/50 border-0 focus-visible:ring-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories Tab */}
                <div className="container mx-auto px-4 pb-2 max-w-2xl overflow-x-auto flex gap-2 no-scrollbar">
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={activeCategory === cat ? "default" : "ghost"}
                            size="sm"
                            className="rounded-full whitespace-nowrap"
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            <main className="container mx-auto px-4 py-6 max-w-2xl pb-24">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Updating latest rates...</p>
                    </div>
                ) : filteredRates.length === 0 ? (
                    <div className="text-center py-20">
                        <Info className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">No rates found for "{searchQuery}"</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredRates.map((rate, index) => (
                            <motion.div
                                key={rate.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-default">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                {rate.name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{rate.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">{rate.category}</span>
                                                    <span className="flex items-center gap-1">
                                                        {getTrendIcon(rate.trend)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-primary">₹{rate.rate}/{rate.unit}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Live Rate</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <h4 className="font-bold flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-primary" /> Did you know?
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Rates are updated daily based on market conditions. For bulk quantities,
                        you might get even better pricing. Contact your local Kabadiwala for
                        special quotations on heavy items.
                    </p>
                    <Link href="/sell">
                        <Button className="w-full mt-4 group">
                            Book a Pickup Now
                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Star, Medal, Target, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Badge {
    id: string
    name: string
    description: string
    threshold: number
    icon: any
    color: string
}

const BADGES: Badge[] = [
    { id: "bronze", name: "Green Scout", description: "Recycle 10kg", threshold: 10, icon: Medal, color: "text-orange-400" },
    { id: "silver", name: "Recycle Hero", description: "Recycle 50kg", threshold: 50, icon: Star, color: "text-slate-400" },
    { id: "gold", name: "Eco Guardian", description: "Recycle 100kg", threshold: 100, icon: Trophy, color: "text-yellow-400" },
]

export function UserGamification({ totalWeight = 0 }: { totalWeight: number }) {
    const currentBadge = BADGES.reduce((prev, curr) =>
        totalWeight >= curr.threshold ? curr : prev, BADGES[0])

    const nextBadge = BADGES.find(b => totalWeight < b.threshold) || null
    const progress = nextBadge
        ? ((totalWeight / nextBadge.threshold) * 100)
        : 100

    return (
        <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl font-black">
                            <Target className="h-5 w-5 text-indigo-500" />
                            Eco Level Up
                        </CardTitle>
                        <CardDescription>Your recycling journey level</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Badge Display */}
                <div className="flex items-center gap-4 bg-white/50 dark:bg-card/50 p-4 rounded-2xl border border-indigo-500/10">
                    <motion.div
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className={`p-3 rounded-full bg-gradient-to-br from-white to-indigo-50 dark:from-indigo-900/30 dark:to-background shadow-inner`}
                    >
                        <currentBadge.icon className={`h-10 w-10 ${currentBadge.color}`} />
                    </motion.div>
                    <div>
                        <h3 className="font-black text-lg">{currentBadge.name}</h3>
                        <p className="text-xs text-muted-foreground">{currentBadge.description}</p>
                    </div>
                    {totalWeight > 0 && (
                        <div className="ml-auto text-right">
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{totalWeight}</span>
                            <span className="text-[10px] font-bold text-muted-foreground block uppercase">KG Total</span>
                        </div>
                    )}
                </div>

                {/* Progress to Next Level */}
                {nextBadge ? (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted-foreground uppercase tracking-widest">Next Achievement</span>
                            <span className="text-indigo-600">{Math.round(nextBadge.threshold - totalWeight)}kg to go</span>
                        </div>
                        <div className="relative pt-1">
                            <Progress value={progress} className="h-3 bg-indigo-100 dark:bg-indigo-900/20" />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="absolute top-1 left-0 h-3"
                            />
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground italic">
                            Unlock <span className="font-bold text-indigo-500">{nextBadge.name}</span> by reaching {nextBadge.threshold}kg
                        </p>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2 fill-current" />
                        <h4 className="font-black text-yellow-700">LEGENDARY ECO GUARDIAN</h4>
                        <p className="text-xs text-muted-foreground">You have reached the highest level of recycling!</p>
                    </div>
                )}

                {/* Engagement Stat */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/40 dark:bg-card/30 rounded-xl flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <div className="text-[10px]">
                            <span className="block font-bold">Active Streak</span>
                            <span className="text-muted-foreground">12 Days</span>
                        </div>
                    </div>
                    <div className="p-3 bg-white/40 dark:bg-card/30 rounded-xl flex items-center gap-3">
                        <Star className="h-4 w-4 text-amber-500" />
                        <div className="text-[10px]">
                            <span className="block font-bold">Global Rank</span>
                            <span className="text-muted-foreground">Top 15%</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

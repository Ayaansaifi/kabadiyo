"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Leaf, Gift, Trophy, ArrowRight } from "lucide-react"
import Link from "next/link"

interface GreenWalletCardProps {
    points: number
}

export function GreenWalletCard({ points }: GreenWalletCardProps) {
    const GOAL = 20000
    const progress = Math.min((points / GOAL) * 100, 100)

    return (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Leaf className="h-5 w-5 fill-current" />
                    Green Wallet
                </CardTitle>
                <Link href="/leaderboard">
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-100">
                        <Trophy className="h-4 w-4 mr-1" /> Leaderboard
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-extrabold text-green-800 dark:text-green-300">{points.toLocaleString()}</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-500">Green Points</span>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Progress to Grand Reward</span>
                        <span className="text-green-600">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5 bg-green-200 dark:bg-green-900" />
                    <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-muted-foreground">Goal: {GOAL.toLocaleString()} pts</span>
                        <Link href="/rewards">
                            <span className="flex items-center text-green-700 hover:underline cursor-pointer">
                                Redeem Service
                                <ArrowRight className="h-3 w-3 ml-1" />
                            </span>
                        </Link>
                    </div>
                </div>

                {points >= GOAL && (
                    <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center gap-3 border border-green-200 dark:border-green-800 animate-pulse">
                        <Gift className="h-5 w-5 text-green-600" />
                        <div>
                            <p className="text-sm font-bold text-green-800 dark:text-green-300">Reward Unlocked!</p>
                            <p className="text-xs text-green-700 dark:text-green-400">Claim your ₹5,000 Home Service now.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

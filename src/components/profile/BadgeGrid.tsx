"use client"

import { Card } from "@/components/ui/card"
import { Lock, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface Badge {
    id: number
    name: string
    description: string
    icon: React.ReactNode
    unlocked: boolean
    progress?: number
}

interface BadgeGridProps {
    badges: Badge[]
}

export function BadgeGrid({ badges }: BadgeGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
                <div
                    key={badge.id}
                    className={cn(
                        "relative flex flex-col items-center p-4 rounded-xl border border-dashed transition-all",
                        badge.unlocked
                            ? "bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800"
                            : "bg-muted/30 border-muted"
                    )}
                >
                    <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center mb-3",
                        badge.unlocked
                            ? "bg-white dark:bg-gray-800 shadow-sm"
                            : "bg-gray-200 dark:bg-gray-700 opacity-50"
                    )}>
                        {badge.unlocked ? badge.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
                    </div>

                    <h4 className={cn("font-medium text-sm text-center", !badge.unlocked && "text-muted-foreground")}>
                        {badge.name}
                    </h4>

                    <p className="text-[10px] text-muted-foreground text-center mt-1 leading-tight">
                        {badge.description}
                    </p>

                    {badge.unlocked && (
                        <div className="absolute top-2 right-2">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

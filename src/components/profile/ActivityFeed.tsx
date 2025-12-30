"use client"

import { Clock, Truck, Star, Coins } from "lucide-react"
import { cn } from "@/lib/utils"

interface Activity {
    id: string
    type: 'pickup' | 'points' | 'review' | 'referral'
    title: string
    description: string
    date: Date
    points?: number
}

interface ActivityFeedProps {
    activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const icons = {
        pickup: <Truck className="h-4 w-4" />,
        points: <Coins className="h-4 w-4" />,
        review: <Star className="h-4 w-4" />,
        referral: <div className="text-xs font-bold">Ref</div>
    }

    const colors = {
        pickup: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        points: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
        review: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        referral: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
    }

    return (
        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-px before:bg-border">
            {activities.length > 0 ? (
                activities.map((activity) => (
                    <div key={activity.id} className="relative pl-12">
                        {/* Timeline Dot */}
                        <div className={cn(
                            "absolute left-2 top-0 h-9 w-9 rounded-full flex items-center justify-center border-4 border-background",
                            colors[activity.type]
                        )}>
                            {icons[activity.type]}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <div>
                                <h4 className="font-medium text-sm">{activity.title}</h4>
                                <p className="text-xs text-muted-foreground">{activity.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {activity.points && (
                                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/10 px-2 py-0.5 rounded-full">
                                        +{activity.points} pts
                                    </span>
                                )}
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(activity.date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 text-muted-foreground text-sm pl-8">
                    No recent activity
                </div>
            )}
        </div>
    )
}

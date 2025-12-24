"use client"

import { Check, Clock, Package, MapPin } from "lucide-react"

interface OrderTimelineProps {
    status: string
    createdAt: string
    pickupDate: string | null
}

const STEPS = [
    { id: "REQUESTED", label: "Requested", icon: Clock },
    { id: "ACCEPTED", label: "Accepted", icon: Package },
    { id: "COMPLETED", label: "Completed", icon: Check },
]

export function OrderTimeline({ status, createdAt, pickupDate }: OrderTimelineProps) {
    // Determine current step index
    let currentStepIndex = STEPS.findIndex(s => s.id === status)
    const isCancelled = status === "CANCELLED"

    if (isCancelled) {
        return (
            <div className="w-full py-4 px-2">
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Order Cancelled</p>
                        <p className="text-xs opacity-80">This order has been cancelled.</p>
                    </div>
                </div>
            </div>
        )
    }

    // Default to 0 if status not found (safe fallback)
    if (currentStepIndex === -1 && !isCancelled) currentStepIndex = 0

    return (
        <div className="w-full py-4">
            <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2" />
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const Icon = step.icon

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white dark:bg-card px-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isCompleted
                                        ? "bg-primary border-primary text-white"
                                        : "bg-white border-gray-300 text-gray-300"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                            <span className={`text-xs mt-2 font-medium ${isCompleted ? "text-primary" : "text-gray-400"
                                }`}>
                                {step.label}
                            </span>
                            {isCurrent && index === 0 && (
                                <span className="text-[10px] text-muted-foreground mt-0.5">
                                    {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            )}
                            {isCurrent && index === 1 && pickupDate && (
                                <span className="text-[10px] text-muted-foreground mt-0.5">
                                    {new Date(pickupDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

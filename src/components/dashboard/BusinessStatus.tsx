"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Power, Circle } from "lucide-react"

interface BusinessStatusProps {
    isAvailable: boolean
}

export function BusinessStatus({ isAvailable: initialStatus }: BusinessStatusProps) {
    const [isAvailable, setIsAvailable] = useState(initialStatus)
    const [loading, setLoading] = useState(false)

    const toggleStatus = async (checked: boolean) => {
        setIsAvailable(checked)
        setLoading(true)
        try {
            const res = await fetch("/api/kabadiwala/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isAvailable: checked })
            })

            if (res.ok) {
                toast.success(checked ? "You are now Online" : "You are now Offline")
            } else {
                toast.error("Failed to update status")
                setIsAvailable(!checked) // Revert
            }
        } catch {
            toast.error("Network error")
            setIsAvailable(!checked) // Revert
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-4 bg-white dark:bg-card p-2 pr-4 rounded-full border shadow-sm">
            <div className={`p-2 rounded-full ${isAvailable ? "bg-green-100 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800"}`}>
                <Power className={`h-4 w-4 ${isAvailable ? "text-green-600" : "text-gray-500"}`} />
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                <span className={`text-sm font-bold flex items-center gap-1.5 ${isAvailable ? "text-green-600" : "text-gray-500"}`}>
                    <Circle className={`h-2 w-2 fill-current ${isAvailable ? "animate-pulse" : ""}`} />
                    {isAvailable ? "Online" : "Offline"}
                </span>
            </div>
            <Switch
                checked={isAvailable}
                onCheckedChange={toggleStatus}
                disabled={loading}
                className="ml-2 data-[state=checked]:bg-green-600"
            />
        </div>
    )
}

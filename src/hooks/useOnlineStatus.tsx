"use client"

import { useState, useEffect } from "react"

interface OnlineStatus {
    isOnline: boolean
    lastSeen: string | null
}

export function useOnlineStatus(userId: string | null) {
    const [status, setStatus] = useState<OnlineStatus>({
        isOnline: false,
        lastSeen: null
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/user/status?userId=${userId}`)
                if (res.ok) {
                    const data = await res.json()
                    setStatus({
                        isOnline: data.isOnline || false,
                        lastSeen: data.lastSeen || null
                    })
                }
            } catch {
                // Silent fail
            } finally {
                setLoading(false)
            }
        }

        fetchStatus()

        // Poll every 30 seconds
        const interval = setInterval(fetchStatus, 30000)

        return () => clearInterval(interval)
    }, [userId])

    // Format last seen
    const getLastSeenText = () => {
        if (status.isOnline) return "Online"
        if (!status.lastSeen) return "Offline"

        const lastSeenDate = new Date(status.lastSeen)
        const now = new Date()
        const diffMs = now.getTime() - lastSeenDate.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return lastSeenDate.toLocaleDateString()
    }

    return {
        ...status,
        loading,
        lastSeenText: getLastSeenText()
    }
}

// Online Status Dot Component
export function OnlineStatusDot({
    isOnline,
    size = "md"
}: {
    isOnline: boolean
    size?: "sm" | "md" | "lg"
}) {
    const sizeClasses = {
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4"
    }

    return (
        <span
            className= {`
                ${sizeClasses[size]}
                rounded-full
                ${isOnline
                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                : "bg-gray-400"
            }
                transition-colors duration-300
            `}
        />
    )
}

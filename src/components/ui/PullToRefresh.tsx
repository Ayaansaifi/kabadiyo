"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimation, PanInfo } from "framer-motion"
import { RefreshCw } from "lucide-react"

interface PullToRefreshProps {
    onRefresh: () => Promise<void>
    children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    const controls = useAnimation()
    const containerRef = useRef<HTMLDivElement>(null)

    const PULL_THRESHOLD = 80 // Distances in pixels

    async function handleDragEnd(event: any, info: PanInfo) {
        if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
            setIsRefreshing(true)
            await onRefresh()
            setIsRefreshing(false)
        }

        setPullDistance(0)
        controls.start({ y: 0 })
    }

    function handleDrag(event: any, info: PanInfo) {
        if (isRefreshing) return

        // Only allow pulling down when at the top of the page
        const scrollPos = window.scrollY
        if (scrollPos <= 0 && info.offset.y > 0) {
            const distance = Math.min(info.offset.y * 0.4, 120) // resistance
            setPullDistance(distance)
            controls.set({ y: distance })
        }
    }

    return (
        <div ref={containerRef} className="relative overflow-hidden touch-pan-y">
            {/* Refresh Indicator */}
            <motion.div
                className="absolute top-0 left-0 right-0 flex justify-center pt-4 z-50 pointer-events-none"
                style={{ opacity: pullDistance / PULL_THRESHOLD }}
                animate={isRefreshing ? { rotate: 360 } : { rotate: (pullDistance / PULL_THRESHOLD) * 180 }}
                transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "spring", stiffness: 300 }}
            >
                <div className="bg-white dark:bg-card p-3 rounded-full shadow-lg border border-primary/20 text-primary">
                    <RefreshCw className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                </div>
            </motion.div>

            {/* Content Container */}
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="relative z-10 bg-background"
            >
                {children}
            </motion.div>
        </div>
    )
}

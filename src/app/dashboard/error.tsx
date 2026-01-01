"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home } from "lucide-react"
import Link from "next/link"

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Dashboard Error:", error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
                Something went wrong
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
                We encountered an error while loading the dashboard. Please try refreshing or return home.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="outline">
                    Try Again
                </Button>
                <Link href="/">
                    <Button>
                        <Home className="h-4 w-4 mr-2" />
                        Go Home
                    </Button>
                </Link>
            </div>
            <div className="mt-8 p-4 bg-muted rounded-lg text-xs font-mono text-left max-w-xs overflow-auto">
                <p>Error Code: {error.digest || 'UNKNOWN'}</p>
                <p className="mt-1">{error.message.substring(0, 100)}</p>
            </div>
        </div>
    )
}

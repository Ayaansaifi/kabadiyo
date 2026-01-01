import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium animate-pulse">
                Loading secure dashboard...
            </p>
        </div>
    )
}

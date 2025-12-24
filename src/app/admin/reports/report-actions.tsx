"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface ReportActionsProps {
    reportId: string
}

export function ReportActions({ reportId }: ReportActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleAction(action: "dismiss" | "delete_message") {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
                credentials: "include"
            })

            if (!res.ok) throw new Error("Failed to resolve report")

            toast.success(action === "dismiss" ? "Report dismissed" : "Message deleted")
            router.refresh()
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
    }

    return (
        <div className="flex justify-end gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction("dismiss")}
                        >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Dismiss Report (Keep Message)</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction("delete_message")}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete Message & Resolve</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

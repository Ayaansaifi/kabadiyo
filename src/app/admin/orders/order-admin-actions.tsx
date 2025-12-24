"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ShieldAlert, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function OrderAdminActions({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function forceStatus(status: string) {
        if (!confirm(`Force status to ${status}? This bypasses normal checks.`)) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/force-update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            })
            if (!res.ok) throw new Error("Failed")
            toast.success(`Order forced to ${status}`)
            router.refresh()
        } catch {
            toast.error("Error updating order")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Override</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => forceStatus("REQUESTED")}>
                    Force Requested
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => forceStatus("ACCEPTED")}>
                    Force Accepted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => forceStatus("COMPLETED")} className="text-green-600">
                    <ShieldAlert className="mr-2 h-4 w-4" /> Force Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => forceStatus("CANCELLED")} className="text-red-600">
                    <ShieldAlert className="mr-2 h-4 w-4" /> Force Cancelled
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

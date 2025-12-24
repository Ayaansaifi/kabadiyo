"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface KabadiwalaActionsProps {
    profileId: string
    isVerified: boolean
}

export function KabadiwalaActions({ profileId, isVerified }: KabadiwalaActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function toggleVerification() {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/kabadiwalas/${profileId}/verify`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVerified: !isVerified }),
                credentials: "include"
            })

            if (!res.ok) throw new Error("Failed to update status")

            toast.success(isVerified ? "Verification revoked" : "Profile verified successfully")
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

    if (isVerified) {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleVerification}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
                <X className="h-4 w-4 mr-2" /> Revoke
            </Button>
        )
    }

    return (
        <Button
            size="sm"
            onClick={toggleVerification}
            className="bg-green-600 hover:bg-green-700"
        >
            <Check className="h-4 w-4 mr-2" /> Approve
        </Button>
    )
}

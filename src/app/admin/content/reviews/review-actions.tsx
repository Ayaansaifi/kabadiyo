"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ReviewActions({ reviewId }: { reviewId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function deleteReview() {
        if (!confirm("Delete this review?")) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/content/reviews/${reviewId}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error("Failed")
            toast.success("Review deleted")
            router.refresh()
        } catch {
            toast.error("Error deleting review")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={deleteReview}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    )
}

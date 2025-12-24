"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function StoryActions({ storyId }: { storyId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function deleteStory() {
        if (!confirm("Delete this story?")) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/content/stories/${storyId}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error("Failed")
            toast.success("Story deleted")
            router.refresh()
        } catch {
            toast.error("Error deleting story")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
            onClick={deleteStory}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    )
}

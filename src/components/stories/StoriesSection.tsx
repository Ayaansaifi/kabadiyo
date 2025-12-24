/**
 * Stories Section Component
 * -------------------------
 * Card wrapper for StoriesBar on the homepage.
 * Fetches current user from cookies (legacy auth) and passes to StoriesBar.
 */
import { cookies } from "next/headers"
import { StoriesBar } from "./StoriesBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getCurrentUserId() {
    const cookieStore = await cookies()
    return cookieStore.get("userId")?.value || undefined
}

export async function StoriesSection() {
    // Get user from legacy cookies
    const userId = await getCurrentUserId()

    return (
        <Card className="border-0 shadow-md bg-gradient-to-r from-background via-accent/20 to-background">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">📖</span>
                    Stories
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <StoriesBar currentUserId={userId} />
            </CardContent>
        </Card>
    )
}

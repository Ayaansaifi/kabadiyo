import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

// POST: Subscribe to push notifications
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const subscription = await request.json()

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: "Invalid subscription" }, { status: 400 })
        }

        // Save subscription
        await db.pushSubscription.create({
            data: {
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Subscription error:", error)
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
    }
}

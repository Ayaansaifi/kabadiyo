// @ts-expect-error - web-push types not available
import webpush from "web-push"
import { db } from "@/lib/db"

// VAPID Keys (In production, these should be in environment variables)
const publicVapidKey = "BLg3b2y5kE4lqNP-jAgFyZtpdo5Bqt7Uoci1CXPKu23gjZDamvuG4lvREaU70guniiqxb6v0Cy6y0DQTSy62khs"
const privateVapidKey = "2izF6mkjdNaxvG_xMlkXvdKuzUo3rFW6M0uMYgHrh1Y"

webpush.setVapidDetails(
    "mailto:support@kabadiwala.app",
    publicVapidKey,
    privateVapidKey
)

export const VAPID_PUBLIC_KEY = publicVapidKey

export async function sendNotification(userId: string, title: string, body: string, url: string = "/") {
    try {
        const subscriptions = await db.pushSubscription.findMany({
            where: { userId }
        })

        if (subscriptions.length === 0) return

        const payload = JSON.stringify({
            title,
            body,
            url,
            icon: "/icons/icon-192x192.png"
        })

        const promises = subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                }, payload)
            } catch (error: unknown) {
                const pushError = error as { statusCode?: number }
                if (pushError.statusCode === 410 || pushError.statusCode === 404) {
                    // Subscription expired or invalid, delete it
                    await db.pushSubscription.delete({
                        where: { id: sub.id }
                    })
                }
                console.error("Error sending push:", error)
            }
        })

        await Promise.all(promises)
    } catch (error) {
        console.error("Failed to send notification:", error)
    }
}


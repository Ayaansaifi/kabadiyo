import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get last 7 days data
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const [orders, users] = await Promise.all([
            db.order.findMany({
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { createdAt: true, totalAmount: true }
            }),
            db.user.findMany({
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { createdAt: true }
            })
        ])

        // Process data for charts
        const revenueMap = new Map<string, number>()
        const userMap = new Map<string, number>()

        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            revenueMap.set(dateStr, 0)
            userMap.set(dateStr, 0)
        }

        orders.forEach(order => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            if (revenueMap.has(dateStr)) {
                revenueMap.set(dateStr, (revenueMap.get(dateStr) || 0) + (order.totalAmount || 0))
            }
        })

        users.forEach(user => {
            const dateStr = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            if (userMap.has(dateStr)) {
                userMap.set(dateStr, (userMap.get(dateStr) || 0) + 1)
            }
        })

        // Convert maps to arrays and reverse to show oldest first
        const revenueData = Array.from(revenueMap.entries())
            .map(([date, amount]) => ({ date, amount }))
            .reverse()

        const userData = Array.from(userMap.entries())
            .map(([date, count]) => ({ date, count }))
            .reverse()

        return NextResponse.json({ revenueData, userData })
    } catch (error) {
        console.error("Analytics Error:", error)
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }
}

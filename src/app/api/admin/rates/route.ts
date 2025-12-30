import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// POST: Update or create scrap rates (Admin only)
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        // Verify admin (simple check - can be enhanced)
        const user = await db.user.findUnique({
            where: { id: userId || "" },
            select: { role: true }
        })

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 })
        }

        const { rates } = await request.json()

        if (!Array.isArray(rates)) {
            return NextResponse.json({ error: "Invalid rates format" }, { status: 400 })
        }

        // Upsert each rate
        const results = await Promise.all(
            rates.map((rate: any) =>
                db.scrapRate.upsert({
                    where: { name: rate.name },
                    create: {
                        name: rate.name,
                        category: rate.category,
                        rate: rate.rate,
                        unit: rate.unit || "kg",
                        trend: rate.trend || "stable",
                        isActive: true
                    },
                    update: {
                        rate: rate.rate,
                        trend: rate.trend || "stable",
                        category: rate.category,
                        unit: rate.unit || "kg"
                    }
                })
            )
        )

        return NextResponse.json({
            success: true,
            updated: results.length,
            message: `Updated ${results.length} rates`
        })
    } catch (error) {
        console.error("Update rates error:", error)
        return NextResponse.json({ error: "Failed to update rates" }, { status: 500 })
    }
}

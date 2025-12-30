import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// GET: Get user points balance
export async function GET() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: { points: true, name: true }
        })

        return NextResponse.json({
            points: user?.points || 0,
            name: user?.name,
            canRedeem: (user?.points || 0) >= 100000, // 1 lakh points for ₹2000 service
            redeemValue: 2000
        })
    } catch (error) {
        console.error("Get points error:", error)
        return NextResponse.json({ error: "Failed to get points" }, { status: 500 })
    }
}

// POST: Add points (internal use for actions like referral, pickup, login)
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { amount, reason } = await request.json()

        if (!amount || typeof amount !== "number") {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
        }

        // Update user points
        const user = await db.user.update({
            where: { id: userId },
            data: { points: { increment: amount } },
            select: { points: true }
        })

        return NextResponse.json({
            success: true,
            newBalance: user.points,
            added: amount,
            reason
        })
    } catch (error) {
        console.error("Add points error:", error)
        return NextResponse.json({ error: "Failed to add points" }, { status: 500 })
    }
}

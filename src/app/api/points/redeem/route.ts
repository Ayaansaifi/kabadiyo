import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

const REDEEM_THRESHOLD = 100000 // 1 lakh points
const REDEEM_VALUE = 2000 // ₹2000 worth of service

// POST: Redeem points for a reward
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { rewardId, service } = await request.json()

        // Get user's current points
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { points: true, name: true, phone: true }
        })

        if (!user || user.points < REDEEM_THRESHOLD) {
            return NextResponse.json({
                error: `Need ${REDEEM_THRESHOLD.toLocaleString()} points to redeem. You have ${user?.points?.toLocaleString() || 0}.`
            }, { status: 400 })
        }

        // Deduct points
        await db.user.update({
            where: { id: userId },
            data: { points: { decrement: REDEEM_THRESHOLD } }
        })

        // Create redemption record
        let redemption
        if (rewardId) {
            redemption = await db.redemption.create({
                data: {
                    userId,
                    rewardId,
                    status: "PENDING"
                }
            })
        }

        return NextResponse.json({
            success: true,
            message: `Congratulations! You've redeemed ₹${REDEEM_VALUE} worth of ${service || "local service"}!`,
            redemptionId: redemption?.id,
            remainingPoints: user.points - REDEEM_THRESHOLD,
            userDetails: {
                name: user.name,
                phone: user.phone
            }
        })
    } catch (error) {
        console.error("Redeem error:", error)
        return NextResponse.json({ error: "Failed to redeem points" }, { status: 500 })
    }
}

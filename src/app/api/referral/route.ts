import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { nanoid } from "nanoid"

// GET: Get user's referral code and stats
export async function GET() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, phone: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Generate referral code from user ID (simplified)
        const referralCode = `KBD${user.id.slice(-6).toUpperCase()}`

        // Get referral stats (users who signed up with this code)
        // For now, return placeholder - can be enhanced with ReferralHistory model
        const referralStats = {
            totalReferrals: 0,
            successfulReferrals: 0,
            pendingReferrals: 0,
            pointsEarned: 0
        }

        return NextResponse.json({
            referralCode,
            shareUrl: `https://kabadiyo.com/register?ref=${referralCode}`,
            shareText: `Join Kabadiyo and sell scrap easily! Use my code ${referralCode} to get 500 bonus points. Download: https://kabadiyo.com`,
            stats: referralStats,
            rewards: {
                perReferral: 2000, // Points per successful referral
                minThreshold: 100000, // Points needed to redeem
                redeemValue: 2000 // ₹ value when redeemed
            }
        })
    } catch (error) {
        console.error("Get referral error:", error)
        return NextResponse.json({ error: "Failed to get referral info" }, { status: 500 })
    }
}

// POST: Apply referral code (for new users during signup)
export async function POST(request: NextRequest) {
    try {
        const { referralCode, newUserId } = await request.json()

        if (!referralCode || !newUserId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Find referrer by code (extract userId from code)
        const referrerId = referralCode.replace("KBD", "").toLowerCase()

        // Award points to referrer
        const referrer = await db.user.findFirst({
            where: { id: { endsWith: referrerId } }
        })

        if (!referrer) {
            return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
        }

        // Award 2000 points to referrer
        await db.user.update({
            where: { id: referrer.id },
            data: { points: { increment: 2000 } }
        })

        // Award 500 points to new user
        await db.user.update({
            where: { id: newUserId },
            data: { points: { increment: 500 } }
        })

        return NextResponse.json({
            success: true,
            message: "Referral applied! Both users received bonus points.",
            referrerBonus: 2000,
            newUserBonus: 500
        })
    } catch (error) {
        console.error("Apply referral error:", error)
        return NextResponse.json({ error: "Failed to apply referral" }, { status: 500 })
    }
}

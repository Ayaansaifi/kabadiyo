"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getUserPoints(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { points: true }
    })
    return user?.points || 0
}

export async function getRewards() {
    return await db.reward.findMany({
        where: { isActive: true },
        orderBy: { cost: 'asc' }
    })
}

export async function awardPoints(userId: string, reason: "ORDER_COMPLETED" | "Referral" | "Signup") {
    let pointsToAdd = 0

    if (reason === "ORDER_COMPLETED") {
        pointsToAdd = 100
    } else if (reason === "Referral") {
        pointsToAdd = 50
    }

    if (pointsToAdd === 0) return

    await db.user.update({
        where: { id: userId },
        data: {
            points: { increment: pointsToAdd }
        }
    })

    revalidatePath("/dashboard")
    revalidatePath("/rewards")
}

export async function redeemReward(userId: string, rewardId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { points: true }
    })

    const reward = await db.reward.findUnique({
        where: { id: rewardId }
    })

    if (!user || !reward) {
        return { success: false, error: "User or Reward not found" }
    }

    if (user.points < reward.cost) {
        return { success: false, error: "Insufficient points" }
    }

    // Transaction: Deduct points and create redemption request
    await db.$transaction([
        db.user.update({
            where: { id: userId },
            data: { points: { decrement: reward.cost } }
        }),
        db.redemption.create({
            data: {
                userId,
                rewardId,
                status: "PENDING"
            }
        })
    ])

    revalidatePath("/dashboard")
    revalidatePath("/rewards")
    return { success: true, message: "Reward Redeemed! Admin will contact you." }
}

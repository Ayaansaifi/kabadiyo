import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// Profanity filter (basic)
const badWords = ["abuse", "spam", "fraud", "cheat", "scam"]
function filterProfanity(text: string): string {
    let filtered = text
    badWords.forEach(word => {
        const regex = new RegExp(word, "gi")
        filtered = filtered.replace(regex, "***")
    })
    return filtered
}

// GET: Get order for review
export async function GET(
    req: Request,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value
        const { orderId } = await context.params

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const order = await db.order.findUnique({
            where: { id: orderId },
            include: {
                buyer: {
                    select: {
                        name: true,
                        kabadiwalaProfile: {
                            select: { businessName: true }
                        }
                    }
                },
                review: true
            }
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        if (order.sellerId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        if (order.status !== "COMPLETED") {
            return NextResponse.json({ error: "Order not completed" }, { status: 400 })
        }

        return NextResponse.json({
            order,
            existingReview: order.review
        })
    } catch (error) {
        console.error("Review fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
    }
}

// POST: Submit review
export async function POST(
    req: Request,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value
        const { orderId } = await context.params

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { rating, comment } = await req.json()

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
        }

        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { review: true }
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        if (order.sellerId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        if (order.status !== "COMPLETED") {
            return NextResponse.json({ error: "Order not completed" }, { status: 400 })
        }

        if (order.review) {
            return NextResponse.json({ error: "Already reviewed" }, { status: 400 })
        }

        // Filter profanity
        const filteredComment = comment ? filterProfanity(comment) : null

        // Create review
        const review = await db.review.create({
            data: {
                orderId,
                reviewerId: userId,
                rating,
                comment: filteredComment
            }
        })

        // Update Kabadiwala rating
        const kabadiwalaProfile = await db.kabadiwalaProfile.findUnique({
            where: { userId: order.buyerId }
        })

        if (kabadiwalaProfile) {
            const newTotalReviews = kabadiwalaProfile.totalReviews + 1
            const newRating = (
                (kabadiwalaProfile.rating * kabadiwalaProfile.totalReviews + rating) / newTotalReviews
            )

            await db.kabadiwalaProfile.update({
                where: { userId: order.buyerId },
                data: {
                    rating: Math.round(newRating * 10) / 10,
                    totalReviews: newTotalReviews,
                    totalPickups: { increment: 1 }
                }
            })
        }

        return NextResponse.json({ success: true, review })
    } catch (error) {
        console.error("Review submit error:", error)
        return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
    }
}

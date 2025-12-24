import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

async function getCurrentUser() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) return null
    return db.user.findUnique({ where: { id: userId } })
}

// GET: Get single order
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const order = await db.order.findUnique({
            where: { id },
            include: {
                seller: { select: { id: true, name: true, phone: true } },
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        kabadiwalaProfile: { select: { businessName: true, rating: true, isVerified: true } }
                    }
                },
                review: true
            }
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Check authorization
        if (order.sellerId !== user.id && order.buyerId !== user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 })
        }

        return NextResponse.json(order)
    } catch (error) {
        console.error("Order fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
    }
}

// PATCH: Update order status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { status, totalAmount, cancelReason } = body

        const order = await db.order.findUnique({
            where: { id },
            select: { sellerId: true, buyerId: true, status: true }
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Validate permissions
        const isSeller = order.sellerId === user.id
        const isBuyer = order.buyerId === user.id

        if (!isSeller && !isBuyer) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 })
        }

        // Validate status transitions
        const validTransitions: Record<string, string[]> = {
            "REQUESTED": ["ACCEPTED", "CANCELLED"],
            "ACCEPTED": ["COMPLETED", "CANCELLED"],
            "COMPLETED": [],
            "CANCELLED": []
        }

        if (!validTransitions[order.status]?.includes(status)) {
            return NextResponse.json({
                error: `Cannot transition from ${order.status} to ${status}`
            }, { status: 400 })
        }

        // Only buyer (Kabadiwala) can accept/complete
        if ((status === "ACCEPTED" || status === "COMPLETED") && !isBuyer) {
            return NextResponse.json({ error: "Only Kabadiwala can accept/complete orders" }, { status: 403 })
        }

        // Update order
        const updateData: Record<string, unknown> = { status }

        if (status === "COMPLETED" && totalAmount) {
            updateData.totalAmount = totalAmount

            // Update kabadiwala stats
            await db.kabadiwalaProfile.updateMany({
                where: { userId: order.buyerId },
                data: { totalPickups: { increment: 1 } }
            })
        }

        const updated = await db.order.update({
            where: { id },
            data: updateData,
            include: {
                seller: { select: { id: true, name: true, phone: true } },
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        kabadiwalaProfile: { select: { businessName: true } }
                    }
                }
            }
        })

        // Notify User
        const { sendNotification } = await import("@/lib/notifications")
        const { awardPoints } = await import("@/actions/gamification")

        if (status === "ACCEPTED") {
            await sendNotification(
                updated.sellerId,
                "Order Accepted! ✅",
                `${updated.buyer.kabadiwalaProfile?.businessName || updated.buyer.name} is coming to pick up your scrap.`,
                "/orders"
            )
        } else if (status === "COMPLETED") {
            // Award Points to Seller
            await awardPoints(order.sellerId, "ORDER_COMPLETED")

            await sendNotification(
                order.sellerId,
                "Pickup Completed 💰",
                `Your order #${id.slice(-6)} has been completed. You earned 100 Green Points!`,
                `/orders/${id}`
            )
        } else if (status === "CANCELLED") {
            // Notify the other party
            const targetId = isSeller ? updated.buyerId : updated.sellerId
            if (targetId) {
                await sendNotification(
                    targetId,
                    "Order Cancelled ❌",
                    `Order has been cancelled by ${isSeller ? 'User' : 'Kabadiwala'}.`,
                    "/orders"
                )
            }
        }

        return NextResponse.json(updated)
    } catch (error) {
        console.error("Order update error:", error)
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }
}

// DELETE: Cancel order
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const order = await db.order.findUnique({
            where: { id },
            select: { sellerId: true, buyerId: true, status: true }
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        if (order.sellerId !== user.id && order.buyerId !== user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 })
        }

        // Can only cancel if not completed
        if (order.status === "COMPLETED") {
            return NextResponse.json({ error: "Cannot cancel completed orders" }, { status: 400 })
        }

        await db.order.update({
            where: { id },
            data: { status: "CANCELLED" }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Order delete error:", error)
        return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
    }
}

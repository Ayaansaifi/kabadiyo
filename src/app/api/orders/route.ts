import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// POST: Create new order
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { kabadiwalaId, address, items, pickupDate } = await req.json()

        if (!kabadiwalaId || !address || !pickupDate) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        const order = await db.order.create({
            data: {
                sellerId: userId,
                buyerId: kabadiwalaId,
                address,
                items: items || "",
                pickupDate: new Date(pickupDate),
                status: "REQUESTED"
            },
            include: {
                seller: { select: { name: true } }
            }
        })

        // Notify Kabadiwala
        if (order.buyerId) {
            const { sendNotification } = await import("@/lib/notifications")
            await sendNotification(
                order.buyerId,
                "New Pickup Request 📦",
                `${order.seller.name || 'A user'} requested a pickup at ${address}`,
                "/orders"
            )
        }

        return NextResponse.json({ success: true, order })
    } catch (error) {
        console.error("Order creation error:", error)
        return NextResponse.json({ error: "Failed" }, { status: 500 })
    }
}

// GET: Get orders for current user
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const orders = await db.order.findMany({
            where: {
                OR: [
                    { sellerId: userId },
                    { buyerId: userId }
                ]
            },
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
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(orders)
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 })
    }
}

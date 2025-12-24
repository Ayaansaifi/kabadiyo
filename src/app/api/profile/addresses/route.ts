import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// POST: Add new address
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { label, address } = await req.json()

        if (!label || !address) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // Check if this is the first address (make it default)
        const existingCount = await db.address.count({ where: { userId } })

        const newAddress = await db.address.create({
            data: {
                userId,
                label,
                address,
                isDefault: existingCount === 0
            }
        })

        return NextResponse.json({ address: newAddress })
    } catch (error) {
        console.error("Address create error:", error)
        return NextResponse.json({ error: "Failed to add address" }, { status: 500 })
    }
}

// GET: List all addresses
export async function GET() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const addresses = await db.address.findMany({
            where: { userId },
            orderBy: { isDefault: "desc" }
        })

        return NextResponse.json({ addresses })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
    }
}

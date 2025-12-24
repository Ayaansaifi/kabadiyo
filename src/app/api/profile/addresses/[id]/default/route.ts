import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// PUT: Set address as default
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value
        const { id } = await context.params

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // First, unset all defaults
        await db.address.updateMany({
            where: { userId },
            data: { isDefault: false }
        })

        // Set the new default
        await db.address.update({
            where: { id },
            data: { isDefault: true }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 })
    }
}

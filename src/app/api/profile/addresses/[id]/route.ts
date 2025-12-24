import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// DELETE: Remove address
export async function DELETE(
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

        const address = await db.address.findFirst({
            where: { id, userId }
        })

        if (!address) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 })
        }

        await db.address.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}

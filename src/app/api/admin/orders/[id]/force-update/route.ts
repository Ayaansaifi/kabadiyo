import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await context.params
        const body = await req.json()
        const { status } = body

        if (!status) {
            return NextResponse.json({ error: "Status required" }, { status: 400 })
        }

        await db.order.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to force update order" }, { status: 500 })
    }
}

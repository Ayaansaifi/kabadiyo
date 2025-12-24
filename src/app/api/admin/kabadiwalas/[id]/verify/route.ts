import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

async function checkAdminAuth() {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get("admin_session")
    return adminToken && adminToken.value === "active"
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await checkAdminAuth()
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await context.params
        const body = await req.json()
        const { isVerified } = body

        if (typeof isVerified !== "boolean") {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        await db.kabadiwalaProfile.update({
            where: { id },
            data: { isVerified }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

async function checkAdminAuth() {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get("admin_session")
    return adminToken && adminToken.value === "active"
}

// DELETE: Remove a user
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await checkAdminAuth()
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await context.params

        await db.user.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }
}

// PATCH: Update user role
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
        const { role } = body

        if (!role || !["USER", "AGENT", "KABADIWALA", "ADMIN"].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }

        await db.user.update({
            where: { id },
            data: { role }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }
}

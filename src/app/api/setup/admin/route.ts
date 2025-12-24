import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/setup/admin?phone=1234567890
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get("phone")

    if (!phone) {
        return NextResponse.json({ error: "Phone number required" }, { status: 400 })
    }

    try {
        const user = await db.user.update({
            where: { phone },
            data: { role: "ADMIN" }
        })

        return NextResponse.json({
            success: true,
            message: `User ${user.name} (${user.phone}) is now an ADMIN.`
        })
    } catch (error) {
        return NextResponse.json({ error: "User not found or failed to update" }, { status: 404 })
    }
}

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

async function getCurrentUser() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) return null
    return db.user.findUnique({ where: { id: userId } })
}

// POST: Change password (for logged-in users)
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { currentPassword, newPassword } = await request.json()

        // Validate inputs
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password)
        if (!isValid) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password
        await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        return NextResponse.json({ success: true, message: "Password changed successfully" })
    } catch (error) {
        console.error("Password change error:", error)
        return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
    }
}

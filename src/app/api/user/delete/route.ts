import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function DELETE() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Delete user data in order (respecting foreign key constraints)
        // 1. Delete messages sent by user
        await db.message.deleteMany({ where: { senderId: userId } })

        // 2. Delete story views
        await db.storyView.deleteMany({ where: { viewerId: userId } })

        // 3. Delete stories
        await db.story.deleteMany({ where: { userId } })

        // 4. Delete favorites
        await db.favorite.deleteMany({ where: { userId } })

        // 5. Delete sessions
        await db.session.deleteMany({ where: { userId } })

        // 6. Delete kabadiwala profile if exists
        await db.kabadiwalaProfile.deleteMany({ where: { userId } })

        // 7. Finally delete user
        await db.user.delete({ where: { id: userId } })

        // Clear auth cookies
        const response = NextResponse.json({ success: true, message: "Account deleted successfully" })
        response.cookies.delete("userId")
        response.cookies.delete("sessionId")

        return response
    } catch (error) {
        console.error("Account deletion error:", error)
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }
}

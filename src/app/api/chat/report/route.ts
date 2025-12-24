import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// POST: Report a message
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { messageId, reason } = await req.json()

        if (!messageId || !reason) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // Check message exists
        const message = await db.message.findUnique({
            where: { id: messageId }
        })

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 })
        }

        // Cannot report own message
        if (message.senderId === userId) {
            return NextResponse.json({ error: "Cannot report own message" }, { status: 400 })
        }

        // Check if already reported by this user
        const existing = await db.messageReport.findFirst({
            where: { messageId, reporterId: userId }
        })

        if (existing) {
            return NextResponse.json({ error: "Already reported" }, { status: 400 })
        }

        // Create report
        await db.messageReport.create({
            data: {
                messageId,
                reporterId: userId,
                reason
            }
        })

        // Mark message as reported
        await db.message.update({
            where: { id: messageId },
            data: { isReported: true }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Report error:", error)
        return NextResponse.json({ error: "Failed to report" }, { status: 500 })
    }
}

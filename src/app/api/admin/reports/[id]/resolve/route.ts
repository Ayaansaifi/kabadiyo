import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

async function checkAdminAuth() {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get("admin_session")
    return adminToken && adminToken.value === "active"
}

// POST: Resolve a report (dismiss or delete message)
export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await checkAdminAuth()
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await context.params // Report ID
        const body = await req.json()
        const { action } = body // "dismiss" | "delete_message"

        if (!["dismiss", "delete_message"].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        const report = await db.messageReport.findUnique({
            where: { id },
            include: { message: true }
        })

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 })
        }

        if (action === "delete_message") {
            // Soft delete the message
            await db.message.update({
                where: { id: report.messageId },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    content: "", // Clear content
                    isReported: false // Clear reported flag as it's dealt with
                }
            })
        } else {
            // Just unflag the message
            await db.message.update({
                where: { id: report.messageId },
                data: { isReported: false }
            })
        }

        // Mark report as resolved
        await db.messageReport.update({
            where: { id },
            data: { isResolved: true }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to resolve report" }, { status: 500 })
    }
}

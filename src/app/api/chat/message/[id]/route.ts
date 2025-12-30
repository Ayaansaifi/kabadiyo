import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// PATCH: Edit message content
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { content } = await request.json()

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 })
        }

        // Verify the message belongs to the user
        const message = await db.message.findUnique({
            where: { id },
            select: { senderId: true, createdAt: true }
        })

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 })
        }

        if (message.senderId !== userId) {
            return NextResponse.json({ error: "Cannot edit others' messages" }, { status: 403 })
        }

        // Check if within 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
        if (message.createdAt < fifteenMinutesAgo) {
            return NextResponse.json({ error: "Can only edit messages within 15 minutes" }, { status: 400 })
        }

        // Update the message
        const updated = await db.message.update({
            where: { id },
            data: {
                content: content.trim(),
                editedAt: new Date()
            }
        })

        return NextResponse.json({ success: true, message: updated })
    } catch (error) {
        console.error("Edit message error:", error)
        return NextResponse.json({ error: "Failed to edit message" }, { status: 500 })
    }
}

// DELETE: Soft delete message (Delete for Everyone)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify the message belongs to the user
        const message = await db.message.findUnique({
            where: { id },
            select: { senderId: true }
        })

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 })
        }

        if (message.senderId !== userId) {
            return NextResponse.json({ error: "Cannot delete others' messages" }, { status: 403 })
        }

        // Soft delete
        await db.message.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                content: "This message was deleted"
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete message error:", error)
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
    }
}

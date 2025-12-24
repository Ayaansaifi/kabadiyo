import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function DELETE(
    req: Request,
    context: { params: Promise<{ messageId: string }> }
) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { messageId } = await context.params

        const message = await db.message.findUnique({
            where: { id: messageId }
        })

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 })
        }

        if (message.senderId !== userId) {
            return NextResponse.json({ error: "Not allowed" }, { status: 403 })
        }

        // Soft delete
        const updated = await db.message.update({
            where: { id: messageId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                content: "" // Clear content for privacy
            }
        })

        return NextResponse.json({ success: true, message: updated })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ messageId: string }> }
) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { messageId } = await context.params
        const body = await req.json()
        const { content } = body

        if (!content) {
            return NextResponse.json({ error: "Content required" }, { status: 400 })
        }

        const message = await db.message.findUnique({
            where: { id: messageId }
        })

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 })
        }

        if (message.senderId !== userId) {
            return NextResponse.json({ error: "Not allowed" }, { status: 403 })
        }

        if (message.isDeleted) {
            return NextResponse.json({ error: "Cannot edit deleted message" }, { status: 400 })
        }

        const updated = await db.message.update({
            where: { id: messageId },
            data: {
                content,
                editedAt: new Date()
            }
        })

        return NextResponse.json({ success: true, message: updated })
    } catch (error) {
        return NextResponse.json({ error: "Failed to edit" }, { status: 500 })
    }
}

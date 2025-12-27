import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

// GET: List all active sessions for current user
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value
        const currentToken = cookieStore.get("sessionToken")?.value
        const currentUserAgent = req.headers.get("user-agent") || ""

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const sessions = await db.session.findMany({
            where: { userId },
            orderBy: { lastActive: 'desc' }
        })

        // Transform for UI
        const formattedSessions = sessions.map(session => ({
            id: session.id,
            device: session.userAgent || "Unknown Device",
            location: session.city ? `${session.city}, ${session.country || ''}` : "Unknown Location",
            lastActive: session.lastActive,
            isCurrent: session.sessionToken === currentToken || (session.userAgent === currentUserAgent),
            ip: session.ipAddress
        }))

        return NextResponse.json({ sessions: formattedSessions })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
    }
}

// DELETE: Revoke a specific session (or all others)
export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { sessionId, revokeAllOthers } = await req.json()

        if (revokeAllOthers) {
            // Revoke all EXCEPT current
            // Note: Use currentToken logic if available, else careful
            // For now, simpler: user passes ID to Keep? Or just revoke all matches
            // Ideally we know current session ID.
            // If revokeAllOthers is true, we delete where userId = userId AND id != sessionId
            await db.session.deleteMany({
                where: {
                    userId,
                    id: { not: sessionId }
                }
            })
        } else {
            // Revoke specific
            await db.session.delete({
                where: {
                    id: sessionId,
                    userId // Security check
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to revoke" }, { status: 500 })
    }
}

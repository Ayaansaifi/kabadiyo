/**
 * Debug Session API
 * -----------------
 * GET: Check if NextAuth session is available
 * This helps debug why API routes return 401
 */
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { cookies } from "next/headers"

export async function GET() {
    try {
        // Get NextAuth session
        const session = await auth()

        // Get all cookies for debugging
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()
        const cookieNames = allCookies.map(c => c.name)

        // Check for NextAuth session token
        const hasSessionToken = cookieNames.some(name =>
            name === 'authjs.session-token' ||
            name === '__Secure-authjs.session-token' ||
            name === 'next-auth.session-token'
        )

        return NextResponse.json({
            hasSession: !!session,
            sessionUser: session?.user || null,
            userId: session?.user?.id || null,
            hasSessionTokenCookie: hasSessionToken,
            cookieNames: cookieNames,
            debug: {
                timestamp: new Date().toISOString()
            }
        })
    } catch (error) {
        console.error("Debug session error:", error)
        return NextResponse.json({
            error: "Failed to get session",
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}

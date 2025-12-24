import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateVerificationToken, sendVerificationToken, verifyToken } from "@/lib/verification"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { action, identifier, type, token } = body

        if (!identifier || !type) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        if (action === "SEND") {
            const code = await generateVerificationToken(identifier, type)
            await sendVerificationToken(identifier, code, type)
            return NextResponse.json({ success: true, message: "Code sent" })
        }

        if (action === "VERIFY") {
            if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 })

            const result = await verifyToken(identifier, token, type)

            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: 400 })
            }

            return NextResponse.json({ success: true, message: "Verified successfully" })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error) {
        console.error("Verification error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

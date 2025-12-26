import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

import { checkBruteForce, recordFailedAttempt, clearFailedAttempts } from "@/lib/security"

export async function POST(req: Request) {
    try {
        const { phone, password } = await req.json()

        if (!phone || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // 1. Check Brute Force Lock
        const bruteCheck = checkBruteForce(phone)
        if (!bruteCheck.allowed) {
            return NextResponse.json({
                error: bruteCheck.messageHi || bruteCheck.message
            }, { status: 429 })
        }

        // Find user
        const user = await db.user.findUnique({ where: { phone } })
        if (!user) {
            // Record failed attempt even for non-existent user to prevent enumeration
            recordFailedAttempt(phone)
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            const result = recordFailedAttempt(phone)
            return NextResponse.json({
                error: "Invalid credentials",
                remainingAttempts: result.remainingAttempts
            }, { status: 401 })
        }

        // Clear failed attempts on success
        clearFailedAttempts(phone)

        // Set session cookie (simplified for now, use NextAuth in production)
        const cookieStore = await cookies()
        cookieStore.set("userId", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 1 week
        })
        cookieStore.set("userRole", user.role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
        })

        return NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, role: user.role }
        })
    } catch (error: any) {
        console.error("Login critical error:", {
            message: error.message,
            stack: error.stack,
            code: error.code
        })
        return NextResponse.json({
            error: "Login failed due to server error. Check console."
        }, { status: 500 })
    }
}

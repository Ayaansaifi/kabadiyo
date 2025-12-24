import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(req: Request) {
    try {
        const { phone, password } = await req.json()

        if (!phone || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // Find user
        const user = await db.user.findUnique({ where: { phone } })
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

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
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Login failed" }, { status: 500 })
    }
}

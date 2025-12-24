import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import { auth } from "@/auth"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { action, password } = body

        // 1. CHECK SESSION
        if (action === "CHECK") {
            const cookieStore = await cookies()
            const adminToken = cookieStore.get("admin_session")

            if (!adminToken || adminToken.value !== "active") {
                return NextResponse.json({ valid: false })
            }
            return NextResponse.json({ valid: true })
        }

        // 2. LOGOUT
        if (action === "LOGOUT") {
            const cookieStore = await cookies()
            cookieStore.delete("admin_session")

            // Log logout
            const session = await auth()
            await db.adminAccessLog.create({
                data: {
                    ipAddress: "unknown", // In real app, get from headers
                    action: "LOGOUT",
                    userId: session?.user?.id,
                    details: "Manual logout"
                }
            })

            return NextResponse.json({ success: true })
        }

        // 3. LOGIN
        if (action === "LOGIN") {
            if (!password) {
                return NextResponse.json({ error: "Password required" }, { status: 400 })
            }

            const config = await db.adminConfig.findFirst()

            if (!config || !config.isSetup) {
                return NextResponse.json({ error: "Admin password not set. Please run setup." }, { status: 400 })
            }

            // Check lock
            if (config.lockedUntil && config.lockedUntil > new Date()) {
                return NextResponse.json({ error: "Account locked. Try again later." }, { status: 403 })
            }

            const isValid = await compare(password, config.adminPassword)

            const session = await auth()
            const ip = "unknown" // In Next.js middleware or headers we'd get real IP

            if (!isValid) {
                // Increment failed attempts
                const attempts = config.failedAttempts + 1
                const updateData: any = { failedAttempts: attempts }

                if (attempts >= 10) {
                    updateData.lockedUntil = new Date(Date.now() + 1 * 60 * 1000) // 1 min lock
                }

                await db.adminConfig.update({
                    where: { id: config.id },
                    data: updateData
                })

                await db.adminAccessLog.create({
                    data: {
                        ipAddress: ip,
                        action: "LOGIN_FAILED",
                        userId: session?.user?.id,
                        details: `Attempt ${attempts}`
                    }
                })

                return NextResponse.json({ error: "Invalid password" }, { status: 401 })
            }

            // Success
            await db.adminConfig.update({
                where: { id: config.id },
                data: {
                    failedAttempts: 0,
                    lastAccess: new Date(),
                    lockedUntil: null
                }
            })

            await db.adminAccessLog.create({
                data: {
                    ipAddress: ip,
                    action: "LOGIN_SUCCESS",
                    userId: session?.user?.id,
                    details: "Admin panel access granted"
                }
            })

            const cookieStore = await cookies()
            // Set session cookie (expires in 1 hour)
            cookieStore.set("admin_session", "active", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600, // 1 hour
                path: "/"
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })

    } catch (error) {
        console.error("Admin Security Error:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

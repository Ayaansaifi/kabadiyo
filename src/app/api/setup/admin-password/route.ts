import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hash } from "bcryptjs"

// GET /api/setup/admin-password?password=YOUR_SECURE_PASSWORD
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const password = searchParams.get("password")

    if (!password || password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    try {
        const hashedPassword = await hash(password, 10)

        const existing = await db.adminConfig.findFirst()

        if (existing) {
            await db.adminConfig.update({
                where: { id: existing.id },
                data: {
                    adminPassword: hashedPassword,
                    isSetup: true,
                    failedAttempts: 0,
                    lockedUntil: null
                }
            })
        } else {
            await db.adminConfig.create({
                data: {
                    adminPassword: hashedPassword,
                    isSetup: true
                }
            })
        }

        return NextResponse.json({
            success: true,
            message: "Admin password updated successfully. You can now login to the panel."
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to setup admin config" }, { status: 500 })
    }
}

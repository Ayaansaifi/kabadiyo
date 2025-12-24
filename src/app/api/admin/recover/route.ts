import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, recoveryCode, newPassword } = body

        if (!email || !recoveryCode || !newPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 })
        }

        const envRecoveryCode = process.env.ADMIN_RECOVERY_CODE

        if (!envRecoveryCode) {
            console.error("ADMIN_RECOVERY_CODE is not set in environment variables")
            return NextResponse.json({ error: "Recovery system not configured. Contact developer." }, { status: 503 })
        }

        if (recoveryCode !== envRecoveryCode) {
            return NextResponse.json({ error: "Invalid Recovery Master Key" }, { status: 403 })
        }

        // Check if user exists
        const user = await db.user.findUnique({ where: { email } })

        if (!user) {
            return NextResponse.json({ error: "No user found with this email" }, { status: 404 })
        }

        // Reset Password AND Ensure Admin Role (Developer Recovery Privilege)
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await db.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                role: "ADMIN" // Auto-promote to Admin since they have the Master Key
            }
        })



        // CRITICAL: Also update the AdminConfig (Secure Admin Panel Password) and UNLOCK if locked
        const adminConfig = await db.adminConfig.findFirst()

        if (adminConfig) {
            await db.adminConfig.update({
                where: { id: adminConfig.id },
                data: {
                    adminPassword: hashedPassword, // Sync admin panel password
                    failedAttempts: 0,             // Unlock account
                    lockedUntil: null,             // Clear lock timer
                    isSetup: true
                }
            })
        } else {
            // Backup: Create config if missing
            await db.adminConfig.create({
                data: {
                    adminPassword: hashedPassword,
                    isSetup: true,
                    failedAttempts: 0,
                    lockedUntil: null
                }
            })
        }

        return NextResponse.json({
            success: true,
            message: "Password Reset & Admin Access Restored Successfully. Login with new password."
        })

    } catch (error) {
        console.error("Admin Recovery Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

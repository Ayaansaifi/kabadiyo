import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendOtpEmail } from "@/lib/mail"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { action, email: rawEmail, otp, newPassword } = body
        const email = rawEmail?.toLowerCase()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const user = await db.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: "No account found with this email" }, { status: 404 })
        }

        if (action === "REQUEST") {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
            const expires = new Date(new Date().getTime() + 10 * 60 * 1000) // 10 minutes

            // Cleanup old tokens
            await db.verificationToken.deleteMany({
                where: { identifier: email, type: "PASSWORD_RESET" }
            })

            // Create new token
            await db.verificationToken.create({
                data: {
                    identifier: email,
                    token: otpCode,
                    expires,
                    type: "PASSWORD_RESET"
                }
            })

            // Send Email
            const sent = await sendOtpEmail(email, otpCode)
            if (!sent) {
                return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
            }

            return NextResponse.json({ success: true, message: "OTP sent to email" })
        }

        if (action === "RESET") {
            if (!otp || !newPassword) {
                return NextResponse.json({ error: "OTP and New Password required" }, { status: 400 })
            }

            const token = await db.verificationToken.findFirst({
                where: { identifier: email, token: otp, type: "PASSWORD_RESET" }
            })

            if (!token) {
                return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
            }

            if (new Date() > token.expires) {
                await db.verificationToken.delete({ where: { id: token.id } })
                return NextResponse.json({ error: "OTP Expired" }, { status: 400 })
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10)

            // Update User
            await db.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            })

            // Delete token
            await db.verificationToken.delete({ where: { id: token.id } })

            return NextResponse.json({ success: true, message: "Password updated successfully" })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })

    } catch (error) {
        console.error("Reset Password Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

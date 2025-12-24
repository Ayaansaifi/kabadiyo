
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendOtpEmail } from "@/lib/mail"
import { z } from "zod"
import { cookies } from "next/headers"

const sendOtpSchema = z.object({
    action: z.literal("SEND"),
    email: z.string().email(),
    phone: z.string().min(10).optional(),
})

const verifyOtpSchema = z.object({
    action: z.literal("VERIFY"),
    email: z.string().email(),
    otp: z.string().length(6),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Validate request structure dynamically based on action
        if (!body.action) {
            return NextResponse.json({ error: "Action is required" }, { status: 400 })
        }

        if (body.action === "SEND") {
            const validation = sendOtpSchema.safeParse(body)
            if (!validation.success) {
                return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
            }
            const { email, phone } = validation.data

            // Generate OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
            const expires = new Date(new Date().getTime() + 10 * 60 * 1000) // 10 minutes

            // Delete existing tokens for this email
            await db.verificationToken.deleteMany({
                where: { identifier: email, type: "EMAIL" }
            })

            // Create new token
            await db.verificationToken.create({
                data: {
                    identifier: email,
                    token: otpCode,
                    expires,
                    type: "EMAIL"
                }
            })

            // Send Email
            const emailSent = await sendOtpEmail(email, otpCode)
            if (!emailSent) {
                return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
            }

            // Upsert User (Update phone if provided, or create placeholder)
            // Note: In a real app, you might want to separate user creation or ensure phone uniqueness logic here.
            // For this task, we'll try to update existing user by email or phone, or mostly rely on VerificationToken for the verification step.
            // Requirements said: "Include a mock function or instructions on where to save the User's Phone Number, Email, and OTP in a database".
            // We are saving OTP in VerificationToken.
            // We can upsert the user info if needed, but primarily we are validating the OTP.

            // Let's create/update user to ensure we capture the phone/email mapping if it's a new registration flow.
            // Check if user exists by email
            const existingUser = await db.user.findUnique({ where: { email } })

            if (existingUser) {
                if (phone && existingUser.phone !== phone) {
                    // Be careful updating phone if it belongs to another user
                    // For now, we won't force update phone on SEND action to avoid conflict without verification
                }
            } else if (phone) {
                // Check if phone exists
                const existingPhone = await db.user.findUnique({ where: { phone } })
                if (!existingPhone) {
                    // Create partial user or just wait for verified registration? 
                    // Implementation Plan said: "Store/Update User record with phone/email (Upsert)."
                    // We need to be careful with unique constraints.
                    // Let's just create a user if not exists, but we need a password.
                    // Since we don't have password here, we might just skip creating User record until verification or registration.
                    // BUT, the prompt asks where to save User's Phone Number, Email.
                    // Let's assume we proceed with VerificationToken for the "OTP aspect" and only touch User table if we want to auto-register.
                    // For simplicity and security, we will just manage VerificationToken here.
                    // The User table will be updated/checked in the VERIFY step.
                }
            }

            return NextResponse.json({ success: true, message: "OTP sent to email" })
        }

        if (body.action === "VERIFY") {
            const validation = verifyOtpSchema.safeParse(body)
            if (!validation.success) {
                return NextResponse.json({ error: "Please enter a valid 6-digit OTP code" }, { status: 400 })
            }
            const { email, otp } = validation.data

            // Find token
            const token = await db.verificationToken.findFirst({
                where: { identifier: email, token: otp, type: "EMAIL" }
            })

            if (!token) {
                return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
            }

            // Check expiry
            if (new Date() > token.expires) {
                await db.verificationToken.delete({ where: { id: token.id } })
                return NextResponse.json({ error: "OTP expired" }, { status: 400 })
            }

            // Valid OTP
            await db.verificationToken.delete({ where: { id: token.id } })

            // Mark email as verified for the user
            const user = await db.user.findUnique({ where: { email } })
            if (user) {
                await db.user.update({
                    where: { id: user.id },
                    data: { emailVerified: new Date() }
                })

                // Create Session Cookies for Auto-Login
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
                    message: "OTP verified successfully. Logging in...",
                    user: { id: user.id, name: user.name, role: user.role }
                })
            } else {
                // Should not happen in registration flow since user is created first
                return NextResponse.json({ error: "User not found" }, { status: 404 })
            }
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })

    } catch (error) {
        console.error("OTP API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

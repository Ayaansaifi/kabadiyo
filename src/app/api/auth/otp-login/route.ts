import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { sendOtpEmail } from "@/lib/mail"

// OTP Login - Request OTP or Verify OTP
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { action, email: rawEmail, otp } = body
        const email = rawEmail?.toLowerCase()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        // Check if user exists
        const user = await db.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: "No account found with this email" }, { status: 404 })
        }

        if (action === "REQUEST") {
            // Generate OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
            const expires = new Date(new Date().getTime() + 10 * 60 * 1000) // 10 minutes

            // Delete existing tokens for this email
            await db.verificationToken.deleteMany({
                where: { identifier: email, type: "OTP_LOGIN" }
            })

            // Create new token
            await db.verificationToken.create({
                data: {
                    identifier: email,
                    token: otpCode,
                    expires,
                    type: "OTP_LOGIN"
                }
            })

            // Send via Email
            const emailSent = await sendOtpEmail(email, otpCode)
            if (!emailSent) {
                return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
            }

            return NextResponse.json({
                success: true,
                message: "OTP sent to your email",
            })
        }

        if (action === "VERIFY") {
            if (!otp) {
                return NextResponse.json({ error: "OTP required" }, { status: 400 })
            }

            console.log(`Verifying OTP for ${email}. OTP: ${otp}`)

            // Find the token
            const token = await db.verificationToken.findFirst({
                where: { identifier: email, token: otp, type: "OTP_LOGIN" }
            })

            if (!token) {
                console.log("Token not found or invalid.")
                return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
            }

            // Check if expired
            if (new Date() > token.expires) {
                await db.verificationToken.delete({ where: { id: token.id } })
                return NextResponse.json({ error: "OTP expired" }, { status: 400 })
            }

            // Delete the token
            await db.verificationToken.delete({ where: { id: token.id } })

            // Mark email as verified if not already
            if (!user.emailVerified) {
                await db.user.update({
                    where: { id: user.id },
                    data: { emailVerified: new Date() }
                })
            }

            // Create session
            const cookieStore = await cookies()

            // Create Session Record
            const sessionToken = crypto.randomUUID()
            // In OTP route, we might not have 'req' in formatting above easily access headers if it was cleaner, 
            // but we do have 'req' object at top.
            const userAgent = req.headers.get("user-agent") || "Unknown Device"
            const ip = req.headers.get("x-forwarded-for") || "Unknown IP"

            const deviceName = userAgent.includes("Windows") ? "Windows PC" :
                userAgent.includes("Mac") ? "Mac" :
                    userAgent.includes("Android") ? "Android" :
                        userAgent.includes("iPhone") ? "iPhone" : "Unknown Device"

            await db.session.create({
                data: {
                    userId: user.id,
                    sessionToken,
                    userAgent: deviceName,
                    ipAddress: ip,
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
                }
            })

            cookieStore.set("sessionToken", sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, // 1 week
            })

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

            console.log("Login successful, role:", user.role)

            return NextResponse.json({
                success: true,
                user: { id: user.id, name: user.name, role: user.role }
            })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error) {
        console.error("OTP Login error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

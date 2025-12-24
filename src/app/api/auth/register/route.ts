import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { sendOtpEmail } from "@/lib/mail"

export async function POST(req: Request) {
    try {
        const { name, phone, email, password, role, businessName, serviceArea } = await req.json()

        // Validate
        if (!name || !phone || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        if (phone.length < 10) {
            return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
        }

        // Check if user exists (phone or email)
        const existingUserPhone = await db.user.findUnique({ where: { phone } })
        if (existingUserPhone) {
            return NextResponse.json({ error: "Phone number already registered" }, { status: 400 })
        }

        const existingUserEmail = await db.user.findUnique({ where: { email } })
        if (existingUserEmail) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const userData: Prisma.UserCreateInput = {
            name,
            phone,
            email,
            password: hashedPassword,
            role: role || "USER",
            // Phone is verified? No. properties "phoneVerified" and "emailVerified" should be null by default.
        }

        // If Kabadiwala, create profile
        if (role === "KABADIWALA" && businessName) {
            userData.kabadiwalaProfile = {
                create: {
                    businessName,
                    serviceArea: serviceArea || "",
                    isVerified: false,
                }
            }
        }

        const user = await db.user.create({
            data: userData,
        })

        // Generate and Send OTP for Email Verification
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
        const expires = new Date(new Date().getTime() + 10 * 60 * 1000) // 10 minutes

        // Delete existing tokens for this email (just in case)
        await db.verificationToken.deleteMany({
            where: { identifier: email, type: "EMAIL" }
        })

        await db.verificationToken.create({
            data: {
                identifier: email,
                token: otpCode,
                expires,
                type: "EMAIL"
            }
        })

        await sendOtpEmail(email, otpCode)

        return NextResponse.json({
            success: true,
            requireVerification: true,
            email: user.email,
            user: { id: user.id, name: user.name, role: user.role }
        })
    } catch (error: any) {
        console.error("Registration error details:", {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        })
        return NextResponse.json({
            error: "Registration failed",
            details: error.message,
            code: error.code
        }, { status: 500 })
    }
}

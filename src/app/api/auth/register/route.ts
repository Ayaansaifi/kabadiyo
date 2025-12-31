import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { sendOtpEmail } from "@/lib/mail"

export async function POST(req: Request) {
    try {
        const { name, phone, email, password, role, businessName, serviceArea, referralCode } = await req.json()

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

        // Generate Referral Code for the new user
        const baseCode = name.slice(0, 4).toUpperCase().replace(/\s/g, "")
        const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString()
        const myReferralCode = `KBD${baseCode}${randomSuffix}`

        // Create user
        const userData = {
            name,
            phone,
            email,
            password: hashedPassword,
            role: role || "USER",
            referralCode: myReferralCode,
            // Phone is verified? No. properties "phoneVerified" and "emailVerified" should be null by default.
            kabadiwalaProfile: undefined as any
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
        } else {
            delete userData.kabadiwalaProfile
        }

        const user = await db.user.create({
            data: userData as Prisma.UserCreateInput,
        })

        // Generate and Send OTP for Email Verification
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
        const expires = new Date(new Date().getTime() + 10 * 60 * 1000) // 10 minutes

        // Delete existing tokens
        await db.verificationToken.deleteMany({
            where: { identifier: email, type: "EMAIL" }
        })

        await db.verificationToken.create({
            data: { identifier: email, token: otpCode, expires, type: "EMAIL" }
        })

        // Handle Referral Logic
        if (referralCode) {
            const codeToFind = referralCode.trim()
            const referrer = await db.user.findFirst({
                where: { referralCode: codeToFind } as any
            })

            if (referrer) {
                // Create Referral Record
                try {
                    await db.referral.create({
                        data: {
                            referrerId: referrer.id,
                            referredUserId: user.id,
                            status: 'COMPLETED',
                            pointsEarned: 500
                        }
                    })

                    // Award Points to Referrer
                    await db.user.update({
                        where: { id: referrer.id },
                        data: { points: { increment: 500 } }
                    })

                    // Award Bonus to New User
                    await db.user.update({
                        where: { id: user.id },
                        data: { points: { increment: 200 } }
                    })
                } catch (refError) {
                    console.error("Referral Error:", refError)
                }
            }
        }

        const emailSent = await sendOtpEmail(email, otpCode)

        if (!emailSent) {
            // Rollback user
            await db.user.delete({ where: { id: user.id } })
            return NextResponse.json({
                error: "Failed to send OTP email"
            }, { status: 500 })
        }

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

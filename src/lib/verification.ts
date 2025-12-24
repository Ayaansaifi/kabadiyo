import { db } from "@/lib/db"

export async function generateVerificationToken(identifier: string, type: "PHONE" | "EMAIL") {
    // Generate 6 digit numeric code
    const token = Math.floor(100000 + Math.random() * 900000).toString()
    // Expires in 15 minutes
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000)

    // Delete existing tokens for this identifier/type
    await db.verificationToken.deleteMany({
        where: { identifier, type }
    })

    // Create new token
    await db.verificationToken.create({
        data: {
            identifier,
            token,
            expires,
            type
        }
    })

    return token
}

export async function sendVerificationToken(identifier: string, token: string, type: "PHONE" | "EMAIL") {
    if (type === "PHONE") {
        console.log(`
            =========================================
            [MOCK SMS SEND]
            To: ${identifier}
            Message: Your verification code is ${token}
            =========================================
        `)
        // In real app, call Twilio/SNS here
    } else {
        console.log(`
            =========================================
            [MOCK EMAIL SEND]
            To: ${identifier}
            Subject: Verify your email
            Body: Your verification code is ${token}
            =========================================
        `)
        // In real app, call SendGrid/SES here
    }
}

export async function verifyToken(identifier: string, token: string, type: "PHONE" | "EMAIL") {
    const existingToken = await db.verificationToken.findFirst({
        where: { identifier, token, type }
    })

    if (!existingToken) return { success: false, error: "Invalid code" }

    const hasExpired = new Date() > existingToken.expires
    if (hasExpired) {
        await db.verificationToken.delete({ where: { id: existingToken.id } })
        return { success: false, error: "Code expired" }
    }

    // Mark as verified
    await db.verificationToken.delete({ where: { id: existingToken.id } })

    // Update user
    if (type === "PHONE") {
        await db.user.update({
            where: { phone: identifier },
            data: { phoneVerified: new Date() }
        })
    } else {
        await db.user.update({
            where: { email: identifier },
            data: { emailVerified: new Date() }
        })
    }

    return { success: true }
}

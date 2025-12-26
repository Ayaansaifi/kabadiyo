/**
 * Profile API Route
 * -----------------
 * GET:    Fetch current user's profile data
 * PUT:    Update profile (name, address, image, cover for kabadiwalas)
 * DELETE: Delete user account (requires password confirmation)
 * 
 * Uses legacy cookies for authentication consistency.
 */
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

async function getCurrentUser() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) return null
    return db.user.findUnique({
        where: { id: userId },
        include: {
            sellerProfile: true,
            kabadiwalaProfile: true
        }
    })
}

// GET: Get current user profile
export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Don't send password
        const { password, ...safeUser } = user
        return NextResponse.json(safeUser)
    } catch (error) {
        console.error("Profile fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }
}

// PUT: Update profile
export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, address, image, notificationsEnabled, emailNotifications, smsNotifications,
            // Kabadiwala fields
            coverImage, businessName, serviceArea
        } = body

        const updateData: Record<string, unknown> = {}

        if (name !== undefined) updateData.name = name
        if (address !== undefined) updateData.address = address
        if (image !== undefined) updateData.image = image
        if (coverImage !== undefined) updateData.coverImage = coverImage

        // Transaction to update both User and KabadiwalaProfile if needed
        const updated = await db.$transaction(async (prisma) => {
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: updateData,
                include: { kabadiwalaProfile: true }
            })

            // If user is a Kabadiwala, update their profile too
            if (user.role === 'KABADIWALA' && (coverImage !== undefined || businessName !== undefined || serviceArea !== undefined)) {
                const kabadiwalaUpdate: any = {}
                if (coverImage !== undefined) kabadiwalaUpdate.coverImage = coverImage
                if (businessName !== undefined) kabadiwalaUpdate.businessName = businessName
                if (serviceArea !== undefined) kabadiwalaUpdate.serviceArea = serviceArea

                await prisma.kabadiwalaProfile.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        businessName: businessName || user.name || "My Business",
                        ...kabadiwalaUpdate
                    },
                    update: kabadiwalaUpdate
                })
            }

            return updatedUser
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error("Profile update error:", error)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }
}

// DELETE: Delete account
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { password, confirmDelete } = body

        if (confirmDelete !== "DELETE MY ACCOUNT") {
            return NextResponse.json({ error: "Please type 'DELETE MY ACCOUNT' to confirm" }, { status: 400 })
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
        }

        // Delete user and all related data (cascades)
        await db.user.delete({
            where: { id: user.id }
        })

        // Clear cookies
        const cookieStore = await cookies()
        cookieStore.delete("userId")

        return NextResponse.json({ success: true, message: "Account deleted successfully" })
    } catch (error) {
        console.error("Account delete error:", error)
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

// GET: Fetch kabadiwala profile
export async function GET() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                phone: true,
                image: true,
                role: true,
                kabadiwalaProfile: true
            }
        })

        if (!user || user.role !== "KABADIWALA") {
            return NextResponse.json({ error: "Not a Kabadiwala" }, { status: 403 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error("Profile fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }
}

// PUT: Update kabadiwala profile
export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { section, businessName, bio, serviceArea, rates, serviceHours } = body

        const updateData: Prisma.KabadiwalaProfileUpdateInput = {}

        if (section === "basic") {
            if (businessName) updateData.businessName = businessName
            if (bio !== undefined) updateData.bio = bio
            if (serviceArea !== undefined) updateData.serviceArea = serviceArea
        } else if (section === "rates") {
            if (rates) updateData.rates = rates
        } else if (section === "hours") {
            if (serviceHours) updateData.serviceHours = serviceHours
        } else if (section === "images") {
            const { image, coverImage } = body

            // Update User profile photo if provided
            if (image) {
                await db.user.update({
                    where: { id: userId },
                    data: { image }
                })
            }

            // Update Kabadiwala cover image if provided
            if (coverImage) {
                updateData.coverImage = coverImage
            }
        }

        await db.kabadiwalaProfile.update({
            where: { userId },
            data: updateData
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Profile update error:", error)
        return NextResponse.json({ error: "Failed to update" }, { status: 500 })
    }
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

// GET: Get kabadiwala details
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        const kabadiwala = await db.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                phone: true,
                kabadiwalaProfile: {
                    select: {
                        businessName: true,
                        bio: true,
                        serviceArea: true,
                        rating: true,
                        totalReviews: true,
                        totalPickups: true,
                        isVerified: true,
                        rates: true,
                        serviceHours: true
                    }
                }
            }
        })

        if (!kabadiwala) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        return NextResponse.json(kabadiwala)
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 })
    }
}

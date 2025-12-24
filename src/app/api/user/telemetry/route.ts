import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { latitude, longitude, cameraAccess, locationAccess } = body

        // Use Raw SQL to bypass stale Prisma Client
        const now = new Date()

        await db.$executeRaw`
            UPDATE User 
            SET 
                latitude = ${latitude}, 
                longitude = ${longitude}, 
                cameraAccess = ${cameraAccess}, 
                locationAccess = ${locationAccess}, 
                lastActive = ${now}
            WHERE id = ${userId}
        `

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Telemetry Error:", error)
        return NextResponse.json({ error: "Failed to update telemetry" }, { status: 500 })
    }
}

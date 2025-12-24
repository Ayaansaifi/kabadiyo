import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            include: { kabadiwalaProfile: true }
        })

        if (!user || user.role !== "KABADIWALA" || !user.kabadiwalaProfile) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await req.json()
        const { rates } = body

        await db.kabadiwalaProfile.update({
            where: { id: user.kabadiwalaProfile.id },
            data: {
                rates: JSON.stringify(rates)
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[RATES_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

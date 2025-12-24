import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

async function getCurrentUser() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) return null
    return db.user.findUnique({ where: { id: userId } })
}

// GET: Get all favorites with full details
export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const favorites = await db.favorite.findMany({
            where: { userId: user.id },
            include: {
                user: false // We'll fetch the kabadiwala separately
            }
        })

        // Get full kabadiwala details
        const kabadiwalaIds = favorites.map(f => f.kabadiwalaId)
        const kabadiwalas = await db.user.findMany({
            where: { id: { in: kabadiwalaIds } },
            select: {
                id: true,
                name: true,
                phone: true,
                image: true,
                kabadiwalaProfile: {
                    select: {
                        businessName: true,
                        serviceArea: true,
                        rating: true,
                        totalReviews: true,
                        totalPickups: true,
                        isVerified: true,
                        rates: true
                    }
                }
            }
        })

        // Merge favorites with kabadiwala data
        const result = favorites.map(fav => ({
            favoriteId: fav.id,
            createdAt: fav.createdAt,
            kabadiwala: kabadiwalas.find(k => k.id === fav.kabadiwalaId)
        }))

        return NextResponse.json(result)
    } catch (error) {
        console.error("Favorites fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
    }
}

// POST: Add to favorites
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { kabadiwalaId } = await request.json()

        if (!kabadiwalaId) {
            return NextResponse.json({ error: "Kabadiwala ID required" }, { status: 400 })
        }

        // Check if kabadiwala exists
        const kabadiwala = await db.user.findUnique({
            where: { id: kabadiwalaId },
            select: { role: true }
        })

        if (!kabadiwala || kabadiwala.role !== "KABADIWALA") {
            return NextResponse.json({ error: "Invalid kabadiwala" }, { status: 400 })
        }

        // Check if already favorited
        const existing = await db.favorite.findUnique({
            where: {
                userId_kabadiwalaId: {
                    userId: user.id,
                    kabadiwalaId
                }
            }
        })

        if (existing) {
            return NextResponse.json({ error: "Already in favorites" }, { status: 409 })
        }

        const favorite = await db.favorite.create({
            data: {
                userId: user.id,
                kabadiwalaId
            }
        })

        return NextResponse.json(favorite, { status: 201 })
    } catch (error) {
        console.error("Favorite create error:", error)
        return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 })
    }
}

// DELETE: Remove from favorites
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const kabadiwalaId = searchParams.get("kabadiwalaId")

        if (!kabadiwalaId) {
            return NextResponse.json({ error: "Kabadiwala ID required" }, { status: 400 })
        }

        await db.favorite.delete({
            where: {
                userId_kabadiwalaId: {
                    userId: user.id,
                    kabadiwalaId
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Favorite delete error:", error)
        return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 })
    }
}

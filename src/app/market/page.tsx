import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MarketList } from "@/components/market/MarketList"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { KabadiwalaCard } from "@/components/kabadiwala-card"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Find Kabadiwala Near You | Sell Scrap Online",
    description: "Locate verified scrap dealers in your area. Check ratings, book pickups, and get the best rates for your scrap.",
}

async function getKabadiwalas() {
    try {
        const kabadiwalas = await db.kabadiwalaProfile.findMany({
            include: { user: true },
            orderBy: { isVerified: 'desc' } // Show verified first, then others
        })
        return kabadiwalas
    } catch (error) {
        return []
    }
}

async function getUserFavorites() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) return []

    const favorites = await db.favorite.findMany({
        where: { userId },
        select: { kabadiwalaId: true }
    })
    return favorites.map(f => f.kabadiwalaId)
}

export default async function MarketPage() {
    const kabadiwalas = await getKabadiwalas()
    const favoriteIds = await getUserFavorites()

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Find a Kabadiwala Nearby</h1>
                <p className="text-muted-foreground">Browse verified scrap dealers in your area</p>
            </div>

            <MarketList initialKabadiwalas={kabadiwalas} favoriteIds={favoriteIds} />
        </div>
    )
}
        </div >
    )
}

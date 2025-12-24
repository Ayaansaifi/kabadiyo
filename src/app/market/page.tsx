import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

            <div className="flex gap-4 mb-8">
                <Input placeholder="Search by area or name..." className="max-w-md" />
                <Button>Search</Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kabadiwalas.length === 0 ? (
                    <p className="col-span-full text-center text-muted-foreground py-12">
                        No verified Kabadiwalas found. Please try seeding the database.
                    </p>
                ) : (
                    kabadiwalas.map((profile) => (
                        <KabadiwalaCard
                            key={profile.id}
                            profile={profile}
                            isFavorited={favoriteIds.includes(profile.userId)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

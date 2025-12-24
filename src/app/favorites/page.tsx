"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Loader2, Package } from "lucide-react"
import { FavoriteCard } from "@/components/favorites"
import Link from "next/link"

interface FavoriteKabadiwala {
    favoriteId: string
    createdAt: string
    kabadiwala: {
        id: string
        name: string | null
        phone: string
        image: string | null
        kabadiwalaProfile?: {
            businessName: string
            serviceArea: string | null
            rating: number
            totalReviews: number
            totalPickups: number
            isVerified: boolean
            rates: string | null
        } | null
    }
}

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<FavoriteKabadiwala[]>([])
    const [loading, setLoading] = useState(true)

    const fetchFavorites = async () => {
        try {
            const res = await fetch("/api/favorites")
            if (res.ok) {
                const data = await res.json()
                setFavorites(data)
            }
        } catch (error) {
            console.error("Failed to fetch favorites:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFavorites()
    }, [])

    if (loading) {
        return (
            <div className="container mx-auto py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
                        My Favorites
                    </h1>
                    <p className="text-muted-foreground">Your saved Kabadiwalas for quick booking</p>
                </div>
                <Link href="/market">
                    <Button>Find More</Button>
                </Link>
            </div>

            {favorites.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No favorites yet</p>
                        <p className="text-sm text-muted-foreground mb-6">
                            Browse the marketplace and add Kabadiwalas to your favorites for quick access
                        </p>
                        <Link href="/market">
                            <Button>
                                <Package className="h-4 w-4 mr-2" />
                                Browse Marketplace
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav) => (
                        <FavoriteCard
                            key={fav.favoriteId}
                            favorite={fav}
                            onRemove={fetchFavorites}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

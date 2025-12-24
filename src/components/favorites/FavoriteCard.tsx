"use client"

import { useState } from "react"
import { Heart, Loader2, Star, MapPin, MessageCircle, Package, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { toast } from "sonner"

interface FavoriteKabadiwala {
    favoriteId: string
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

interface FavoriteCardProps {
    favorite: FavoriteKabadiwala
    onRemove?: () => void
}

export function FavoriteCard({ favorite, onRemove }: FavoriteCardProps) {
    const [removing, setRemoving] = useState(false)
    const k = favorite.kabadiwala
    const profile = k.kabadiwalaProfile

    const handleRemove = async () => {
        setRemoving(true)
        try {
            const res = await fetch(`/api/favorites?kabadiwalaId=${k.id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                toast.success("Removed from favorites")
                onRemove?.()
            } else {
                toast.error("Failed to remove")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setRemoving(false)
        }
    }

    // Parse rates
    let rates: Record<string, number> = {}
    try {
        if (profile?.rates) rates = JSON.parse(profile.rates)
    } catch { }

    return (
        <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                        {k.image ? (
                            <img src={k.image} alt={profile?.businessName || k.name || ""} className="object-cover" />
                        ) : (
                            <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-xl font-bold">
                                {profile?.businessName?.[0] || k.name?.[0] || 'K'}
                            </AvatarFallback>
                        )}
                    </Avatar>


                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    {profile?.businessName || k.name}
                                    {profile?.isVerified && (
                                        <Badge variant="secondary" className="text-xs gap-1">
                                            ✓ Verified
                                        </Badge>
                                    )}
                                </h3>
                                {profile?.serviceArea && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {profile.serviceArea}
                                    </p>
                                )}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleRemove}
                                disabled={removing}
                            >
                                {removing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span className="font-medium">{profile?.rating?.toFixed(1) || "0.0"}</span>
                                <span className="text-muted-foreground">({profile?.totalReviews || 0})</span>
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <Package className="h-4 w-4" />
                                {profile?.totalPickups || 0} pickups
                            </span>
                        </div>

                        {/* Sample Rates */}
                        {Object.keys(rates).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {Object.entries(rates).slice(0, 4).map(([material, price]) => (
                                    <Badge key={material} variant="outline" className="text-xs capitalize">
                                        {material}: ₹{price}/kg
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                            <Link href={`/chat/${k.id}`}>
                                <Button size="sm" variant="outline" className="gap-1">
                                    <MessageCircle className="h-4 w-4" />
                                    Chat
                                </Button>
                            </Link>
                            <Link href={`/book/${k.id}`}>
                                <Button size="sm" className="gap-1">
                                    <Package className="h-4 w-4" />
                                    Book Pickup
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Favorite Toggle Button for Market page
interface FavoriteButtonProps {
    kabadiwalaId: string
    isFavorited?: boolean
    onToggle?: (favorited: boolean) => void
}

export function FavoriteButton({ kabadiwalaId, isFavorited = false, onToggle }: FavoriteButtonProps) {
    const [favorited, setFavorited] = useState(isFavorited)
    const [loading, setLoading] = useState(false)

    const toggle = async () => {
        setLoading(true)
        try {
            if (favorited) {
                const res = await fetch(`/api/favorites?kabadiwalaId=${kabadiwalaId}`, {
                    method: "DELETE"
                })
                if (res.ok) {
                    setFavorited(false)
                    onToggle?.(false)
                    toast.success("Removed from favorites")
                }
            } else {
                const res = await fetch("/api/favorites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ kabadiwalaId })
                })
                if (res.ok) {
                    setFavorited(true)
                    onToggle?.(true)
                    toast.success("Added to favorites!")
                } else if (res.status === 409) {
                    setFavorited(true)
                }
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            disabled={loading}
            className={favorited ? "text-pink-500" : "text-muted-foreground hover:text-pink-500"}
        >
            {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <Heart className={`h-5 w-5 ${favorited ? "fill-current" : ""}`} />
            )}
        </Button>
    )
}
